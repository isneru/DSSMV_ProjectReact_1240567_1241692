export interface Note {
	id: string
	userId: string
	title: string
	content: string
	due: Date | null
	label: string | null
}
