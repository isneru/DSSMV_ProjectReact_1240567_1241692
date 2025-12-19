export type Note = {
	id: string
	userId: string // 'local' ou o ID do user na api externa
	title: string
	content: string
	label: string | null
	due: Date | null
	isSynced?: boolean
}

export type TodoistTaskDTO = {
	id: string
	content: string
	description: string
	labels: string[]
	user_id: string
	due: {
		date: string
		string: string
		lang: string
		is_recurring: boolean
	} | null
}

export type CreateTodoistTaskDTO = {
	content: string
	description?: string
	due_date?: string | null
	labels?: string[]
}
