import { useTheme, type Theme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useAlert } from '~/lib/providers/alert-provider'
import { useNotes } from '~/lib/providers/notes-provider'
import { sizes } from '~/lib/theme'
import type { Note } from '~/lib/types'

type Props = {
	note: Note
}

export const NoteLink = ({ note }: Props) => {
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme), [theme])
	const router = useRouter()
	const { deleteNote } = useNotes()
	const { showAlert } = useAlert()

	return (
		<TouchableOpacity
			onPress={() =>
				router.navigate({ pathname: '/note/[id]', params: { id: note.id } })
			}
			onLongPress={() => {
				showAlert(
					'Confirm Delete',
					'Are you sure you want to delete this note?',
					[
						{ text: 'Cancel', style: 'cancel' },
						{
							text: 'Delete',
							style: 'destructive',
							onPress: () => deleteNote(note.id)
						}
					]
				)
			}}
			activeOpacity={0.8}
			style={styles.container}>
			<Text style={styles.title}>{note.title}</Text>
		</TouchableOpacity>
	)
}

const createStyles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			paddingHorizontal: 12,
			paddingVertical: 16,
			marginBottom: 8,
			borderRadius: 12,
			backgroundColor: theme.colors.card,
			borderColor: theme.colors.border,
			borderWidth: 1
		},
		title: {
			color: theme.colors.text,
			fontSize: sizes.md
		}
	})
}
