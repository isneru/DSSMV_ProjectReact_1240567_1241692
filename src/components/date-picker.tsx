import DateTimePicker, {
	DateTimePickerEvent
} from '@react-native-community/datetimepicker'
import { useTheme } from '@react-navigation/native'
import { CalendarBlankIcon } from 'phosphor-react-native'
import { useState } from 'react'
import { Platform } from 'react-native'
import { Badge } from '~/components'
import {
	combineDateAndTime,
	extractDate,
	extractTime,
	formatDate
} from '~/lib/calendar'
import { Note } from '~/lib/types'

type Props = {
	isEditing?: boolean
	due: Note['due']
	setDue: (due: Note['due']) => void
}

export const DatePicker = ({ isEditing = true, due, setDue }: Props) => {
	const theme = useTheme()

	const [showDatePicker, setShowDatePicker] = useState(false)

	function onChangeDate(event: DateTimePickerEvent, selectedDate?: Date) {
		if (event.type === 'dismissed') {
			setShowDatePicker(false)
			return
		}

		const currentTime = extractTime(due)
		const currentDate = extractDate(selectedDate ?? due)

		const selectedDateWithTime = combineDateAndTime(currentDate, currentTime)

		setShowDatePicker(Platform.OS === 'ios')
		setDue(selectedDateWithTime)

		if (Platform.OS === 'android') setShowDatePicker(false)
	}

	return (
		<>
			<Badge
				label={due ? formatDate(due) : 'Date'}
				Icon={CalendarBlankIcon}
				onPress={() => isEditing && setShowDatePicker(true)}
				disabled={!isEditing}
			/>
			{showDatePicker && (
				<DateTimePicker
					value={due ?? new Date()}
					mode='date'
					display='default'
					onChange={onChangeDate}
					themeVariant={theme.dark ? 'dark' : 'light'}
				/>
			)}
		</>
	)
}
