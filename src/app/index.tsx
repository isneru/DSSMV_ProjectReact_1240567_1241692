import { Theme, useTheme } from '@react-navigation/native'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { NoteLink, WeekRow } from '~/components'
import { notes } from '~/lib/mock'
import { useAuth } from '~/lib/providers'
import { sizes } from '~/lib/theme'

export default function Index() {
	const theme = useTheme()
	const { session } = useAuth()

	return (
		<View style={styles(theme).container}>
			<View style={styles(theme).hero}>
				<View style={styles(theme).greet}>
					<Text style={styles(theme).textGreet}>Good Morning,</Text>
					<Text style={styles(theme).textGreet}>
						{session?.user.name ?? 'Local user'}
					</Text>
				</View>
				<View style={styles(theme).weather}>
					<Text style={styles(theme).textWeather}>25</Text>
					<Text style={styles(theme).textWeather}>Porto</Text>
				</View>
			</View>
			<WeekRow />
			<FlatList
				data={notes}
				keyExtractor={item => item.id}
				renderItem={({ item }) => <NoteLink note={item} />}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={false} onRefresh={() => {}} />
				}
			/>
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
			paddingVertical: 8,
			paddingHorizontal: 12
		},
		weather: {
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
