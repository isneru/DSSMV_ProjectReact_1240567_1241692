import { Theme, useTheme } from '@react-navigation/native'
import { StyleSheet, Text, View } from 'react-native'

type Props = {
	monthDay: number
	weekDay: string
	isToday: boolean
}

export const WeekRowDay = ({ monthDay, weekDay, isToday }: Props) => {
	const theme = useTheme()

	return (
		<View style={styles(theme, isToday).container}>
			<Text style={styles(theme, isToday).weekDay}>{weekDay}</Text>
			<Text style={styles(theme, isToday).monthDay}>{monthDay}</Text>
		</View>
	)
}

const styles = (theme: Theme, isToday: boolean) => {
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
