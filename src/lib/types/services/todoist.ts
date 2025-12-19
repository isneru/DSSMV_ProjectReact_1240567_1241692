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
