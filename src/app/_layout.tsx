import { ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import {
	SafeAreaProvider,
	useSafeAreaInsets
} from 'react-native-safe-area-context'
import { AlertProvider } from '~/lib/providers/alert-provider'
import { AuthProvider } from '~/lib/providers/auth-provider'
import { NotesProvider } from '~/lib/providers/notes-provider'
import { WeatherProvider } from '~/lib/providers/weather-provider'
import { theme } from '~/lib/theme'

export default function RootLayout() {
	const colorScheme = useColorScheme()
	const insets = useSafeAreaInsets()
	const selectedTheme = theme[colorScheme || 'light']

	return (
		<AuthProvider>
			<WeatherProvider>
				<ThemeProvider value={selectedTheme}>
					<AlertProvider>
						<NotesProvider>
							<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
							<SafeAreaProvider
								style={{
									backgroundColor: selectedTheme.colors.background
								}}>
								<Stack
									screenOptions={{
										headerShown: false,
										contentStyle: {
											paddingTop: insets.top,
											paddingBottom: insets.bottom
										}
									}}>
									<Stack.Screen
										name='note/new'
										options={{
											presentation: 'modal'
										}}
									/>
								</Stack>
							</SafeAreaProvider>
						</NotesProvider>
					</AlertProvider>
				</ThemeProvider>
			</WeatherProvider>
		</AuthProvider>
	)
}
