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
