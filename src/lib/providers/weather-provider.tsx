import * as Location from 'expo-location'
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode
} from 'react'
import api from '~/lib/axios/weather-client'
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

		try {
			const servicesEnabled = await Location.hasServicesEnabledAsync()
			if (servicesEnabled) {
				const { granted } = await Location.requestForegroundPermissionsAsync()
				if (granted) {
					location = await Location.getCurrentPositionAsync({
						accuracy: Location.Accuracy.Lowest
					})
				}
			}
		} catch (error) {
			console.warn('Error fetching current location:', error)
		}

		if (!location) {
			try {
				location = await Location.getLastKnownPositionAsync()
			} catch (error) {
				console.warn('Error fetching last known location:', error)
			}
		}

		if (!location) {
			// Fallback to Lisbon
			location = {
				coords: {
					latitude: 38.736946,
					longitude: -9.142685,
					altitude: null,
					accuracy: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			}
		}

		try {
			const { latitude, longitude } = location.coords

			const { data } = await api.get<WeatherAPIResponse>('weather', {
				params: {
					lat: latitude,
					lon: longitude
				}
			})

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

		const intervalId = setInterval(
			() => {
				fetchWeather()
			},
			1000 * 60 * 30
		) // 30 minutes

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
