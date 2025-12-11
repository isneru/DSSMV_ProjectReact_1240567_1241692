import axios from 'axios'

const weatherClient = axios.create({
	baseURL: 'https://api.openweathermap.org/data/2.5/',
	params: {
		units: 'metric',
		appid: process.env.EXPO_PUBLIC_WEATHER_KEY
	}
})

export default weatherClient
