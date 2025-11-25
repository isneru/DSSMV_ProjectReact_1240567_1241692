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

export type TodoistNote = {
	id: string
	user_id: string
	project_id: string
	content: string
	description: string
	priority: number
	due: {
		date: string
		is_recurring: boolean
		datetime: string
		string: string
		timezone: string
	} | null
	parent_id: string | null
	child_order: number
	section_id: string | null
	day_order: number
	collapsed: boolean
	labels: string[]
	added_by_uid: string
	assigned_by_uid: string | null
	responsible_uid: string | null
	checked: boolean
	is_deleted: boolean
	sync_id: string | null
	added_at: string
}

export type TodoistUser = {
	id: string
	token: string
	email: string
	full_name: string
	inbox_project_id: string
	tz_info: {
		timezone: string
		gmt_string: string
		hours: number
		minutes: number
		is_dst: number
	}
	start_page: string
	start_day: number
	next_week: number
	date_format: number
	time_format: number
	sort_order: number
	has_push_reminders: boolean
	default_reminder: string
	auto_reminder: number
	mobile_number: string | null
	mobile_host: string | null
	image_id: string
	is_premium: boolean
	premium_until: string | null
	is_biz_admin: boolean
	business_account_id: string | null
	joined_at: string
	theme: number
	days_off: number[]
}
