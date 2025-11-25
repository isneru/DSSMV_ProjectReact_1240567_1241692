import { useTheme, type Theme } from '@react-navigation/native'
import { useLocalSearchParams } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { useNotes } from '~/lib/providers/notes-provider'
import { sizes } from '~/lib/theme'

export default function NoteScreen() {
	const theme = useTheme()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { notes } = useNotes()

	const note = notes.find(note => note.id === id)

	return (
		<View style={styles(theme).container}>
			<Text style={styles(theme).title}>{note?.title}</Text>
			<Text style={styles(theme).content}>{note?.content}</Text>
		</View>
	)
}

const styles = (theme: Theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			padding: 12,
			backgroundColor: theme.colors.background
		},
		title: {
			color: theme.colors.text,
			fontSize: sizes.xl,
			fontWeight: 'bold',
			marginBottom: 12
		},
		content: {
			color: theme.colors.text,
			fontSize: sizes.md,
			marginBottom: 12
		}
	})
