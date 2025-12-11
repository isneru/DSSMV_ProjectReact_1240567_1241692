import { Theme, useTheme } from '@react-navigation/native'
import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Props = {
	monthDay: number
	weekDay: string
	isToday: boolean
}

export const WeekRowDay = ({ monthDay, weekDay, isToday }: Props) => {
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme, isToday), [theme, isToday])

	return (
		<View style={styles.container}>
			<Text style={styles.weekDay}>{weekDay}</Text>
			<Text style={styles.monthDay}>{monthDay}</Text>
		</View>
	)
}

const createStyles = (theme: Theme, isToday: boolean) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			borderRadius: 14,
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			aspectRatio: 1,
			backgroundColor: isToday ? theme.colors.primary : undefined
		},
		weekDay: {
			fontSize: 12,
			color: theme.colors.text
		},
		monthDay: {
			fontSize: 16,
			fontWeight: '600',
			color: theme.colors.text
		}
	})
}
