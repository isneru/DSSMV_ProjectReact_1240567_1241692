import { Theme, useTheme } from '@react-navigation/native'
import { useMemo, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking'
import { NoteLink } from '~/components'
import { calendarLocale } from '~/lib/calendar'
import { useNotes } from '~/lib/context/notes/provider'

LocaleConfig.locales['en'] = calendarLocale
LocaleConfig.defaultLocale = 'en'

const toDateString = (date: Date) => {
	return date.toISOString().split('T')[0]
}

export default function CalendarScreen() {
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme), [theme])
	const { notes } = useNotes()

	const [selectedDate, setSelectedDate] = useState(toDateString(new Date()))

	const markedDates = useMemo(() => {
		const marks: { [dateKey: string]: MarkingProps } = {}

		notes.forEach(note => {
			if (!note.due) return

			const dateKey = toDateString(note.due)

			marks[dateKey] = {
				marked: true,
				dotColor: theme.colors.primary
			}
		})

		marks[selectedDate] = {
			...(marks[selectedDate] || {}),
			selected: true,
			selectedColor: theme.colors.primary,
			selectedTextColor: theme.colors.text,
			disableTouchEvent: true
		}

		return marks
	}, [notes, selectedDate, theme.colors.primary, theme.colors.text])

	const selectedNotes = useMemo(() => {
		return notes.filter(note => {
			if (!note.due) return false
			return toDateString(note.due) === selectedDate
		})
	}, [notes, selectedDate])

	return (
		<View style={styles.container}>
			<Text style={styles.sectionTitle}>Calendar</Text>
			<Calendar
				key={theme.dark ? 'dark' : 'light'}
				onDayPress={day => setSelectedDate(day.dateString)}
				markedDates={markedDates}
				theme={{
					backgroundColor: theme.colors.card,
					calendarBackground: theme.colors.card,
					textSectionTitleColor: theme.colors.text,
					selectedDayBackgroundColor: theme.colors.primary,
					selectedDayTextColor: theme.colors.text,
					todayTextColor: theme.colors.primary,
					dayTextColor: theme.colors.text,
					textDisabledColor: theme.colors.border,
					monthTextColor: theme.colors.text,
					arrowColor: theme.colors.primary,
					dotColor: theme.colors.primary,
					selectedDotColor: theme.colors.text
				}}
				style={styles.calendar}
			/>

			<View style={styles.listContainer}>
				<Text style={styles.headerText}>Tasks for {selectedDate}</Text>
				<FlatList
					data={selectedNotes}
					keyExtractor={item => item.id}
					renderItem={({ item }) => <NoteLink note={item} />}
					contentContainerStyle={{ gap: 8 }}
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

const createStyles = (theme: Theme) => {
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
		}
	})
}
