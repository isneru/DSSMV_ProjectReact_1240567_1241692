import { Theme, useTheme } from '@react-navigation/native'
import { ArrowDownIcon, ArrowUpIcon, FireIcon } from 'phosphor-react-native'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import api from '~/lib/axios/todoist-client'
import { useAuth } from '~/lib/context/auth/provider'
import { TodoistStatistics } from '~/lib/services/todoist/types'
import { rgbOpacity } from '~/lib/theme'

export default function StatsScreen() {
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme), [theme])
	const { session, status } = useAuth()
	const [loading, setLoading] = useState(false)
	const [statistics, setStatistics] = useState<TodoistStatistics | null>(null)

	const getData = useCallback(async () => {
		if (!session?.accessToken || status !== 'authenticated') return

		setLoading(true)
		try {
			const { data } = await api.get('tasks/completed/stats')
			setStatistics(data)
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false)
		}
	}, [session?.accessToken, status])

	useEffect(() => {
		getData()
	}, [getData])

	const rawDays = statistics?.days_items ?? []
	const daysData = useMemo(() => {
		return [...rawDays].slice(0, 7).reverse()
	}, [rawDays])

	const todayItem = rawDays.length > 0 ? rawDays[0] : null
	const todayCompleted = todayItem?.total_completed ?? 0
	const dailyGoal = statistics?.goals?.daily_goal ?? 5
	const progressPercentage = Math.min((todayCompleted / dailyGoal) * 100, 100)

	const maxCompletedInWeek = Math.max(
		...daysData.map(d => d.total_completed),
		0
	)
	const chartMaxValue = Math.max(maxCompletedInWeek, dailyGoal) * 1.2

	const goalLinePosition = (dailyGoal / chartMaxValue) * 100

	const getDayLabel = (dateStr: string | Date) => {
		const date = new Date(dateStr)
		return date.toLocaleDateString('en-US', { weekday: 'short' })
	}

	if (loading) {
		return (
			<View style={styles.container}>
				<Text style={styles.sectionTitle}>Loading...</Text>
			</View>
		)
	}

	if (!session?.accessToken || status !== 'authenticated') {
		return (
			<View style={styles.container}>
				<Text style={styles.sectionTitle}>
					Statistics only available for Todoist authenticated users.
				</Text>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<Text style={styles.sectionTitle}>Statistics</Text>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Karma</Text>
				<View style={styles.karmaRow}>
					<Text style={styles.karma}>{statistics?.karma}</Text>
					{statistics?.karma_trend === 'up' && (
						<View
							style={[
								styles.karmaTrendIcon,
								{ backgroundColor: rgbOpacity(theme.colors.primary, 0.2) }
							]}>
							<ArrowUpIcon size={16} color={theme.colors.primary} />
						</View>
					)}
					{statistics?.karma_trend === 'down' && (
						<View
							style={[
								styles.karmaTrendIcon,
								{ backgroundColor: rgbOpacity(theme.colors.notification, 0.2) }
							]}>
							<ArrowDownIcon size={16} color={theme.colors.notification} />
						</View>
					)}
				</View>
				<Text style={styles.subText}>
					Completed Tasks: {statistics?.completed_count} tasks
				</Text>
			</View>

			<Text style={styles.sectionTitle}>Daily Progress</Text>
			<View style={styles.gridRow}>
				<View
					style={[styles.card, styles.centerCard, { flex: 1, flexBasis: 0 }]}>
					<FireIcon size={32} color={theme.colors.primary} weight='fill' />
					<View style={styles.statContent}>
						<Text style={styles.bigNumber}>
							{statistics?.goals?.current_daily_streak?.count ?? 0}
						</Text>
						<Text style={styles.statLabel}>Day Streak</Text>
					</View>
					<Text style={styles.tinyText}>
						Personal Best: {statistics?.goals?.max_daily_streak?.count ?? 0}{' '}
						days
					</Text>
				</View>

				<View
					style={[styles.card, styles.centerCard, { flex: 1, flexBasis: 0 }]}>
					<CircularProgress
						size={80}
						strokeWidth={8}
						progress={progressPercentage}
						color={theme.colors.primary}
						emptyColor={rgbOpacity(theme.colors.border, 0.5)}>
						<View style={{ alignItems: 'center' }}>
							<Text style={styles.circleBigNumber}>{todayCompleted}</Text>
							<Text style={styles.circleSmallNumber}>/ {dailyGoal}</Text>
						</View>
					</CircularProgress>

					<Text style={styles.statLabel}>Today's Goal</Text>
				</View>
			</View>

			<Text style={styles.sectionTitle}>Last 7 Days Activity</Text>

			<View style={[styles.card, { paddingBottom: 8 }]}>
				<View style={styles.chartContainer}>
					<View
						style={[
							styles.goalLineContainer,
							{ bottom: `${goalLinePosition}%` }
						]}>
						<View style={styles.goalLineDashed} />
						<Text style={styles.goalLineText}>Goal: {dailyGoal}</Text>
					</View>

					{daysData.map((item, index) => {
						const heightPercent = (item.total_completed / chartMaxValue) * 100
						const isToday = index === daysData.length - 1

						return (
							<View key={index} style={styles.chartColumn}>
								<View style={{ flex: 1, justifyContent: 'flex-end' }}>
									<View
										style={[
											styles.bar,
											{
												height: `${heightPercent}%`,
												backgroundColor: isToday
													? theme.colors.primary
													: theme.colors.border
											}
										]}
									/>
								</View>
								<Text
									style={[
										styles.dayLabel,
										isToday && {
											color: theme.colors.primary,
											fontWeight: 'bold'
										}
									]}>
									{getDayLabel(item.date)}
								</Text>
							</View>
						)
					})}
				</View>
			</View>
		</View>
	)
}

