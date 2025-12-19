import { Session } from '~/lib/types'

export type AuthAction =
	| { type: 'SET_LOADING' }
	| { type: 'SET_UNAUTHENTICATED' }
	| { type: 'SIGN_IN'; payload: Session }
	| { type: 'SIGN_OUT' }
