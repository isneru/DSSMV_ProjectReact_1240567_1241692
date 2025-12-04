import { Theme, useTheme } from '@react-navigation/native'
import { StyleSheet, View } from 'react-native'

export default function CalendarScreen() {
	const theme = useTheme()

	return <View style={styles(theme).container}></View>
}

const styles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			padding: 12
		}
	})
}
