import { Theme, useTheme } from '@react-navigation/native'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useAuth } from '~/lib/providers/auth-provider'

export default function SettingsScreen() {
	const theme = useTheme()
	const { session, status, login, logout } = useAuth()

	return (
		<View style={styles(theme).container}>
			<Text style={{ color: theme.colors.text }}>Settings</Text>
			<Text style={{ color: theme.colors.text }}>Status: {status}</Text>
			<Text style={{ color: theme.colors.text }}>
				Session: {JSON.stringify(session, null, 2)}
			</Text>
			<TouchableOpacity
				style={styles(theme).authBtn}
				onPress={status === 'unauthenticated' ? login : logout}>
				<Text style={styles(theme).text}>
					{status === 'unauthenticated' ? 'Login' : 'Logout'}
				</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			padding: 12
		},
		authBtn: {
			padding: 12,
			backgroundColor: theme.colors.primary,
			borderRadius: 8
		},
		text: {
			color: theme.colors.text,
			textAlign: 'center'
		}
	})
}
