import { useTheme, type Theme } from '@react-navigation/native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
	FloppyDiskBackIcon,
	NewspaperIcon,
	PencilIcon
} from 'phosphor-react-native'
import { useEffect, useMemo, useState } from 'react'
import {
	Linking,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { Markdown, themes } from 'react-native-remark'
import { useNotes } from '~/lib/providers/notes-provider'
import { sizes } from '~/lib/theme'

export default function NoteScreen() {
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme), [theme])
	const { id } = useLocalSearchParams<{ id: string }>()
	const { notes, updateNote, isLoading } = useNotes()
	const router = useRouter()

	const note = notes.find(note => note.id === id)

	useEffect(() => {
		if (!note) {
			router.replace('/')
		}
	}, [note, router])

	const [isEditing, setIsEditing] = useState(false)
	const [content, setContent] = useState(note?.content ?? '')
	const [title, setTitle] = useState(note?.title ?? '')

	useEffect(() => {
		if (note) {
			setTitle(note.title)
			setContent(note.content)
		}
	}, [note])

	async function handleSaveNoteClick() {
		if (!note) return

		await updateNote(note.id, {
			title,
			content
		})

		router.back()
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TextInput
					editable={isEditing}
					style={styles.title}
					value={title}
					onChangeText={setTitle}
				/>

				<View style={styles.actions}>
					<TouchableOpacity
						style={styles.button}
						onPress={() => setIsEditing(isEditing => !isEditing)}>
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
						style={styles.button}
						onPress={handleSaveNoteClick}
						disabled={isLoading}>
						<FloppyDiskBackIcon
							weight='fill'
							size={20}
							color={isLoading ? theme.colors.notification : theme.colors.text}
						/>
					</TouchableOpacity>
				</View>
			</View>

			{isEditing ? (
				<TextInput
					style={styles.input}
					value={content}
					onChangeText={setContent}
					multiline={true}
					autoFocus={true}
				/>
			) : (
				<View style={styles.mdContainer}>
					<Markdown
						theme={themes.defaultTheme}
						markdown={content}
						onLinkPress={url => Linking.openURL(url)}
					/>
				</View>
			)}
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
			paddingHorizontal: 8,
			flexDirection: 'row',
			gap: 4,
			justifyContent: 'space-between',
			alignItems: 'center',
			borderBottomWidth: 1,
			borderBottomColor: theme.colors.border
		},
		title: {
			color: theme.colors.text,
			flex: 1,
			fontSize: sizes.xl - 4,
			fontWeight: 'bold'
		},
		actions: {
			flexDirection: 'row',
			gap: 6
		},
		button: {
			padding: 8,
			backgroundColor: theme.colors.card,
			borderWidth: 1,
			borderColor: theme.colors.border,
			borderRadius: 8
		},
		input: {
			color: theme.colors.text,
			fontSize: sizes.md,
			flex: 1,
			textAlignVertical: 'top',
			padding: 12
		},
		mdContainer: { flex: 1, paddingHorizontal: 12, paddingTop: 8 }
	})
}
