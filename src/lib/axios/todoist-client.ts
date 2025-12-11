import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { Session } from '~/lib/types'

export const SESSION_KEY = 'session'

const todoistClient = axios.create({
	baseURL: 'https://api.todoist.com/api/v1/',
	headers: {
		'Content-Type': 'application/json'
	}
})

todoistClient.interceptors.request.use(async config => {
	const sessionJson = await SecureStore.getItemAsync(SESSION_KEY)

	if (sessionJson) {
		const session = JSON.parse(sessionJson) as Session

		if (session?.accessToken) {
			config.headers.Authorization = `Bearer ${session.accessToken}`
		}
	}
	return config
})

export default todoistClient
