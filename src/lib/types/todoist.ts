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
