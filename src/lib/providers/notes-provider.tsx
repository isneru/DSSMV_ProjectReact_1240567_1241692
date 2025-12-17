import { isAxiosError } from 'axios'
import * as Crypto from 'expo-crypto'
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useReducer
} from 'react'
import api from '~/lib/axios/todoist-client'
import {
	addPendingDeletion,
	clearNotes,
	deleteNote as deleteNoteDb,
	getNotes as getNotesDb,
	getPendingDeletions,
	initDb,
	removePendingDeletion,
	saveNote
} from '~/lib/db'
import { useAuth } from '~/lib/providers/auth-provider'
import type { Note, TodoistNote, TodoistUser } from '~/lib/types'

type NotesState = {
	notes: Note[]
	isLoading: boolean
}

type NotesAction =
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_NOTES'; payload: Note[] }
	| { type: 'ADD_NOTE'; payload: Note }
	| { type: 'UPDATE_NOTE'; payload: { id: string; note: Partial<Note> } }
	| { type: 'DELETE_NOTE'; payload: string }

const notesReducer = (state: NotesState, action: NotesAction): NotesState => {
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

type NotesProviderProps = {
	children: ReactNode
}

type NotesContextType = {
	notes: Note[]
	isLoading: boolean
	getNotes: () => Promise<void>
	getUser: () => Promise<TodoistUser>
	addNote: (note: Partial<Note>) => Promise<void>
	updateNote: (id: string, note: Partial<Note>) => Promise<void>
	deleteNote: (id: string) => Promise<void>
}

export const NotesContext = createContext<NotesContextType>(
	{} as NotesContextType
)

const BASE_URL = 'https://todoist.com/api/v1/'

const INITIAL_STATE: NotesState = {
	notes: [],
	isLoading: false
}

export const NotesProvider = ({ children }: NotesProviderProps) => {
	const { session, status } = useAuth()
	const [{ notes, isLoading }, dispatch] = useReducer(
		notesReducer,
		INITIAL_STATE
	)

	// initialize DB and load local notes
	useEffect(() => {
		dispatch({ type: 'SET_LOADING', payload: true })
		initDb()
		const localNotes = getNotesDb()
		dispatch({ type: 'SET_NOTES', payload: localNotes })
		dispatch({ type: 'SET_LOADING', payload: false })
	}, [])

	const getUser = useCallback(async (): Promise<TodoistUser> => {
		const { data } = await api.get('user')
		return data
	}, [])

	const getNotes = useCallback(async () => {
		dispatch({ type: 'SET_LOADING', payload: true })
		try {
			const { data } = await api.get('tasks')
			const todoistNotes: TodoistNote[] = data.results ?? []

			const mappedNotes: Note[] = todoistNotes.map(item => {
				const label =
					item.labels && item.labels.length > 0 ? item.labels[0] : ''

				const cleanDateOnly = item.due ? item.due.date.split('T')[0] : ''

				return {
					id: item.id,
					userId: item.user_id,
					title: item.content,
					content: item.description,
					priority: item.priority,
					label: label || 'Uncategorized',
					tag: label,
					projectId: item.project_id,
					due: {
						dateOnly: cleanDateOnly,
						dateTime: item.due ? item.due.datetime || item.due.date : '',
						dueString: item.due ? item.due.string : ''
					}
				} as any
			})

			// update local db
			clearNotes()
			mappedNotes.forEach(note => saveNote(note))
			dispatch({ type: 'SET_NOTES', payload: mappedNotes })
		} catch (error) {
			console.error('Failed to get notes:', error)
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false })
		}
	}, [])

	const syncLocalNotes = useCallback(async () => {
		try {
			const localNotes = getNotesDb().filter(n => n.userId === 'local')
			if (localNotes.length === 0) return

			console.log(`Syncing ${localNotes.length} local notes to Todoist...`)

			for (const note of localNotes) {
				try {
					const tagToSend = (note as any).tag || note.label

					const noteToPost = {
						content: note.title,
						description: note.content,
						priority: note.priority,
						due_string: note.due?.dueString,
						labels:
							tagToSend && tagToSend !== 'Uncategorized' ? [tagToSend] : []
					}

					await api.post('tasks', noteToPost)
				} catch (error) {
					console.error('Failed to sync local note:', note.id, error)
				}
			}
		} catch (error) {
			console.error('Failed to sync local notes:', error)
		}
	}, [])

	const syncDeletions = useCallback(async () => {
		const pendingIds = getPendingDeletions()
		if (pendingIds.length === 0) return

		console.log(`Syncing ${pendingIds.length} deletions to Todoist...`)

		for (const id of pendingIds) {
			try {
				await api.delete(`tasks/${id}`)
				removePendingDeletion(id)
			} catch (error) {
				console.error('Failed to sync deletion:', id, error)
				if (isAxiosError(error) && error.response?.status === 404) {
					removePendingDeletion(id)
				}
			}
		}
	}, [])

	useEffect(() => {
		const init = async () => {
			if (status === 'authenticated') {
				await syncDeletions()
				await syncLocalNotes()
				await getNotes()
			}
		}
		init()
	}, [status, getNotes, syncLocalNotes, syncDeletions])

	const addNote = useCallback(
		async (note: Partial<Note>) => {
			dispatch({ type: 'SET_LOADING', payload: true })

			const inputTag = (note as any).tag || note.label || ''

			try {
				if (session?.accessToken) {
					const noteToPost = {
						content: note.title,
						description: note.content,
						priority: note.priority,
						due_string: note.due?.dueString,
						labels: inputTag ? [inputTag] : []
					}

					await api.post('tasks', noteToPost)
					await getNotes()
				} else {
					const newNote: Note = {
						id: Crypto.randomUUID(),
						userId: 'local',
						title: note.title ?? '',
						content: note.content ?? '',
						priority: note.priority ?? 1,
						label: inputTag || 'Uncategorized',
						// @ts-ignore
						tag: inputTag,
						projectId: 'local',
						due: note.due ?? {
							dateOnly: '',
							dateTime: '',
							dueString: ''
						}
					}
					saveNote(newNote)
					dispatch({ type: 'ADD_NOTE', payload: newNote })
				}
			} catch (error) {
				console.error('Failed to add note:', error)
			} finally {
				dispatch({ type: 'SET_LOADING', payload: false })
			}
		},
		[session?.accessToken, getNotes]
	)

	const updateNote = useCallback(
		async (id: string, note: Partial<Note>) => {
			dispatch({ type: 'SET_LOADING', payload: true })

			const inputTag = (note as any).tag

			try {
				if (session?.accessToken) {
					const noteToPost = {
						content: note.title,
						description: note.content,
						priority: note.priority,
						due_string: note.due?.dueString,
						...(inputTag !== undefined && {
							labels: inputTag ? [inputTag] : []
						})
					}

					await api.post(`tasks/${id}`, noteToPost)
					await getNotes()
				} else {
					const currentNote = notes.find(n => n.id === id)
					if (currentNote) {
						const updatedNote = {
							...currentNote,
							...note,
							...(inputTag !== undefined && { label: inputTag, tag: inputTag })
						}
						saveNote(updatedNote)

						// @ts-ignore
						dispatch({
							type: 'UPDATE_NOTE',
							payload: { id, note: updatedNote }
						})
					}
				}
			} catch (error) {
				console.error('Failed to update note:', error)
			} finally {
				dispatch({ type: 'SET_LOADING', payload: false })
			}
		},
		[session?.accessToken, getNotes, notes]
	)

	const deleteNote = useCallback(
		async (id: string) => {
			dispatch({ type: 'SET_LOADING', payload: true })
			try {
				if (session?.accessToken) {
					await api.delete(`tasks/${id}`)
					dispatch({ type: 'DELETE_NOTE', payload: id })
					deleteNoteDb(id)
				} else {
					dispatch({ type: 'DELETE_NOTE', payload: id })
					deleteNoteDb(id)

					const noteToDelete = notes.find(n => n.id === id)
					if (noteToDelete && noteToDelete.userId !== 'local') {
						addPendingDeletion(id)
					}
				}
			} catch (error) {
				console.error('Failed to delete note:', error)
				if (session?.accessToken) {
					await getNotes()
				}
			} finally {
				dispatch({ type: 'SET_LOADING', payload: false })
			}
		},
		[session?.accessToken, getNotes, notes]
	)

	return (
		<NotesContext.Provider
			value={{
				notes,
				isLoading,
				getNotes,
				getUser,
				addNote,
				updateNote,
				deleteNote
			}}>
			{children}
		</NotesContext.Provider>
	)
}

export function useNotes() {
	const context = useContext(NotesContext)
	if (!context) {
		throw new Error('useNotes must be used within a NotesProvider')
	}
	return context
}
