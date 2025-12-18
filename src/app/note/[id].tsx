import DateTimePicker from '@react-native-community/datetimepicker'
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
import { useNotes } from '~/lib/providers/notes-provider'
import { sizes } from '~/lib/theme'

export default function NoteScreen() {
	const theme = useTheme()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { notes, updateNote, isLoading } = useNotes()
	const router = useRouter()

	const note = notes.find(note => note.id === id)

	useEffect(() => {
		if (!isLoading && !note) {
			router.replace('/')
		}
	}, [isLoading, note, router])

	const [isEditing, setIsEditing] = useState(false)
	const [content, setContent] = useState(note?.content ?? '')
	const [title, setTitle] = useState(note?.title ?? '')
	const [label, setLabel] = useState(note?.label ?? '')

	const [date, setDate] = useState<Date | undefined>(
		note?.due?.dateOnly ? new Date(note.due.dateOnly) : undefined
	)
	// Tenta obter a hora se existir dateTime, senão undefined
	const [time, setTime] = useState<Date | undefined>(
		note?.due?.dateTime && note.due.dateTime.includes('T')
			? new Date(note.due.dateTime)
			: undefined
	)

	const [showDatePicker, setShowDatePicker] = useState(false)
	const [showTimePicker, setShowTimePicker] = useState(false)

	useEffect(() => {
		if (note) {
			setTitle(note.title)
			setContent(note.content)
			setLabel(note.label)

			// Atualiza Data e Hora ao carregar
			if (note.due?.dateOnly) {
				setDate(new Date(note.due.dateOnly))
			}
			if (note.due?.dateTime && note.due.dateTime.includes('T')) {
				setTime(new Date(note.due.dateTime))
			}
		}
	}, [note])

	const { styles, markdownTheme } = useMemo(() => {
		const styles = createStyles(theme)
		const mdTheme = {
			...themes.defaultTheme,
			paragraph: {
				color: theme.colors.text,
				fontSize: sizes.md,
				lineHeight: sizes.md * 1.5
			},
			listItem: {
				color: theme.colors.text,
				fontSize: sizes.md,
				lineHeight: sizes.md * 1.5
			}
		}
		return { styles, markdownTheme: mdTheme }
	}, [theme])

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

	async function handleSaveNoteClick() {
		if (!note) return

		let dueData = {
			dateOnly: '',
			dateTime: '',
			dueString: ''
		}

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

		const updatePayload = {
			title,
			content,
			label,
			due: dueData
		}

		await updateNote(note.id, updatePayload)
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
									value={label}
									onChangeText={setLabel}
									placeholder='Tag...'
									placeholderTextColor={theme.colors.border}
									style={styles.chipInput}
								/>
							) : (
								<Text style={styles.chipText}>
									{label.trim() === '' ? 'Unlabeled' : label}
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
								mode='time' // Modo tempo
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
			fontSize: sizes.xl,
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
			fontSize: sizes.sm,
			padding: 0,
			minWidth: 50
		},
		chipText: {
			color: theme.colors.primary,
			fontSize: sizes.sm,
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
			fontSize: sizes.md,
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
