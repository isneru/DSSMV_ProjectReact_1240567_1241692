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
			<Text style={styles(theme, isToday).text}>{weekDay}</Text>
			<Text style={styles(theme, isToday).text}>{monthDay}</Text>
		</View>
	)
}

const styles = (theme: Theme, isToday: boolean) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			borderRadius: 8,
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			minHeight: 44,
			backgroundColor: isToday ? theme.colors.primary : undefined
		},
		text: {
			color: theme.colors.text
		}
	})
}
