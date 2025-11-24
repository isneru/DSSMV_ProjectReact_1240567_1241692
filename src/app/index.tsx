import { useTheme } from '@react-navigation/native'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { NoteLink, WeekRow } from '~/components'
import { notes } from '~/lib/mock'

export default function HomeScreen() {
	const theme = useTheme()

	return (
		<View>
			<View style={styles.hero}>
				<View style={styles.greet}>
					<Text style={{ color: theme.colors.text }}>Good Morning,</Text>
					<Text style={{ color: theme.colors.text }}>User</Text>
				</View>
				<View style={styles.weather}>
					<Text style={{ color: theme.colors.text }}>25</Text>
					<Text style={{ color: theme.colors.text }}>Porto</Text>
				</View>
			</View>
			<WeekRow />
			<ScrollView>
				{notes.map(note => (
					<NoteLink key={note.id} note={note} />
				))}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	hero: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	greet: {
		flexDirection: 'column'
	},
	weather: {
		flexDirection: 'column'
	}
})
