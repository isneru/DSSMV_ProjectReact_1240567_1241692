import { useTheme, type Theme } from '@react-navigation/native'
import { StyleSheet, Text, View } from 'react-native'
import { sizes } from '~/lib/theme'
import type { Note } from '~/lib/types'

type Props = {
	note: Note
}

export const NoteLink = ({ note }: Props) => {
	const theme = useTheme()

	return (
		<View style={styles(theme).container}>
			<Text style={styles(theme).title}>{note.title}</Text>
		</View>
	)
}

const styles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			padding: 8,
			marginBottom: 8,
			borderRadius: 12,
			backgroundColor: theme.colors.card
		},
		title: {
			color: theme.colors.text,
			fontSize: sizes.md
		}
	})
}
