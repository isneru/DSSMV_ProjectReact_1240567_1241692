export type TodoistMode = 'GET' | 'POST'

interface TodoistBase {
	id: string
	content: string
	description: string
	priority: number
	labels: string[]
	project_id: string | null
	section_id: string | null
	parent_id: string | null
	child_order: number
	day_order: number
	collapsed: boolean
	assigned_by_uid: string | null
	responsible_uid: string | null
}

export type TodoistNote<T extends TodoistMode> = TodoistBase &
	(T extends 'GET'
		? {
				user_id: string
				is_deleted: boolean
				checked: boolean
				added_at: string
				added_by_uid: string
				due: {
					date: string // "2025-12-11T18:15:00"
					timezone: string | null // null
					string: string // "11 Dec 18:15"
					lang: string // "en"
					is_recurring: boolean // false
				} | null
			}
		: {
				due_date: string | null
				due_datetime: string | null
				due_string: string | null
				due_lang: string | null
				due?: never
			})

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

export type TodoistStatistics = {
	completed_count: number
	days_items: DaysItem[]
	goals: Goals
	karma: number
	karma_graph_data: KarmaGraphDatum[]
	karma_last_update: number
	karma_trend: string
	karma_update_reasons: KarmaUpdateReason[]
	project_colors: { [key: string]: string }
	week_items: WeekItem[]
}

type DaysItem = {
	date: Date
	items: Item[]
	total_completed: number
}

type Item = {
	completed: number
	id: string
}

type Goals = {
	current_daily_streak: LyStreak
	current_weekly_streak: LyStreak
	daily_goal: number
	ignore_days: number[]
	karma_disabled: number
	last_daily_streak: LyStreak
	last_weekly_streak: LyStreak
	max_daily_streak: LyStreak
	max_weekly_streak: LyStreak
	user: string
	user_id: string
	vacation_mode: number
	weekly_goal: number
}

type LyStreak = {
	count: number
	end: Date
	start: Date
}

type KarmaGraphDatum = {
	date: Date
	karma_avg: number
}

type KarmaUpdateReason = {
	negative_karma: number
	negative_karma_reasons: any[]
	new_karma: number
	positive_karma: number
	positive_karma_reasons: number[]
	time: Date
}

type WeekItem = {
	from: Date
	items: Item[]
	to: Date
	total_completed: number
}
