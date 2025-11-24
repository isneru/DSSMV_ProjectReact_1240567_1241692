import { ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import {
	SafeAreaProvider,
	useSafeAreaInsets
} from 'react-native-safe-area-context'
import { Navbar } from '~/components'
import { themes } from '~/lib/theme'

export default function RootLayout() {
	const colorScheme = useColorScheme()
	const insets = useSafeAreaInsets()

	const theme = themes[colorScheme || 'light']

	return (
		<ThemeProvider value={theme}>
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
			<SafeAreaProvider
				style={{
					backgroundColor: theme.colors.background
				}}>
				<Stack
					screenOptions={{
						headerShown: false,
						contentStyle: { paddingTop: insets.top }
					}}
				/>
				<Navbar />
			</SafeAreaProvider>
		</ThemeProvider>
	)
}
