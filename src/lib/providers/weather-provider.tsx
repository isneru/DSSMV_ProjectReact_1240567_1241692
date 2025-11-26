import * as Location from 'expo-location'
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode
} from 'react'
import { WeatherAPIResponse } from '~/lib/types'

type Weather = {
	temperature: number
	condition: string
	city: string
}

type WeatherContextType = {
	weather?: Weather
	isLoading: boolean
	refetch: () => Promise<void>
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined)

export function WeatherProvider({ children }: { children: ReactNode }) {
	const [weather, setWeather] = useState<Weather>()
	const [isLoading, setIsLoading] = useState(false)

	const fetchWeather = async () => {
		setIsLoading(true)
		let location: Location.LocationObject | null = null
		let { granted } = await Location.requestForegroundPermissionsAsync()
		if (!granted) {
			location = await Location.getLastKnownPositionAsync()
			if (!location) {
				setIsLoading(false)
				return
			}
		} else {
			location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Lowest
			})
		}

		try {
			const { latitude, longitude } = location.coords

			const response = await fetch(
				`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${process
					.env.EXPO_PUBLIC_WEATHER_KEY!}
`
			)
			const data: WeatherAPIResponse = await response.json()

			if (data) {
				setWeather({
					city: data.name,
					temperature: Math.round(data.main.temp),
					condition: data.weather[0].main
				})
			}
		} catch (error) {
			console.error(error)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchWeather()

		const intervalId = setInterval(() => {
			fetchWeather()
		}, 1000 * 60 * 30) // 30 minutes

		return () => {
			clearInterval(intervalId)
		}
	}, [])

	return (
		<WeatherContext.Provider
			value={{ weather, isLoading, refetch: fetchWeather }}>
			{children}
		</WeatherContext.Provider>
	)
}

export function useWeather() {
	const context = useContext(WeatherContext)
	if (context === undefined) {
		throw new Error('useWeather must be used within a WeatherProvider')
	}
	return context
}
