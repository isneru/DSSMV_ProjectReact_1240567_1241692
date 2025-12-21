import { Theme, useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import {
	FloppyDiskBackIcon,
	NewspaperIcon,
	PencilIcon
} from 'phosphor-react-native'
import { useMemo, useState } from 'react'
import {
	KeyboardAvoidingView,
	Linking,
	Platform,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { Markdown, themes as mdThemes } from 'react-native-remark'
import { DatePicker, LabelPicker, TimePicker } from '~/components'
import { useNotes } from '~/lib/context/notes/provider'
import { Note } from '~/lib/types'

export default function NewNoteScreen() {
	const theme = useTheme()
	const { styles, markdownTheme } = useMemo(() => {
		const styles = createStyles(theme)
		const markdownTheme = mdTheme(theme)
		return { styles, markdownTheme }
	}, [theme])
	const router = useRouter()
	const { addNote, isLoading } = useNotes()

	const [isEditing, setIsEditing] = useState(true)

	const [title, setTitle] = useState<Note['title']>('')
	const [content, setContent] = useState<Note['content']>('')
	const [label, setLabel] = useState<Note['label']>(null)
	const [due, setDue] = useState<Note['due']>(null)

	function handleSaveNoteClick() {
		if (!title.trim()) return

		addNote({
			title,
			content,
			label,
			due
		})
		setIsEditing(false)
		router.push('/')
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TextInput
					editable={isEditing}
					style={styles.title}
					value={title ?? 'Title'}
					onChangeText={setTitle}
					placeholder='Title'
					placeholderTextColor={theme.colors.border}
				/>

				<View style={styles.actions}>
					<TouchableOpacity
						style={styles.button}
						onPress={() => setIsEditing(val => !val)}>
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

			<ScrollView
				style={{ flexGrow: 0 }}
				contentContainerStyle={{ alignItems: 'center' }}
				horizontal
				showsHorizontalScrollIndicator={false}>
				<View style={styles.badgesRow}>
					<LabelPicker
						label={label}
						setLabel={setLabel}
						isEditing={isEditing}
					/>
					<DatePicker due={due} setDue={setDue} isEditing={isEditing} />
					<TimePicker due={due} setDue={setDue} isEditing={isEditing} />
				</View>
			</ScrollView>

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
			backgroundColor: theme.colors.background,
			padding: 12,
			gap: 12
		},
		header: {
			flexDirection: 'row',
			gap: 12,
			justifyContent: 'space-between',
			alignItems: 'center'
		},
		title: {
			color: theme.colors.text,
			fontSize: 28,
			fontWeight: 'bold'
		},
		badgesRow: {
			flexDirection: 'row',
			alignItems: 'center',
			flexWrap: 'nowrap'
		},
		actions: {
			flexDirection: 'row',
			gap: 8
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

const mdTheme = (theme: Theme) => {
	return {
		...mdThemes.defaultTheme,
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
}
