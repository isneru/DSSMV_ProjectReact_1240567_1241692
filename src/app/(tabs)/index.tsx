import { Theme, useTheme } from '@react-navigation/native'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { NoteLink, WeekRow } from '~/components'
import { useAuth } from '~/lib/providers/auth-provider'
import { useNotes } from '~/lib/providers/notes-provider'
import { useWeather } from '~/lib/providers/weather-provider'
import { sizes } from '~/lib/theme'

export default function Index() {
	const { notes, isLoading, getNotes } = useNotes()
	const { session } = useAuth()
	const theme = useTheme()
	const { isLoading: isWeatherLoading, weather } = useWeather()

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
					<Text style={styles(theme).textWeather}>
						{`${weather?.temperature}°`}
					</Text>
					<Text style={styles(theme).textWeather}>{weather?.city}</Text>
				</View>
			</View>
			<WeekRow />
			<FlatList
				data={notes}
				keyExtractor={item => item.id}
				renderItem={({ item }) => <NoteLink note={item} />}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isLoading}
						tintColor={theme.colors.background}
						progressBackgroundColor={theme.colors.primary}
						colors={[theme.colors.background]}
						onRefresh={getNotes}
					/>
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
