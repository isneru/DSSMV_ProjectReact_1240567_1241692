import DateTimePicker, {
	DateTimePickerEvent
} from '@react-native-community/datetimepicker'
import { useTheme } from '@react-navigation/native'
import { ClockIcon } from 'phosphor-react-native'
import { useState } from 'react'
import { Platform } from 'react-native'
import { Badge } from '~/components'
import {
	combineDateAndTime,
	extractDate,
	extractTime,
	formatTime
} from '~/lib/calendar'
import { Note } from '~/lib/types'

type Props = {
	isEditing?: boolean
	due: Note['due']
	setDue: (due: Note['due']) => void
}

export const TimePicker = ({ isEditing = true, due, setDue }: Props) => {
	const theme = useTheme()

	const [showTimePicker, setShowTimePicker] = useState(false)

	function onChangeTime(event: DateTimePickerEvent, selectedTime?: Date) {
		if (event.type === 'dismissed') {
			setShowTimePicker(false)
			return
		}

		const currentDate = extractDate(due)
		const currentTime = extractTime(selectedTime ?? due)

		const selectedTimeWithDate = combineDateAndTime(currentDate, currentTime)

		setShowTimePicker(Platform.OS === 'ios')
		setDue(selectedTimeWithDate)

		if (Platform.OS === 'android') setShowTimePicker(false)
	}

	return (
		<>
			<Badge
				label={due ? formatTime(due) : 'Hour'}
				Icon={ClockIcon}
				onPress={() => isEditing && setShowTimePicker(true)}
				disabled={!isEditing}
			/>

			{showTimePicker && (
				<DateTimePicker
					value={due ?? new Date()}
					mode='time'
					display='default'
					onChange={onChangeTime}
					themeVariant={theme.dark ? 'dark' : 'light'}
				/>
			)}
		</>
	)
}
