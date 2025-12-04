import { Theme, useTheme } from '@react-navigation/native'
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableWithoutFeedback,
	View
} from 'react-native'
import { useWeather } from '~/lib/providers/weather-provider'
import { sizes } from '~/lib/theme'

export const WeatherWidget = () => {
	const { weather, refetch, isLoading } = useWeather()
	const theme = useTheme()

	return (
		<TouchableWithoutFeedback onPress={refetch} disabled={isLoading}>
			<View style={styles(theme).weather}>
				<Text style={styles(theme).textTemp}>{`${weather?.temperature}°`}</Text>
				<Text style={styles(theme).textWeather}>{weather?.city}</Text>
				{isLoading && (
					<ActivityIndicator
						style={styles(theme).loading}
						size='small'
						color={theme.colors.primary}
					/>
				)}
			</View>
		</TouchableWithoutFeedback>
	)
}

const styles = (theme: Theme) => {
	return StyleSheet.create({
		weather: {
			borderRadius: 8,
			paddingVertical: 8,
			paddingHorizontal: 12,
			backgroundColor: theme.colors.card,
			borderColor: theme.colors.border,
			borderWidth: 1,
			position: 'relative'
		},
		loading: {
			backgroundColor: theme.colors.card,
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: 8
		},
		textTemp: {
			color: theme.colors.text,
			fontSize: sizes.md,
			fontWeight: 'bold'
		},
		textWeather: {
			color: theme.colors.text,
			fontSize: sizes.md - 2
		}
	})
}
