import { NotesAction } from '~/lib/context/notes/actions'
import { Note } from '~/lib/types'

export type NotesState = {
	notes: Note[]
	isLoading: boolean
}

export const INITIAL_STATE: NotesState = {
	notes: [],
	isLoading: false
}

export function notesReducer(
	state: NotesState,
	action: NotesAction
): NotesState {
	switch (action.type) {
		case 'SET_LOADING':
			return { ...state, isLoading: action.payload }
		case 'SET_NOTES':
			return { ...state, notes: action.payload }
		case 'ADD_NOTE':
			return { ...state, notes: [...state.notes, action.payload] }
		case 'UPDATE_NOTE':
			return {
				...state,
				notes: state.notes.map(n =>
					n.id === action.payload.id ? { ...n, ...action.payload.note } : n
				)
			}
		case 'DELETE_NOTE':
			return {
				...state,
				notes: state.notes.filter(n => n.id !== action.payload)
			}
		default:
			return state
	}
}
