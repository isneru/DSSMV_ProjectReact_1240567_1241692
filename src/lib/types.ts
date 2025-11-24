export type Note = {
	id: string
	userId: string
	content: string
	title: string
	priority: number
	label: string
	projectId: string
	due: {
		dateOnly: string
		dateTime: string
		dueString: string
	}
}
