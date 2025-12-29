import * as Crypto from 'expo-crypto'
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useReducer
} from 'react'
import { useAuth } from '~/lib/context/auth/provider'
import { INITIAL_STATE, notesReducer } from '~/lib/context/notes/reducer'
import * as DB from '~/lib/db'
import { TodoistService } from '~/lib/services/todoist'
import type { Note } from '~/lib/types'

type NotesProviderProps = {
	children: ReactNode
}

type NotesContextType = {
	notes: Note[]
	isLoading: boolean
	getNotes: () => Promise<void>
	addNote: (data: Partial<Note>) => void
	updateNote: (id: string, data: Partial<Note>) => void
	deleteNote: (id: string) => void
}

export const NotesContext = createContext<NotesContextType>(
	{} as NotesContextType
)

export const NotesProvider = ({ children }: NotesProviderProps) => {
	const { session, status } = useAuth()
	const [{ notes, isLoading }, dispatch] = useReducer(
		notesReducer,
		INITIAL_STATE
	)

	const isOnline = status === 'authenticated' && !!session?.accessToken

	useEffect(() => {
		DB.init()
		const localNotes = DB.getNotes()
		dispatch({ type: 'SET_NOTES', payload: localNotes })
	}, [])

	const runBackgroundSync = useCallback(async () => {
		if (!isOnline) return

		try {
			const pendingDeletions = DB.getPendingDeletions()
			for (const id of pendingDeletions) {
				await TodoistService.deleteTask(id)
					.catch(() => {})
					.finally(() => DB.removePendingDeletion(id))
			}

			const dirtyNotes = DB.getNotes().filter(n => !n.isSynced)

			for (const note of dirtyNotes) {
				try {
					if (note.userId === 'local') {
						const remoteNote = await TodoistService.createTask(note)
						DB.deleteNote(note.id)
						DB.saveNote(remoteNote, false)
					} else {
						const remoteNote = await TodoistService.updateTask(note.id, note)
						DB.saveNote(remoteNote, false)
					}
				} catch (error) {
					console.error('Failed to push note', note.id, error)
				}
			}

			const remoteNotes = await TodoistService.fetchTasks()

			DB.clearNotes()
			remoteNotes.forEach(note => DB.saveNote(note, false))

			dispatch({ type: 'SET_NOTES', payload: DB.getNotes() })
		} catch (e) {
			console.error('Sync Error', e)
		}
	}, [isOnline])

	useEffect(() => {
		if (isOnline) {
			runBackgroundSync()
		}
	}, [isOnline, runBackgroundSync])

	const addNote = useCallback(
		(data: Partial<Note>) => {
			const newNote: Note = {
				id: Crypto.randomUUID(),
				userId: 'local',
				title: data.title ?? 'No Title',
				content: data.content ?? '',
				label: data.label ?? null,
				due: data.due ?? null,
				isSynced: false
			}

			dispatch({ type: 'ADD_NOTE', payload: newNote })
			DB.saveNote(newNote, true)

			if (isOnline) runBackgroundSync()
		},
		[isOnline, runBackgroundSync]
	)

	const updateNote = useCallback(
		(id: string, data: Partial<Note>) => {
			const currentNote = notes.find(n => n.id === id)
			if (!currentNote) return

			const updatedNote = { ...currentNote, ...data }

			dispatch({ type: 'UPDATE_NOTE', payload: { id, note: updatedNote } })
			DB.saveNote(updatedNote, true)

			if (isOnline) runBackgroundSync()
		},
		[notes, isOnline, runBackgroundSync]
	)

	const deleteNote = useCallback(
		(id: string) => {
			dispatch({ type: 'DELETE_NOTE', payload: id })
			DB.deleteNote(id)
			DB.addPendingDeletion(id)

			if (isOnline) runBackgroundSync()
		},
		[isOnline, runBackgroundSync]
	)

	return (
		<NotesContext.Provider
			value={{
				notes,
				isLoading,
				getNotes: runBackgroundSync,
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
