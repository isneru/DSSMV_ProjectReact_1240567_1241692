import DateTimePicker, {
	DateTimePickerEvent
} from '@react-native-community/datetimepicker'
import { useTheme, type Theme } from '@react-navigation/native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
	CalendarBlankIcon,
	ClockIcon,
	FloppyDiskBackIcon,
	NewspaperIcon,
	PencilIcon,
	TagIcon
} from 'phosphor-react-native'
import { useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Linking,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { Markdown, themes } from 'react-native-remark'
import { useNotes } from '~/lib/context/notes/provider'
import { Note } from '~/lib/types/notes'

export default function NoteScreen() {
	const theme = useTheme()
	const router = useRouter()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { notes, updateNote, isLoading } = useNotes()

	const [isEditing, setIsEditing] = useState(false)
	const [showDatePicker, setShowDatePicker] = useState(false)
	const [showTimePicker, setShowTimePicker] = useState(false)
	const [content, setContent] = useState<Note['content']>('')
	const [title, setTitle] = useState<Note['title']>('')
	const [label, setLabel] = useState<Note['label']>('')
	const [date, setDate] = useState<Date | undefined>(undefined)
	const [time, setTime] = useState<Date | undefined>(undefined)

	const note = notes.find(note => note.id === id)

	useEffect(() => {
		if (!isLoading && !note) {
			router.replace('/')
			return
		}

		if (note) {
			setTitle(note.title)
			setContent(note.content)
			setLabel(note.label)
			if (note.due) {
				setDate(note.due)
				setTime(note.due)
			}
		}
	}, [note, isLoading, router])

	const { styles, markdownTheme } = useMemo(() => {
		const styles = createStyles(theme)
		const markdownTheme = {
			...themes.defaultTheme,
			paragraph: {
				color: theme.colors.text,
				fontSize: 18,
				lineHeight: 18 * 1.5
			},
			listItem: {
				color: theme.colors.text,
				fontSize: 18,
				lineHeight: 18 * 1.5
			}
		}
		return { styles, markdownTheme }
	}, [theme])

	const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
		if (event.type === 'dismissed') {
			setShowDatePicker(false)
			return
		}

		const currentDate = selectedDate || date
		setShowDatePicker(Platform.OS === 'ios')
		setDate(currentDate)

		if (currentDate && !time) {
			setTime(currentDate)
		}

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

	const formatDate = (date: Date) => {
		return date.toLocaleDateString('pt-PT', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		})
	}

	const formatTime = (time: Date) => {
		return time.toLocaleTimeString('pt-PT', {
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	function handleSaveNoteClick() {
		if (!note) return

		let finalDate: Date | null = null

		if (date) {
			finalDate = new Date(date)
			if (time) {
				finalDate.setHours(time.getHours())
				finalDate.setMinutes(time.getMinutes())
				finalDate.setSeconds(0)
			}
		}

		const newNote: Note = {
			...note,
			title,
			content,
			label,
			due: finalDate
		}
		console.log('Saving note:', newNote)
		updateNote(note.id, newNote)
		setIsEditing(false)
	}

	if (isLoading || !note) {
		return (
			<View
				style={[
					styles.container,
					{ justifyContent: 'center', alignItems: 'center' }
				]}>
				<ActivityIndicator size='large' color={theme.colors.primary} />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={{ flex: 1 }}>
					<TextInput
						editable={isEditing}
						style={styles.title}
						value={title}
						onChangeText={setTitle}
						placeholder='Título'
						placeholderTextColor={theme.colors.border}
					/>

					<View style={styles.chipsRow}>
						<View style={styles.chip}>
							<TagIcon size={16} color={theme.colors.primary} weight='fill' />
							{isEditing ? (
								<TextInput
									value={label ?? 'Unlabeled'}
									onChangeText={setLabel}
									placeholder='Label'
									placeholderTextColor={theme.colors.border}
									style={styles.chipInput}
								/>
							) : (
								<Text style={styles.chipText}>
									{label?.trim() === '' ? 'Unlabeled' : label}
								</Text>
							)}
						</View>

						<TouchableOpacity
							style={styles.chip}
							onPress={() => isEditing && setShowDatePicker(true)}
							disabled={!isEditing}>
							<CalendarBlankIcon
								size={16}
								color={theme.colors.primary}
								weight='fill'
							/>
							<Text style={styles.chipText}>
								{date ? formatDate(date) : 'No date'}
							</Text>
						</TouchableOpacity>

						{(isEditing || time) && (
							<TouchableOpacity
								style={styles.chip}
								onPress={() => isEditing && setShowTimePicker(true)}
								disabled={!isEditing}>
								<ClockIcon
									size={16}
									color={theme.colors.primary}
									weight='fill'
								/>
								<Text style={styles.chipText}>
									{time ? formatTime(time) : 'Hour'}
								</Text>
							</TouchableOpacity>
						)}

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
				</View>

				<View style={styles.actions}>
					<TouchableOpacity
						style={styles.button}
						onPress={() => setIsEditing(prev => !prev)}>
						{isEditing ? (
							<NewspaperIcon
								weight='bold'
								size={20}
								color={theme.colors.text}
							/>
						) : (
							<PencilIcon weight='bold' size={20} color={theme.colors.text} />
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.button, isLoading && { opacity: 0.5 }]}
						onPress={handleSaveNoteClick}
						disabled={isLoading}>
						<FloppyDiskBackIcon
							weight='fill'
							size={20}
							color={theme.colors.text}
						/>
					</TouchableOpacity>
				</View>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
					keyboardShouldPersistTaps='handled'>
					{isEditing ? (
						<TextInput
							style={styles.input}
							value={content}
							onChangeText={setContent}
							multiline={true}
							textAlignVertical='top'
							autoFocus={false}
							scrollEnabled={false}
						/>
					) : (
						<View style={styles.mdContainer}>
							<Markdown
								theme={markdownTheme}
								markdown={content}
								onLinkPress={url => Linking.openURL(url)}
							/>
						</View>
					)}
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	)
}

const createStyles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.colors.background
		},
		header: {
			paddingHorizontal: 16,
			paddingVertical: 12,
			flexDirection: 'row',
			gap: 12,
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			borderBottomWidth: 1,
			borderBottomColor: theme.colors.border
		},
		title: {
			color: theme.colors.text,
			fontSize: 32,
			fontWeight: 'bold',
			marginBottom: 4
		},
		chipsRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
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
			fontSize: 12,
			padding: 0,
			minWidth: 50
		},
		chipText: {
			color: theme.colors.primary,
			fontSize: 12,
			fontWeight: '600'
		},
		actions: {
			flexDirection: 'row',
			gap: 8,
			paddingTop: 4
		},
		button: {
			padding: 10,
			backgroundColor: theme.colors.card,
			borderWidth: 1,
			borderColor: theme.colors.border,
			borderRadius: 8,
			alignItems: 'center',
			justifyContent: 'center'
		},
		input: {
			color: theme.colors.text,
			fontSize: 18,
			flex: 1,
			textAlignVertical: 'top',
			padding: 16,
			minHeight: 300
		},
		mdContainer: {
			flex: 1,
			paddingHorizontal: 16,
			paddingTop: 16
		}
	})
}
