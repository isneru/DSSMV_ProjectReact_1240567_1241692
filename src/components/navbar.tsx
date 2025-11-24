import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { FileClock, House } from 'lucide-react-native'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const MARGIN = 12

export const Navbar = () => {
	const insets = useSafeAreaInsets()
	const router = useRouter()
	const theme = useTheme()

	return (
		<View
			style={[
				styles.container,
				{
					bottom: insets.bottom + MARGIN,
					backgroundColor: theme.colors.primary
				}
			]}>
			<TouchableOpacity
				onPress={() => router.navigate('/')}
				style={styles.button}>
				<House size={20} color='white' />
			</TouchableOpacity>
			<TouchableOpacity
				onPress={() => router.navigate('/last-note')}
				style={styles.button}>
				<FileClock size={20} color='white' />
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		position: 'absolute',
		left: MARGIN,
		right: MARGIN,
		borderRadius: 16,
		padding: 8,
		minHeight: 56
	},
	button: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	button_text: {
		textTransform: 'uppercase',
		color: 'white',
		textAlign: 'center',
		fontSize: 12,
		padding: 4
	}
})
