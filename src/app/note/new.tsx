import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from '@react-navigation/native'
import { Href, useRouter } from 'expo-router'
import { CalendarBlankIcon, ClockIcon, TagIcon } from 'phosphor-react-native'
import { useState } from 'react'
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

export default function NewNoteScreen() {
	const router = useRouter()
	const theme = useTheme()
	const { addNote } = useNotes()

	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [tag, setTag] = useState('')
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

	const onChangeDate = (event: any, selectedDate?: Date) => {
		const currentDate = selectedDate || date
		setShowDatePicker(Platform.OS === 'ios')
		setDate(currentDate)
		if (Platform.OS === 'android') setShowDatePicker(false)
	}

	const onChangeTime = (event: any, selectedTime?: Date) => {
		const currentTime = selectedTime || time
		setShowTimePicker(Platform.OS === 'ios')
		setTime(currentTime)
		if (Platform.OS === 'android') setShowTimePicker(false)
	}

	const formatDate = (date: Date) => {
		return date.toLocaleDateString('pt-PT', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		})
	}

	const formatTime = (time: Date) => {
		return time.toLocaleTimeString('pt-PT', {
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const handleSave = async () => {
		if (!title.trim() && !content.trim()) return

		setIsSubmitting(true)

		try {
			let dueData = undefined
			if (date) {
				const year = date.getFullYear()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				const dateString = `${year}-${month}-${day}`

				let finalDueString = dateString

				if (time) {
					const hours = String(time.getHours()).padStart(2, '0')
					const minutes = String(time.getMinutes()).padStart(2, '0')
					finalDueString = `${dateString}T${hours}:${minutes}:00`
				}

				dueData = {
					dateOnly: dateString,
					dateTime: finalDueString,
					dueString: finalDueString
				}
			}

			await addNote({
				title,
				content,
				priority: 1,
				label: tag || 'Uncategorized',
				// @ts-ignore
				tag: tag,
				due: dueData as any
			})
			handleBack()
		} catch (error) {
			console.error('Failed to create note:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const styles = createStyles(theme)

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
						placeholderTextColor={theme.colors.text + '80'}
						value={title}
						onChangeText={setTitle}
						autoFocus
					/>

					{/* Chips Row: Tag, Data and Hour */}
					<View style={styles.chipsRow}>
						{/* Chip Tag */}
						<View style={styles.chip}>
							<TagIcon size={16} color={theme.colors.primary} weight='fill' />
							<TextInput
								value={tag}
								onChangeText={setTag}
								placeholder='Tag...'
								placeholderTextColor={theme.colors.border}
								style={styles.chipInput}
							/>
						</View>

						{/* Chip Data */}
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

						{/* Chip Hour*/}
						<TouchableOpacity
							style={styles.chip}
							onPress={() => setShowTimePicker(true)}>
							<ClockIcon size={16} color={theme.colors.primary} weight='fill' />
							<Text style={styles.chipText}>
								{time ? formatTime(time) : 'Add Time'}
							</Text>
						</TouchableOpacity>

						{/* Date Picker */}
						{showDatePicker && (
							<DateTimePicker
								value={date || new Date()}
								mode='date'
								display='default'
								onChange={onChangeDate}
								themeVariant={theme.dark ? 'dark' : 'light'}
							/>
						)}
						{/* Time Picker */}
						{showTimePicker && (
							<DateTimePicker
								value={time || new Date()}
								mode='time' // Modo tempo
								display='default'
								onChange={onChangeTime}
								themeVariant={theme.dark ? 'dark' : 'light'}
							/>
						)}
					</View>

					<TextInput
						style={styles.contentInput}
						placeholder='Note'
						placeholderTextColor={theme.colors.text + '80'}
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

const createStyles = (theme: any) =>
	StyleSheet.create({
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
