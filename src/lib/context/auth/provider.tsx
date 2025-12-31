import {
	makeRedirectUri,
	ResponseType,
	useAuthRequest
} from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'
import * as WebBrowser from 'expo-web-browser'
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useReducer
} from 'react'
import api, { SESSION_KEY } from '~/lib/axios/todoist-client'
import { authReducer, INITIAL_STATE } from '~/lib/context/auth/reducer'
import type { Session } from '~/lib/types'

const endpoints = {
	auth: 'https://todoist.com/oauth/authorize',
	token: 'https://todoist.com/oauth/access_token',
	user: 'user'
}

const redirectURI = makeRedirectUri({
	scheme: 'tickit',
	path: 'auth/callback'
})

type AuthProviderProps = {
	children: ReactNode
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

	const [{ session, status }, dispatch] = useReducer(authReducer, INITIAL_STATE)

	useEffect(() => {
		SecureStore.getItemAsync(SESSION_KEY).then(sessionJson => {
			if (!sessionJson) {
				dispatch({ type: 'SET_UNAUTHENTICATED' })
				return
			}

			dispatch({ type: 'SIGN_IN', payload: JSON.parse(sessionJson) })
		})
	}, [])

	const [, authResponse, startAuthRequest] = useAuthRequest(
		{
			clientId: process.env.EXPO_PUBLIC_TODOIST_CLIENT_ID!,
			scopes: ['data:read_write'],
			redirectUri: redirectURI,
			responseType: ResponseType.Code
		},
		{
			authorizationEndpoint: endpoints.auth,
			tokenEndpoint: endpoints.token
		}
	)

	const fetchUserProfile = useCallback(async (accessToken: string) => {
		try {
			const { data: userData } = await api.get(endpoints.user, {
				headers: { Authorization: `Bearer ${accessToken}` }
			})

			const newSession: Session = {
				user: {
					id: userData.id,
					name: userData.full_name,
					email: userData.email
				},
				accessToken
			}

			await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(newSession))
			dispatch({ type: 'SIGN_IN', payload: newSession })
		} catch (error) {
			console.error('Failed to fetch user profile', error)
			dispatch({ type: 'SET_UNAUTHENTICATED' })
		}
	}, [])

	const exchangeCodeForToken = useCallback(
		async (code: string) => {
			dispatch({ type: 'SET_LOADING' })
			try {
				const { data: tokenData } = await api.post(
					endpoints.token,
					new URLSearchParams({
						client_id: process.env.EXPO_PUBLIC_TODOIST_CLIENT_ID!,
						client_secret: process.env.EXPO_PUBLIC_TODOIST_CLIENT_SECRET!,
						code,
						redirect_uri: redirectURI
					}).toString(),
					{
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
					}
				)

				if (!tokenData.access_token) {
					console.error('No access token in response', tokenData)
					dispatch({ type: 'SET_UNAUTHENTICATED' })

					return
				}

				await fetchUserProfile(tokenData.access_token)
			} catch (error) {
				console.error('Token exchange failed', error)
				dispatch({ type: 'SET_UNAUTHENTICATED' })
			}
		},
		[fetchUserProfile]
	)

	useEffect(() => {
		if (authResponse?.type === 'error') {
			console.error('Auth error:', authResponse.error)
			dispatch({ type: 'SET_UNAUTHENTICATED' })

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
		SecureStore.deleteItemAsync(SESSION_KEY)
		dispatch({ type: 'SIGN_OUT' })
	}

	return (
		<AuthContext.Provider value={{ session, status, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
