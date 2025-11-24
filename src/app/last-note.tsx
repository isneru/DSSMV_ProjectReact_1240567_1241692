import { useTheme } from '@react-navigation/native'
import { Text, View } from 'react-native'

export default function LastNoteScreen() {
	const theme = useTheme()

	return (
		<View style={{ flex: 1, padding: 12 }}>
			<Text style={{ color: theme.colors.text }}>Last Note</Text>
		</View>
	)
}
