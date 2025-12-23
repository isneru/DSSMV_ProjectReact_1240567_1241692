import { useTheme, type Theme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { Badge } from '~/components'
import { useAlert } from '~/lib/context/alert/provider'
import { useNotes } from '~/lib/context/notes/provider'
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

	function handleDelete() {
		showAlert('Confirm Delete', 'Are you sure you want to delete this note?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: () => deleteNote(note.id)
			}
		])
	}

	return (
		<TouchableOpacity
			onPress={() =>
				router.navigate({ pathname: '/note/[id]', params: { id: note.id } })
			}
			onLongPress={handleDelete}
			activeOpacity={0.8}
			style={styles.container}>
			<Text style={styles.title}>{note.title}</Text>
			{note.label && (
				<Badge
					containerStyle={{
						width: note.label.length * 8 + 12,
						maxWidth: '33%'
					}}
					label={note.label}
				/>
			)}
		</TouchableOpacity>
	)
}

const createStyles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			paddingHorizontal: 12,
			paddingVertical: 16,
			borderRadius: 12,
			backgroundColor: theme.colors.card,
			borderColor: theme.colors.border,
			borderWidth: 1,
			justifyContent: 'space-between',
			flexDirection: 'row',
			alignItems: 'center'
		},
		title: {
			color: theme.colors.text,
			fontSize: 18
		}
	})
}
