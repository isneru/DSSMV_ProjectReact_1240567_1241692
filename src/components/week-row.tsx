import { StyleSheet, View } from 'react-native'
import { WeekRowDay } from '~/components'

export const WeekRow = () => {
	const today = new Date()
	const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

	const days = Array.from({ length: 7 }, (_, i) => {
		const date = new Date(today)
		date.setDate(today.getDate() + (i - 3))
		return date
	})

	return (
		<View style={styles.container}>
			{days.map((date, index) => (
				<WeekRowDay
					key={index}
					monthDay={date.getDate()}
					weekDay={weekDays[date.getDay()]}
					isToday={index === 3}
				/>
			))}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	}
})
