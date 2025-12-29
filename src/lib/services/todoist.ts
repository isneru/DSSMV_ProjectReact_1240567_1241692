import api from '~/lib/axios/todoist-client'
import { fromDomainToTodoist, fromTodoistToDomain } from '~/lib/mappers'
import { Note } from '~/lib/types'

export const TodoistService = {
	async fetchTasks(): Promise<Note[]> {
		const { data } = await api.get('tasks')
		return data.results.map(fromTodoistToDomain)
	},

	async createTask(note: Partial<Note>): Promise<Note> {
		const payload = fromDomainToTodoist(note)
		const { data } = await api.post('tasks', payload)
		console.log(data)
		return fromTodoistToDomain(data)
	},

	async updateTask(id: string, note: Partial<Note>): Promise<Note> {
		const payload = fromDomainToTodoist(note)
		const { data } = await api.post(`tasks/${id}`, payload)
		console.log(data)
		return fromTodoistToDomain(data)
	},

	async deleteTask(id: string): Promise<void> {
		await api.delete(`tasks/${id}`)
	}
}
