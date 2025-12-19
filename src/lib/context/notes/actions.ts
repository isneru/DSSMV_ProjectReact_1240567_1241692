import { Note } from '~/lib/types'

export type NotesAction =
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_NOTES'; payload: Note[] }
	| { type: 'ADD_NOTE'; payload: Note }
	| { type: 'UPDATE_NOTE'; payload: { id: string; note: Note } }
	| { type: 'DELETE_NOTE'; payload: string }
