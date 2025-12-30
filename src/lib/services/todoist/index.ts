import api from '~/lib/axios/todoist-client'
import {
	fromDomainToTodoist,
	fromTodoistToDomain
} from '~/lib/services/todoist/mappers'
import { Note } from '~/lib/types'

export const TodoistService = {
	async fetchNotes(): Promise<Note[]> {
		const { data } = await api.get('tasks')
		return data.results.map(fromTodoistToDomain)
	},

	async createNote(note: Partial<Note>): Promise<Note> {
		const payload = fromDomainToTodoist(note)
		const { data } = await api.post('tasks', payload)
		return fromTodoistToDomain(data)
	},

	async updateNote(id: string, note: Partial<Note>): Promise<Note> {
		const payload = fromDomainToTodoist(note)
		const { data } = await api.post(`tasks/${id}`, payload)
		return fromTodoistToDomain(data)
	},

	async deleteNote(id: string): Promise<void> {
		await api.delete(`tasks/${id}`)
	}
}
