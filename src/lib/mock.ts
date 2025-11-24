import { Note } from '~/lib/types'

export const notes: Note[] = [
	{
		userId: '1',
		id: '1',
		title: 'Note 1',
		content: 'Content 1',
		priority: 1,
		label: 'Label 1',
		projectId: '1',
		due: {
			dateOnly: '2025-11-24',
			dateTime: '2025-11-24T00:00:00',
			dueString: '2025-11-24'
		}
	},
	{
		userId: '1',
		id: '2',
		title: 'Note 2',
		content: 'Content 2',
		priority: 2,
		label: 'Label 2',
		projectId: '2',
		due: {
			dateOnly: '2025-11-25',
			dateTime: '2025-11-25T00:00:00',
			dueString: '2025-11-25'
		}
	},
	{
		userId: '1',
		id: '3',
		title: 'Note 3',
		content: 'Content 3',
		priority: 3,
		label: 'Label 3',
		projectId: '3',
		due: {
			dateOnly: '2025-11-26',
			dateTime: '2025-11-26T00:00:00',
			dueString: '2025-11-26'
		}
	},
	{
		userId: '1',
		id: '4',
		title: 'Note 4',
		content: 'Content 4',
		priority: 4,
		label: 'Label 4',
		projectId: '4',
		due: {
			dateOnly: '2025-11-27',
			dateTime: '2025-11-27T00:00:00',
			dueString: '2025-11-27'
		}
	},
	{
		userId: '1',
		id: '5',
		title: 'Note 5',
		content: 'Content 5',
		priority: 5,
		label: 'Label 5',
		projectId: '5',
		due: {
			dateOnly: '2025-11-28',
			dateTime: '2025-11-28T00:00:00',
			dueString: '2025-11-28'
		}
	}
]
