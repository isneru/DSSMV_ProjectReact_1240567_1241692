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
import { useMemo } from 'react'
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableWithoutFeedback,
	View
} from 'react-native'
import { useWeather } from '~/lib/context/weather/provider'

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
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme), [theme])
	const { weather, refetch, isLoading } = useWeather()

	const CurrentIcon = weather?.condition
		? weatherIcons[weather.condition] || CloudSunIcon
		: CloudSunIcon

	return (
		<TouchableWithoutFeedback onPress={refetch} disabled={isLoading}>
			<View style={styles.weather}>
				<View style={styles.contentContainer}>
					<CurrentIcon color={theme.colors.text} size={24} weight='regular' />
					<View>
						<Text style={styles.textTemp}>
							{weather?.temperature ? `${weather.temperature}°` : '--'}
						</Text>
						<Text style={styles.textCity}>{weather?.city || 'Loading...'}</Text>
					</View>
				</View>

				{isLoading && (
					<ActivityIndicator
						style={styles.loading}
						size='small'
						color={theme.colors.primary}
					/>
				)}
			</View>
		</TouchableWithoutFeedback>
	)
}

const createStyles = (theme: Theme) => {
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
			fontSize: 18,
			fontWeight: 'bold',
			lineHeight: 20
		},
		textCity: {
			color: theme.colors.text,
			fontSize: 12,
			opacity: 0.7
		}
	})
}
