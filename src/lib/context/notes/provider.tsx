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
import * as db from '~/lib/db'
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
		db.init()
		const localNotes = db.getNotes()
		dispatch({ type: 'SET_NOTES', payload: localNotes })
	}, [])

	const runBackgroundSync = useCallback(async () => {
		if (!isOnline) return

		try {
			dispatch({ type: 'SET_LOADING', payload: true })
			const pendingDeletions = db.getPendingDeletions()
			for (const id of pendingDeletions) {
				await TodoistService.deleteNote(id)
					.catch(() => {})
					.finally(() => db.removePendingDeletion(id))
			}

			const dirtyNotes = db.getNotes().filter(n => !n.isSynced)

			for (const note of dirtyNotes) {
				try {
					dispatch({ type: 'SET_LOADING', payload: true })
					if (note.userId === 'local') {
						const remoteNote = await TodoistService.createNote(note)
						db.deleteNote(note.id)
						db.saveNote(remoteNote, false)
					} else {
						const remoteNote = await TodoistService.updateNote(note.id, note)
						db.saveNote(remoteNote, false)
					}
				} catch (error) {
					console.error('Failed to push note', note.id, error)
				} finally {
					dispatch({ type: 'SET_LOADING', payload: false })
				}
			}

			const remoteNotes = await TodoistService.fetchNotes()

			db.clearNotes()
			remoteNotes.forEach(note => db.saveNote(note, false))

			dispatch({ type: 'SET_NOTES', payload: db.getNotes() })
		} catch (e) {
			console.error('Sync Error', e)
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false })
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
			db.saveNote(newNote, true)

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
			db.saveNote(updatedNote, true)

			if (isOnline) runBackgroundSync()
		},
		[notes, isOnline, runBackgroundSync]
	)

	const deleteNote = useCallback(
		(id: string) => {
			dispatch({ type: 'DELETE_NOTE', payload: id })
			db.deleteNote(id)
			db.addPendingDeletion(id)

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
