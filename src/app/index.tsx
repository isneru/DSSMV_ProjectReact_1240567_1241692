import { Theme, useTheme } from '@react-navigation/native'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { NoteLink, WeekRow } from '~/components'
import { notes } from '~/lib/mock'
import { sizes } from '~/lib/theme'

export default function HomeScreen() {
	const theme = useTheme()

	return (
		<View style={styles(theme).container}>
			<View style={styles(theme).hero}>
				<View style={styles(theme).greet}>
					<Text style={styles(theme).textGreet}>Good Morning,</Text>
					<Text style={styles(theme).textGreet}>User</Text>
				</View>
				<View style={styles(theme).weather}>
					<Text style={styles(theme).textWeather}>25</Text>
					<Text style={styles(theme).textWeather}>Porto</Text>
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

const styles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			padding: 12,
			gap: 12
		},
		hero: {
			flexDirection: 'row',
			justifyContent: 'space-between'
		},
		greet: {
			flexDirection: 'column'
		},
		weather: {
			flexDirection: 'column',
			borderRadius: 8,
			paddingVertical: 8,
			paddingHorizontal: 12,
			backgroundColor: theme.colors.card,
			borderColor: theme.colors.border,
			borderWidth: 1
		},
		textGreet: {
			color: theme.colors.text,
			fontSize: sizes.md
		},
		textWeather: {
			color: theme.colors.text,
			fontSize: sizes.md
		}
	})
}
