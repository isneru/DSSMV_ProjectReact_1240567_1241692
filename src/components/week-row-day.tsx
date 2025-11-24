import { useTheme } from '@react-navigation/native'
import { StyleSheet, Text, View } from 'react-native'

type Props = {
	monthDay: number
	weekDay: string
	isToday: boolean
}

export const WeekRowDay = ({ monthDay, weekDay, isToday }: Props) => {
	const theme = useTheme()

	return (
		<View
			style={[
				styles.container,
				isToday && { backgroundColor: theme.colors.primary }
			]}>
			<Text style={{ color: theme.colors.text }}>{weekDay}</Text>
			<Text style={{ color: theme.colors.text }}>{monthDay}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		aspectRatio: 9 / 10,
		borderRadius: 12,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	}
})
