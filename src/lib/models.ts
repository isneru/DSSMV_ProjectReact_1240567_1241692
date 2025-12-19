import * as Crypto from 'expo-crypto'
import { Note, TodoistNote } from '~/lib/types'

export class NoteEntity implements Note {
	id: string
	userId: string
	title: string
	content: string
	due: Date | null
	label: string | null

	constructor(data: Partial<Note>) {
		this.id = data.id ?? Crypto.randomUUID()
		this.userId = data.userId ?? 'local'
		this.title = data.title ?? 'No title'
		this.content = data.content ?? ''
		this.due = data.due ?? null
		this.label = data.label ?? null
	}

	static fromTodoist(data: TodoistNote<'GET'>) {
		return new NoteEntity({
			id: data.id,
			userId: data.user_id,
			title: data.content,
			content: data.description,
			label: data.labels[0] ?? null,
			due: data.due?.date ? new Date(data.due.date) : null
		})
	}

	toTodoistFormat() {
		const todoistNote: Partial<TodoistNote<'POST'>> = {
			id: this.id,
			content: this.title,
			description: this.content,
			due_date: this.due ? this.due.toISOString().replace('Z', '') : null,
			labels: this.label ? [this.label] : []
		}

		console.log('Converted to Todoist format:', todoistNote)

		return todoistNote
	}

	static createLocal(data: Partial<Note>): NoteEntity {
		return new NoteEntity({
			id: data.id ?? Crypto.randomUUID(),
			userId: 'local',
			title: data.title ?? '',
			content: data.content ?? '',
			label: data.label ?? null,
			due: data.due ?? null
		})
	}
}
