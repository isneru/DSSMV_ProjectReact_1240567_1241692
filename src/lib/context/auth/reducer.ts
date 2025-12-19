import { AuthAction } from '~/lib/context/auth/actions'
import { Session } from '~/lib/types'

export type AuthState = {
	session: Session | null | undefined
	status: 'loading' | 'authenticated' | 'unauthenticated'
}

export const INITIAL_STATE: AuthState = {
	session: null,
	status: 'loading'
}

export function authReducer(state: AuthState, action: AuthAction): AuthState {
	switch (action.type) {
		case 'SET_LOADING':
			return { ...state, status: 'loading' }
		case 'SET_UNAUTHENTICATED':
			return { ...state, status: 'unauthenticated', session: null }
		case 'SIGN_IN':
			return { ...state, status: 'authenticated', session: action.payload }
		case 'SIGN_OUT':
			return { ...state, status: 'unauthenticated', session: null }
		default:
			return state
	}
}
