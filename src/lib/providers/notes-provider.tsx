import * as Crypto from 'expo-crypto'
import * as LocalStorage from 'expo-secure-store'
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState
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

export const NotesProvider = ({ children }: NotesProviderProps) => {
	const { session, status } = useAuth()
	const [notes, setNotes] = useState<Note[]>([])
	const [lastAccessedNoteId, setLastAccessedNoteId] = useState<string | null>(
		null
	)
	const [isLoading, setIsLoading] = useState(false)

	// initialize DB and load local notes
	useEffect(() => {
		setIsLoading(true)
		initDb()
		const localNotes = getNotesDb()
		setNotes(localNotes)
		setIsLoading(false)

		LocalStorage.getItemAsync('lastAccessedNoteId').then(id => {
			if (id) {
				setLastAccessedNoteId(id)
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
		setIsLoading(true)
		try {
			const responseData = await fetchWithAuth('tasks')
			console.log(
				'API Response for tasks:',
				JSON.stringify(responseData, null, 2)
			)

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
			setNotes(mappedNotes)
		} catch (error) {
			console.error('Failed to get notes:', error)
		} finally {
			setIsLoading(false)
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

	const addNote = async (note: Partial<Note>) => {
		setIsLoading(true)
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
				setNotes(prev => [...prev, newNote])
			}
		} catch (error) {
			console.error('Failed to add note:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const updateNote = async (id: string, note: Partial<Note>) => {
		setIsLoading(true)
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
				setNotes(prev => {
					const updatedNotes = prev.map(n => {
						if (n.id === id) {
							const updated = { ...n, ...note }
							saveNote(updated) // update db
							return updated
						}
						return n
					})
					return updatedNotes
				})
			}

			if (lastAccessedNoteId !== id) {
				setLastAccessedNoteId(id)
			}
		} catch (error) {
			console.error('Failed to update note:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const deleteNote = async (id: string) => {
		setIsLoading(true)
		try {
			if (session?.accessToken) {
				await fetchWithAuth(`tasks/${id}`, {
					method: 'DELETE'
				})

				// remove from local state immediately for better UX
				setNotes(prev => prev.filter(n => n.id !== id))
				deleteNoteDb(id)
			} else {
				// local delete
				setNotes(prev => prev.filter(n => n.id !== id))
				deleteNoteDb(id)

				// If it's a server note (not local-only), track pending deletion
				const noteToDelete = notes.find(n => n.id === id)
				if (noteToDelete && noteToDelete.userId !== 'local') {
					addPendingDeletion(id)
				}
			}

			if (lastAccessedNoteId === id) {
				setLastAccessedNoteId(null)
			}
		} catch (error) {
			console.error('Failed to delete note:', error)
			if (session?.accessToken) {
				await getNotes() // re-sync on error
			}
		} finally {
			setIsLoading(false)
		}
	}

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
