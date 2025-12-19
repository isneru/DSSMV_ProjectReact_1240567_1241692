import { CreateTodoistTaskDTO, Note, TodoistTaskDTO } from '~/lib/types'

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

export function fromDBToDomain(row: any): Note {
	return {
		id: row.id,
		userId: row.userId,
		title: row.title,
		content: row.content,
		label: row.label,
		due: row.due ? new Date(row.due) : null,
		isSynced: row.userId !== 'local'
	}
}

export function fromDomainToDB(note: Note) {
	return {
		id: note.id,
		userId: note.userId,
		title: note.title,
		content: note.content,
		label: note.label,
		due: note.due ? note.due.toISOString() : null
	}
}
