import { Theme, useTheme } from '@react-navigation/native'
import {
	CloudFogIcon,
	CloudIcon,
	CloudLightningIcon,
	CloudRainIcon,
	CloudSnowIcon,
	CloudSunIcon,
	SunIcon,
	WindIcon,
	type Icon
} from 'phosphor-react-native'
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableWithoutFeedback,
	View
} from 'react-native'
import { useWeather } from '~/lib/providers/weather-provider'
import { sizes } from '~/lib/theme'

const weatherIcons: Record<string, Icon> = {
	Clear: SunIcon,
	Clouds: CloudIcon,
	Rain: CloudRainIcon,
	Drizzle: CloudRainIcon,
	Thunderstorm: CloudLightningIcon,
	Snow: CloudSnowIcon,
	Mist: CloudFogIcon,
	Smoke: CloudFogIcon,
	Haze: CloudFogIcon,
	Dust: CloudFogIcon,
	Fog: CloudFogIcon,
	Sand: WindIcon,
	Ash: CloudFogIcon,
	Squall: WindIcon,
	Tornado: WindIcon
}

export const WeatherWidget = () => {
	const { weather, refetch, isLoading } = useWeather()
	const theme = useTheme()

	const CurrentIcon = weather?.condition
		? weatherIcons[weather.condition] || CloudSunIcon
		: CloudSunIcon

	return (
		<TouchableWithoutFeedback onPress={refetch} disabled={isLoading}>
			<View style={styles(theme).weather}>
				<View style={styles(theme).contentContainer}>
					<CurrentIcon color={theme.colors.text} size={24} weight='regular' />
					<View>
						<Text style={styles(theme).textTemp}>
							{weather?.temperature ? `${weather.temperature}°` : '--'}
						</Text>
						<Text style={styles(theme).textCity}>
							{weather?.city || 'Loading...'}
						</Text>
					</View>
				</View>

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
			borderRadius: 12,
			paddingVertical: 8,
			paddingHorizontal: 12,
			backgroundColor: theme.colors.card,
			borderColor: theme.colors.border,
			borderWidth: 1,
			position: 'relative',
			minWidth: 100,
			justifyContent: 'center'
		},
		contentContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8
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
			borderRadius: 12,
			opacity: 0.8
		},
		textTemp: {
			color: theme.colors.text,
			fontSize: sizes.md,
			fontWeight: 'bold',
			lineHeight: 20
		},
		textCity: {
			color: theme.colors.text,
			fontSize: sizes.sm,
			opacity: 0.7
		}
	})
}
