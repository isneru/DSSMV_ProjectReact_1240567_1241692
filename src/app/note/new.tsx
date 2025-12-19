import DateTimePicker, {
	DateTimePickerEvent
} from '@react-native-community/datetimepicker'
import { Theme, useTheme } from '@react-navigation/native'
import { Href, useRouter } from 'expo-router'
import { CalendarBlankIcon, ClockIcon, TagIcon } from 'phosphor-react-native'
import { useMemo, useState } from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNotes } from '~/lib/providers/notes-provider'
import { rgbOpacity } from '~/lib/utils'

export default function NewNoteScreen() {
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme), [theme])
	const router = useRouter()
	const { addNote } = useNotes()

	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [label, setLabel] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [date, setDate] = useState<Date | undefined>(undefined)
	const [time, setTime] = useState<Date | undefined>(undefined)

	const [showDatePicker, setShowDatePicker] = useState(false)
	const [showTimePicker, setShowTimePicker] = useState(false)

	const handleBack = () => {
		if (router.canGoBack()) {
			router.back()
		} else {
			router.replace('/' as Href)
		}
	}

	const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
		if (event.type === 'dismissed') {
			setShowDatePicker(false)
			return
		}

		const currentDate = selectedDate || date
		setShowDatePicker(Platform.OS === 'ios')
		setDate(currentDate)

		if (Platform.OS === 'android') setShowDatePicker(false)
	}

	const onChangeTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
		if (event.type === 'dismissed') {
			setShowTimePicker(false)
			return
		}

		const currentTime = selectedTime || time
		setShowTimePicker(Platform.OS === 'ios')
		setTime(currentTime)
		if (Platform.OS === 'android') setShowTimePicker(false)
	}

	const formatDate = (d: Date) => {
		return d.toLocaleDateString('pt-PT', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		})
	}

	const formatTime = (t: Date) => {
		return t.toLocaleTimeString('pt-PT', {
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const handleSave = async () => {
		if (!title.trim() && !content.trim()) return

		setIsSubmitting(true)

		try {
			let finalDate: Date | null = null

			if (date) {
				finalDate = new Date(date)
				if (time) {
					finalDate.setHours(time.getHours())
					finalDate.setMinutes(time.getMinutes())
					finalDate.setSeconds(0)
				}
			}

			await addNote({
				title,
				content,
				label,
				due: finalDate
			})

			handleBack()
		} catch (error) {
			console.error('Failed to create note:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<SafeAreaView style={styles.container} edges={['bottom']}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardView}>
				<View style={styles.header}>
					<TouchableOpacity onPress={handleBack}>
						<Text style={styles.cancelButton}>Cancel</Text>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>New Note</Text>
					<TouchableOpacity
						onPress={handleSave}
						disabled={isSubmitting || (!title.trim() && !content.trim())}>
						<Text
							style={[
								styles.saveButton,
								!title.trim() && !content.trim() && styles.disabledButton
							]}>
							Save
						</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.content}>
					<TextInput
						style={styles.titleInput}
						placeholder='Title'
						placeholderTextColor={rgbOpacity(theme.colors.text, 0.8)}
						value={title}
						onChangeText={setTitle}
						autoFocus
					/>

					<View style={styles.chipsRow}>
						<View style={styles.chip}>
							<TagIcon size={16} color={theme.colors.primary} weight='fill' />
							<TextInput
								value={label}
								onChangeText={setLabel}
								placeholder='Label'
								placeholderTextColor={theme.colors.border}
								style={styles.chipInput}
							/>
						</View>

						<TouchableOpacity
							style={styles.chip}
							onPress={() => setShowDatePicker(true)}>
							<CalendarBlankIcon
								size={16}
								color={theme.colors.primary}
								weight='fill'
							/>
							<Text style={styles.chipText}>
								{date ? formatDate(date) : 'Add Date'}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.chip}
							onPress={() => setShowTimePicker(true)}>
							<ClockIcon size={16} color={theme.colors.primary} weight='fill' />
							<Text style={styles.chipText}>
								{time ? formatTime(time) : 'Add Time'}
							</Text>
						</TouchableOpacity>

						{showDatePicker && (
							<DateTimePicker
								value={date || new Date()}
								mode='date'
								display='default'
								onChange={onChangeDate}
								themeVariant={theme.dark ? 'dark' : 'light'}
							/>
						)}
						{showTimePicker && (
							<DateTimePicker
								value={time || new Date()}
								mode='time'
								display='default'
								onChange={onChangeTime}
								themeVariant={theme.dark ? 'dark' : 'light'}
							/>
						)}
					</View>

					<TextInput
						style={styles.contentInput}
						placeholder='Note'
						placeholderTextColor={rgbOpacity(theme.colors.text, 0.8)}
						value={content}
						onChangeText={setContent}
						multiline
						textAlignVertical='top'
					/>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

const createStyles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.colors.background
		},
		keyboardView: {
			flex: 1
		},
		header: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingHorizontal: 16,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: theme.colors.border
		},
		headerTitle: {
			fontSize: 17,
			fontWeight: '600',
			color: theme.colors.text
		},
		cancelButton: {
			fontSize: 17,
			color: theme.colors.primary
		},
		saveButton: {
			fontSize: 17,
			fontWeight: '600',
			color: theme.colors.primary
		},
		disabledButton: {
			opacity: 0.5
		},
		content: {
			flex: 1,
			padding: 16
		},
		titleInput: {
			fontSize: 24,
			fontWeight: 'bold',
			color: theme.colors.text,
			marginBottom: 8
		},
		chipsRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			marginBottom: 16,
			flexWrap: 'wrap'
		},
		chip: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			paddingVertical: 4,
			borderRadius: 4
		},
		chipInput: {
			color: theme.colors.primary,
			fontSize: 14,
			padding: 0,
			minWidth: 50
		},
		chipText: {
			color: theme.colors.primary,
			fontSize: 14,
			fontWeight: '600'
		},
		contentInput: {
			flex: 1,
			fontSize: 16,
			color: theme.colors.text,
			lineHeight: 24
		}
	})
}
