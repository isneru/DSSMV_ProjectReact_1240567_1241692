import { StyleSheet, Text, View } from 'react-native'

type Props = {
	monthDay: number
	weekDay: string
	isToday: boolean
}

export const WeekRowDay = ({ monthDay, weekDay, isToday }: Props) => {
	return (
		<View style={[styles.container, isToday && { backgroundColor: 'blue' }]}>
			<Text>{monthDay}</Text>
			<Text>{weekDay}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	}
})
