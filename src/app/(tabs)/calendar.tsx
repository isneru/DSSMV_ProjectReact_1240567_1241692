import { Theme, useTheme } from '@react-navigation/native'
import { useMemo, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { NoteLink } from '~/components'
import { useNotes } from '~/lib/providers/notes-provider'

LocaleConfig.locales['en'] = {
	monthNames: [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	],
	monthNamesShort: [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	],
	dayNames: [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday'
	],
	dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	today: 'Today'
}
LocaleConfig.defaultLocale = 'en'

export default function CalendarScreen() {
	const theme = useTheme()
	const { notes } = useNotes()
	const [selectedDate, setSelectedDate] = useState(
		new Date().toISOString().split('T')[0]
	)

	const markedDates = useMemo(() => {
		const marks: any = {}

		notes.forEach(note => {
			if (note.due.dateOnly) {
				marks[note.due.dateOnly] = {
					marked: true,
					dotColor: theme.colors.primary
				}
			}
		})

		marks[selectedDate] = {
			...(marks[selectedDate] || {}),
			selected: true,
			selectedColor: theme.colors.primary,
			disableTouchEvent: true
		}

		return marks
	}, [notes, selectedDate, theme.colors.primary])

	const selectedNotes = notes.filter(n => n.due.dateOnly === selectedDate)

	return (
		<View style={styles(theme).container}>
			<Text style={styles(theme).sectionTitle}>Calendar</Text>
			<Calendar
				onDayPress={day => setSelectedDate(day.dateString)}
				markedDates={markedDates}
				theme={{
					backgroundColor: theme.colors.card,
					calendarBackground: theme.colors.card,
					textSectionTitleColor: theme.colors.text,
					selectedDayBackgroundColor: theme.colors.primary,
					selectedDayTextColor: '#ffffffff',
					todayTextColor: theme.colors.primary,
					dayTextColor: theme.colors.text,
					textDisabledColor: theme.colors.border,
					monthTextColor: theme.colors.text,
					arrowColor: theme.colors.primary
				}}
				style={styles(theme).calendar}
			/>

			<View style={styles(theme).listContainer}>
				<Text style={styles(theme).headerText}>Tasks for {selectedDate}</Text>
				<FlatList
					data={selectedNotes}
					keyExtractor={item => item.id}
					renderItem={({ item }) => <NoteLink note={item} />}
					ListEmptyComponent={
						<Text
							style={{
								color: theme.colors.text,
								opacity: 0.5,
								textAlign: 'center',
								marginTop: 20
							}}>
							No tasks for this day.
						</Text>
					}
				/>
			</View>
		</View>
	)
}

const styles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			padding: 12,
			gap: 16
		},
		sectionTitle: {
			fontSize: 14,
			fontWeight: '600',
			color: theme.colors.text,
			opacity: 0.6,
			marginLeft: 4,
			textTransform: 'uppercase'
		},
		calendar: {
			borderRadius: 12,
			borderWidth: 1,
			borderColor: theme.colors.border
		},
		listContainer: {
			flex: 1,
			gap: 8
		},
		headerText: {
			fontSize: 18,
			fontWeight: 'bold',
			color: theme.colors.text,
			marginBottom: 8
		},
		itemRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8
		},
		day: {
			width: 32,
			height: 32,
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 16
		}
	})
}
