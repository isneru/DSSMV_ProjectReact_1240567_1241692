export type Note = {
	id: string
	userId: string // 'local' ou o ID do user na api externa
	title: string
	content: string
	label: string | null
	due: Date | null
	isSynced?: boolean
}
