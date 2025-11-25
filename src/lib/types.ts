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

export type User = {
	id: string | null | undefined
	name: string | null | undefined
	email: string | null | undefined
}

export type Session = {
	user: User
	accessToken: string
	expires?: Date
}
