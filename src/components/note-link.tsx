import { StyleSheet, Text, View } from 'react-native'
import type { Note } from '~/lib/types'

type Props = {
	note: Note
}

export const NoteLink = ({ note }: Props) => {
	return (
		<View style={styles.container}>
			<Text>{note.title}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		padding: 8
	}
})
