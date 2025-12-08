import * as Crypto from 'expo-crypto'
import * as LocalStorage from 'expo-secure-store'
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useReducer
} from 'react'
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
	lastAccessedNoteId: string | null
	isLoading: boolean
}

type NotesAction =
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_NOTES'; payload: Note[] }
	| { type: 'SET_LAST_ACCESSED'; payload: string | null }
	| { type: 'ADD_NOTE'; payload: Note }
	| { type: 'UPDATE_NOTE'; payload: { id: string; note: Partial<Note> } }
	| { type: 'DELETE_NOTE'; payload: string }

const notesReducer = (state: NotesState, action: NotesAction): NotesState => {
	switch (action.type) {
		case 'SET_LOADING':
			return { ...state, isLoading: action.payload }
		case 'SET_NOTES':
			return { ...state, notes: action.payload }
		case 'SET_LAST_ACCESSED':
			return { ...state, lastAccessedNoteId: action.payload }
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
	lastAccessedNoteId: string | null
	setLastAccessedNoteId: (id: string | null) => void
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
	lastAccessedNoteId: null,
	isLoading: false
}

export const NotesProvider = ({ children }: NotesProviderProps) => {
	const { session, status } = useAuth()
	const [{ notes, lastAccessedNoteId, isLoading }, dispatch] = useReducer(
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

		LocalStorage.getItemAsync('lastAccessedNoteId').then(id => {
			if (id) {
				dispatch({ type: 'SET_LAST_ACCESSED', payload: id })
			}
		})
	}, [])

	useEffect(() => {
		// make localstore be in sync with lastAccessedNoteId
		if (lastAccessedNoteId) {
			LocalStorage.setItemAsync('lastAccessedNoteId', lastAccessedNoteId)
		} else {
			LocalStorage.deleteItemAsync('lastAccessedNoteId')
		}
	}, [lastAccessedNoteId])

	const fetchWithAuth = useCallback(
		async (endpoint: string, options: RequestInit = {}) => {
			if (!session?.accessToken) {
				throw new Error('No access token')
			}

			const response = await fetch(`${BASE_URL}${endpoint}`, {
				...options,
				headers: {
					...options.headers,
					'Authorization': `Bearer ${session.accessToken}`,
					'Content-Type': 'application/json'
				}
			})

			if (!response.ok) {
				const errorText = await response.text()
				console.error(`API Error ${endpoint}:`, errorText)
				throw new Error(`API Error: ${response.status} ${errorText}`)
			}

			// handle 204 no content
			if (response.status === 204) {
				return null
			}

			return response.json()
		},
		[session?.accessToken]
	)

	const getUser = useCallback(async (): Promise<TodoistUser> => {
		return fetchWithAuth('user')
	}, [fetchWithAuth])

	const getNotes = useCallback(async () => {
		dispatch({ type: 'SET_LOADING', payload: true })
		try {
			const responseData = await fetchWithAuth('tasks')
			const todoistNotes: TodoistNote[] = responseData.results ?? []

			// map todoist notes to app notes
			const mappedNotes: Note[] = todoistNotes.map(item => ({
				id: item.id,
				userId: item.user_id,
				title: item.content,
				content: item.description,
				priority: item.priority,
				label:
					item.labels && item.labels.length > 0
						? item.labels[0]
						: 'Uncategorized', // simple label handling
				projectId: item.project_id,
				due: {
					dateOnly: item.due ? item.due.date : '',
					dateTime: item.due ? item.due.datetime || item.due.date : '',
					dueString: item.due ? item.due.string : ''
				}
			}))

			// update local db
			clearNotes() // clear local to avoid duplicates if ids changed or deletions happened outside
			mappedNotes.forEach(note => saveNote(note))
			dispatch({ type: 'SET_NOTES', payload: mappedNotes })
		} catch (error) {
			console.error('Failed to get notes:', error)
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false })
		}
	}, [fetchWithAuth])

	const syncLocalNotes = useCallback(async () => {
		try {
			const localNotes = getNotesDb().filter(n => n.userId === 'local')
			if (localNotes.length === 0) return

			console.log(`Syncing ${localNotes.length} local notes to Todoist...`)

			for (const note of localNotes) {
				try {
					const body = {
						content: note.title,
						description: note.content,
						priority: note.priority,
						due_string: note.due?.dueString
					}

					await fetchWithAuth('tasks', {
						method: 'POST',
						body: JSON.stringify(body)
					})
				} catch (error) {
					console.error('Failed to sync local note:', note.id, error)
				}
			}
		} catch (error) {
			console.error('Failed to sync local notes:', error)
		}
	}, [fetchWithAuth])

	const syncDeletions = useCallback(async () => {
		const pendingIds = getPendingDeletions()
		if (pendingIds.length === 0) return

		console.log(`Syncing ${pendingIds.length} deletions to Todoist...`)

		for (const id of pendingIds) {
			try {
				await fetchWithAuth(`tasks/${id}`, {
					method: 'DELETE'
				})
				removePendingDeletion(id)
			} catch (error: any) {
				console.error('Failed to sync deletion:', id, error)
				// If it's a 404, it's already deleted, so we can remove it from pending
				if (error.message && error.message.includes('404')) {
					removePendingDeletion(id)
				}
			}
		}
	}, [fetchWithAuth])

	useEffect(() => {
		const init = async () => {
			if (status === 'authenticated') {
				await syncDeletions()
				await syncLocalNotes()
				await getNotes()
			}
		}
		init()
		// don't clear notes on unauthenticated to allow local usage
	}, [status, getNotes, syncLocalNotes, syncDeletions])

	const addNote = useCallback(
		async (note: Partial<Note>) => {
			dispatch({ type: 'SET_LOADING', payload: true })
			try {
				if (session?.accessToken) {
					// optimistic update could go here
					const body = {
						content: note.title,
						description: note.content,
						priority: note.priority,
						due_string: note.due?.dueString
					}

					await fetchWithAuth('tasks', {
						method: 'POST',
						body: JSON.stringify(body)
					})

					await getNotes() // refresh list
				} else {
					// local only
					const newNote: Note = {
						id: Crypto.randomUUID(),
						userId: 'local',
						title: note.title ?? '',
						content: note.content ?? '',
						priority: note.priority ?? 1,
						label: note.label ?? 'Uncategorized',
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
		[session?.accessToken, fetchWithAuth, getNotes]
	)

	const updateNote = useCallback(
		async (id: string, note: Partial<Note>) => {
			dispatch({ type: 'SET_LOADING', payload: true })
			try {
				if (session?.accessToken) {
					const body = {
						content: note.title,
						description: note.content,
						priority: note.priority,
						due_string: note.due?.dueString
					}

					await fetchWithAuth(`tasks/${id}`, {
						method: 'POST',
						body: JSON.stringify(body)
					})

					await getNotes() // refresh list
				} else {
					// local update
					const currentNote = notes.find(n => n.id === id)
					if (currentNote) {
						saveNote({ ...currentNote, ...note })
					}

					dispatch({ type: 'UPDATE_NOTE', payload: { id, note } })
				}

				if (lastAccessedNoteId !== id) {
					dispatch({ type: 'SET_LAST_ACCESSED', payload: id })
				}
			} catch (error) {
				console.error('Failed to update note:', error)
			} finally {
				dispatch({ type: 'SET_LOADING', payload: false })
			}
		},
		[session?.accessToken, fetchWithAuth, getNotes, notes, lastAccessedNoteId]
	)

	const deleteNote = useCallback(
		async (id: string) => {
			dispatch({ type: 'SET_LOADING', payload: true })
			try {
				if (session?.accessToken) {
					await fetchWithAuth(`tasks/${id}`, {
						method: 'DELETE'
					})

					// remove from local state immediately for better UX
					dispatch({ type: 'DELETE_NOTE', payload: id })
					deleteNoteDb(id)
				} else {
					// local delete
					dispatch({ type: 'DELETE_NOTE', payload: id })
					deleteNoteDb(id)

					// If it's a server note (not local-only), track pending deletion
					const noteToDelete = notes.find(n => n.id === id)
					if (noteToDelete && noteToDelete.userId !== 'local') {
						addPendingDeletion(id)
					}
				}

				if (lastAccessedNoteId === id) {
					dispatch({ type: 'SET_LAST_ACCESSED', payload: null })
				}
			} catch (error) {
				console.error('Failed to delete note:', error)
				if (session?.accessToken) {
					await getNotes() // re-sync on error
				}
			} finally {
				dispatch({ type: 'SET_LOADING', payload: false })
			}
		},
		[session?.accessToken, fetchWithAuth, getNotes, notes, lastAccessedNoteId]
	)

	const setLastAccessedNoteId = useCallback((id: string | null) => {
		dispatch({ type: 'SET_LAST_ACCESSED', payload: id })
	}, [])

	return (
		<NotesContext.Provider
			value={{
				lastAccessedNoteId,
				setLastAccessedNoteId,
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