const CircularProgress = ({
	size,
	strokeWidth,
	progress,
	color,
	emptyColor,
	children
}: {
	size: number
	strokeWidth: number
	progress: number
	color: string
	emptyColor: string
	children: React.ReactNode
}) => {
	const radius = (size - strokeWidth) / 2
	const circumference = radius * 2 * Math.PI
	const offset = circumference - (progress / 100) * circumference

	return (
		<View
			style={{
				width: size,
				height: size,
				justifyContent: 'center',
				alignItems: 'center'
			}}>
			<Svg
				width={size}
				height={size}
				style={{ transform: [{ rotate: '-90deg' }] }}>
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={emptyColor}
					strokeWidth={strokeWidth}
					fill='transparent'
				/>
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill='transparent'
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap='round'
				/>
			</Svg>
			<View
				style={{
					position: 'absolute',
					alignItems: 'center',
					justifyContent: 'center'
				}}>
				{children}
			</View>
		</View>
	)
}

const createStyles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			flexDirection: 'column',
			padding: 12,
			gap: 12
		},
		sectionTitle: {
			fontSize: 14,
			fontWeight: '600',
			color: rgbOpacity(theme.colors.text, 0.6),
			marginLeft: 4,
			textTransform: 'uppercase'
		},
		card: {
			backgroundColor: theme.colors.card,
			borderColor: theme.colors.border,
			borderWidth: 1,
			borderRadius: 12,
			padding: 16,
			gap: 4
		},
		centerCard: {
			alignItems: 'center',
			justifyContent: 'space-between',
			minHeight: 140
		},
		cardTitle: {
			fontSize: 16,
			fontWeight: '600',
			color: theme.colors.text
		},
		karma: {
			fontSize: 32,
			fontWeight: 'bold',
			color: theme.colors.text
		},
		karmaRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8
		},
		karmaTrendIcon: {
			borderRadius: 6,
			padding: 2,
			overflow: 'hidden'
		},
		completedTasks: {
			color: theme.colors.text,
			opacity: 0.6
		},
		gridRow: {
			flexDirection: 'row',
			gap: 12
		},
		progressBarBackground: {
			height: 6,
			width: '100%',
			backgroundColor: theme.colors.border,
			borderRadius: 10,
			marginTop: 8,
			overflow: 'hidden'
		},
		progressBarFill: {
			height: '100%',
			borderRadius: 10
		},
		progressRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8
		},
		statContent: {
			alignItems: 'center',
			gap: -4
		},
		bigNumber: {
			fontSize: 28,
			fontWeight: 'bold',
			color: theme.colors.text
		},
		statLabel: {
			fontSize: 14,
			color: theme.colors.text,
			fontWeight: '500'
		},
		tinyText: {
			color: theme.colors.text,
			opacity: 0.4,
			fontSize: 11,
			marginTop: 4
		},
		subText: {
			color: theme.colors.text,
			opacity: 0.6,
			fontSize: 12
		},
		circleBigNumber: {
			fontSize: 24,
			fontWeight: 'bold',
			color: theme.colors.text,
			lineHeight: 28
		},
		circleSmallNumber: {
			fontSize: 14,
			fontWeight: '500',
			color: theme.colors.text,
			opacity: 0.6
		},
		chartContainer: {
			flexDirection: 'row',
			alignItems: 'flex-end',
			justifyContent: 'space-between',
			height: 140,
			paddingTop: 30,
			position: 'relative'
		},
		chartColumn: {
			flex: 1,
			height: '100%',
			alignItems: 'center',
			justifyContent: 'flex-end',
			gap: 8
		},
		bar: {
			width: 12,
			borderRadius: 4,
			minHeight: 4
		},
		dayLabel: {
			fontSize: 12,
			color: theme.colors.text,
			opacity: 0.6
		},
		goalLineContainer: {
			position: 'absolute',
			left: 0,
			right: 0,
			flexDirection: 'row',
			alignItems: 'center'
		},
		goalLineDashed: {
			flex: 1,
			height: 0,
			borderBottomWidth: 1,
			borderColor: theme.colors.text,
			borderStyle: 'dashed',
			opacity: 0.3
		},
		goalLineText: {
			fontSize: 10,
			color: theme.colors.text,
			opacity: 0.5,
			marginLeft: 4,
			position: 'absolute',
			right: 0,
			bottom: 2
		}
	})
}
