import { type Theme, useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { FileClock, House, Settings } from 'lucide-react-native'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

export const Navbar = () => {
	const router = useRouter()
	const theme = useTheme()

	return (
		<View style={styles(theme).container}>
			<TouchableOpacity
				onPress={() => router.navigate('/')}
				style={styles(theme).button}>
				<House size={20} color={theme.colors.text} />
			</TouchableOpacity>
			<TouchableOpacity
				onPress={() => router.navigate('/last-note')}
				style={styles(theme).button}>
				<FileClock size={20} color={theme.colors.text} />
			</TouchableOpacity>
			<TouchableOpacity
				onPress={() => router.navigate('/settings')}
				style={styles(theme).button}>
				<Settings size={20} color={theme.colors.text} />
			</TouchableOpacity>
		</View>
	)
}

const styles = (theme: Theme) => {
	const MARGIN = 8

	return StyleSheet.create({
		container: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			position: 'absolute',
			left: MARGIN,
			right: MARGIN,
			borderRadius: 12,
			padding: 8,
			minHeight: 56,
			bottom: MARGIN,
			backgroundColor: theme.colors.card,
			borderColor: theme.colors.border,
			borderWidth: 1,
			overflow: 'hidden',
			zIndex: 100
		},
		button: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center'
		},
		button_text: {
			textTransform: 'uppercase',
			color: theme.colors.text,
			textAlign: 'center',
			fontSize: 12,
			padding: 4
		}
	})
}
