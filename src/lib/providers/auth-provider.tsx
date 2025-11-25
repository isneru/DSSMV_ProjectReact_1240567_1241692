import {
	makeRedirectUri,
	ResponseType,
	useAuthRequest
} from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'
import * as WebBrowser from 'expo-web-browser'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type JSX
} from 'react'
import type { Session } from '~/lib/types'

const endpoints = {
	auth: 'https://todoist.com/oauth/authorize',
	token: 'https://todoist.com/oauth/access_token',
	userData: 'https://api.todoist.com/api/v1/user'
}

const SESSION_KEY = 'session'

type AuthProviderProps = {
	children: JSX.Element
}

type AuthContextType = {
	session: Session | null | undefined
	status: 'loading' | 'authenticated' | 'unauthenticated'
	login: () => void
	logout: () => void
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }: AuthProviderProps) => {
	WebBrowser.maybeCompleteAuthSession()

	const [session, setSession] = useState<AuthContextType['session']>(null)
	const [status, setStatus] = useState<AuthContextType['status']>('loading')

	useEffect(() => {
		SecureStore.getItemAsync(SESSION_KEY).then(sessionJson => {
			if (!sessionJson) {
				setStatus('unauthenticated')
				return
			}

			setSession(JSON.parse(sessionJson))
			setStatus('authenticated')
		})
	}, [])

	const [, authResponse, startAuthRequest] = useAuthRequest(
		{
			clientId: process.env.EXPO_PUBLIC_TODOIST_CLIENT_ID!,
			scopes: ['data:read_write'],
			redirectUri: makeRedirectUri({
				scheme: 'tickitrevamped'
			}),
			responseType: ResponseType.Code
		},
		{
			authorizationEndpoint: endpoints.auth,
			tokenEndpoint: endpoints.token
		}
	)

	const fetchUserProfile = useCallback(async (accessToken: string) => {
		try {
			const userResponse = await fetch(endpoints.userData, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			})
			const userData = await userResponse.json()

			const newSession: Session = {
				user: {
					id: userData.id,
					name: userData.full_name,
					email: userData.email
				},
				accessToken
			}

			setSession(newSession)
			await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(newSession))
			setStatus('authenticated')
		} catch (error) {
			console.error('Failed to fetch user profile', error)
			setStatus('unauthenticated')
		}
	}, [])

	const exchangeCodeForToken = useCallback(
		async (code: string) => {
			setStatus('loading')
			try {
				const tokenResponse = await fetch(endpoints.token, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: new URLSearchParams({
						client_id: process.env.EXPO_PUBLIC_TODOIST_CLIENT_ID!,
						client_secret: process.env.EXPO_PUBLIC_TODOIST_CLIENT_SECRET!,
						code,
						redirect_uri: makeRedirectUri({
							scheme: 'tickitrevamped'
						})
					}).toString()
				})

				const tokenData = await tokenResponse.json()

				if (!tokenData.access_token) {
					console.error('No access token in response', tokenData)
					setStatus('unauthenticated')

					return
				}

				await fetchUserProfile(tokenData.access_token)
			} catch (error) {
				console.error('Token exchange failed', error)
				setStatus('unauthenticated')
			}
		},
		[fetchUserProfile]
	)

	useEffect(() => {
		if (authResponse?.type === 'error') {
			console.error('Auth error:', authResponse.error)
			setStatus('unauthenticated')

			return
		}

		if (authResponse?.type === 'success') {
			const { code } = authResponse.params
			exchangeCodeForToken(code)
		}
	}, [authResponse, exchangeCodeForToken])

	function login() {
		if (status === 'loading') return
		startAuthRequest()
	}

	function logout() {
		if (status === 'loading') return
		setSession(null)
		setStatus('unauthenticated')
		SecureStore.deleteItemAsync(SESSION_KEY)
	}

	return (
		<AuthContext.Provider value={{ session, status, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	return useContext(AuthContext)
}
