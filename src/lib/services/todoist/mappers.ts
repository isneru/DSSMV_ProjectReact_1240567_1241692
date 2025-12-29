import {
	CreateTodoistTaskDTO,
	TodoistTaskDTO
} from '~/lib/services/todoist/types'
import { Note } from '~/lib/types'

export function fromTodoistToDomain(task: TodoistTaskDTO): Note {
	return {
		id: task.id,
		userId: task.user_id,
		title: task.content,
		content: task.description,
		label: task.labels?.[0] ?? null,
		due: task.due?.date ? new Date(task.due.date) : null,
		isSynced: true
	}
}

export function fromDomainToTodoist(note: Partial<Note>): CreateTodoistTaskDTO {
	return {
		content: note.title ?? 'No title',
		description: note.content ?? '',
		due_date: note.due ? note.due.toISOString() : null,
		labels: note.label ? [note.label] : []
	}
}
