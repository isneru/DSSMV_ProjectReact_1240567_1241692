import { useTheme } from '@react-navigation/native'
import { Button, Text, View } from 'react-native'
import { useAuth } from '~/lib/providers'

export default function SettingsScreen() {
	const theme = useTheme()
	const { session, status, login, logout } = useAuth()

	return (
		<View style={{ flex: 1, padding: 12 }}>
			<Text style={{ color: theme.colors.text }}>Settings</Text>
			<Text style={{ color: theme.colors.text }}>Status: {status}</Text>
			<Text style={{ color: theme.colors.text }}>
				Session: {JSON.stringify(session, null, 2)}
			</Text>
			<Button
				title={status === 'unauthenticated' ? 'Login' : 'Logout'}
				onPress={status === 'unauthenticated' ? login : logout}
			/>
		</View>
	)
}
