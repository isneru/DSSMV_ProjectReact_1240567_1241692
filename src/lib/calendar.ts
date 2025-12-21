export const calendarLocale = {
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

export function extractTime(date: Date | null) {
	if (!date) return '00:00:00'

	const dateISO = date.toISOString()
	const timePart = dateISO.split('T')[1] // YYYY-MM-DDThh:mm:ssZ -> hh:mm:ssZ
	return timePart.split('Z')[0] // hh:mm:ssZ -> hh:mm:ss
}

export function extractDate(date: Date | null) {
	if (!date) {
		const now = new Date()
		return now.toISOString().split('T')[0]
	}

	const dateISO = date.toISOString()
	const datePart = dateISO.split('T')[0] // YYYY-MM-DDThh:mm:ssZ -> YYYY-MM-DD
	return datePart
}

export function combineDateAndTime(date: string, time: string) {
	return new Date(`${date}T${time}`)
}

export function formatDate(date: Date) {
	return date.toLocaleDateString('pt-PT', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	})
}

export function formatTime(time: Date) {
	return time.toLocaleTimeString('pt-PT', {
		hour: '2-digit',
		minute: '2-digit'
	})
}

export function toDateString(date: Date) {
	return date.toISOString().split('T')[0]
}
