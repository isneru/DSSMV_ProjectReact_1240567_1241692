import { Theme, useTheme } from '@react-navigation/native'
import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import { useAuth } from '~/lib/context/auth/provider'

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled'

export default function SettingsScreen() {
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme), [theme])
	const { session, status, login, logout } = useAuth()
	const [isBiometricEnabled, setIsBiometricEnabled] = useState(false)
	const [isSupported, setIsSupported] = useState(false)

	useEffect(() => {
		checkSupport()
	}, [])

	async function checkSupport() {
		const hasHardware = await LocalAuthentication.hasHardwareAsync()
		const isEnrolled = await LocalAuthentication.isEnrolledAsync()
		setIsSupported(hasHardware && isEnrolled)

		const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY)
		setIsBiometricEnabled(enabled === 'true')
	}

	async function toggleBiometric(value: boolean) {
		if (value) {
			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: 'Enable Biometric Authentication',
				cancelLabel: 'Cancel',
				disableDeviceFallback: false
			})
			if (!result.success) return
		}

		setIsBiometricEnabled(value)
		if (value) {
			await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true')
		} else {
			await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY)
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.sectionTitle}>Account</Text>
			<View style={styles.card}>
				<Text style={{ color: theme.colors.text }}>Status: {status}</Text>
				{session?.user.name && (
					<Text style={{ color: theme.colors.text, marginTop: 4 }}>
						User: {session.user.name}
					</Text>
				)}

				<TouchableOpacity
					style={styles.authBtn}
					onPress={status === 'unauthenticated' ? login : logout}>
					<Text style={styles.btnText}>
						{status === 'unauthenticated' ? 'Login with Todoist' : 'Logout'}
					</Text>
				</TouchableOpacity>
			</View>

			{isSupported && (
				<>
					<Text style={styles.sectionTitle}>Security</Text>
					<View style={styles.card}>
						<View style={styles.row}>
							<Text style={styles.rowText}>Biometric Lock</Text>
							<Switch
								value={isBiometricEnabled}
								onValueChange={toggleBiometric}
								thumbColor={theme.colors.text}
								trackColor={{
									false: theme.colors.border,
									true: theme.colors.primary
								}}
							/>
						</View>
					</View>
				</>
			)}
		</View>
	)
}

const createStyles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			padding: 12,
			gap: 12
		},
		sectionTitle: {
			fontSize: 14,
			fontWeight: '600',
			color: theme.colors.text,
			opacity: 0.6,
			marginLeft: 4,
			textTransform: 'uppercase'
		},
		card: {
			backgroundColor: theme.colors.card,
			borderRadius: 12,
			padding: 16,
			borderWidth: 1,
			borderColor: theme.colors.border,
			gap: 12
		},
		authBtn: {
			padding: 12,
			backgroundColor: theme.colors.primary,
			borderRadius: 8,
			marginTop: 8
		},
		btnText: {
			color: '#fff',
			textAlign: 'center',
			fontWeight: '600'
		},
		row: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center'
		},
		rowText: {
			fontSize: 16,
			color: theme.colors.text
		}
	})
}
