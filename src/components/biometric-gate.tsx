import { Theme, useTheme } from '@react-navigation/native'
import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'
import { FingerprintIcon, LockKeyIcon } from 'phosphor-react-native'
import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode
} from 'react'
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled'

type Props = {
	children: ReactNode
}

export const BiometricGate = ({ children }: Props) => {
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme), [theme])

	const [isLocked, setIsLocked] = useState(true)
	const [biometryType, setBiometryType] =
		useState<LocalAuthentication.AuthenticationType | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	const authenticate = useCallback(async () => {
		try {
			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: 'Unlock Tick it',
				fallbackLabel: 'Use code',
				cancelLabel: 'Cancel',
				disableDeviceFallback: false
			})

			if (result.success) {
				setIsLocked(false)
			}
		} catch (error) {
			console.error('Authentication failed', error)
		}
	}, [setIsLocked])

	const checkBiometricSettings = useCallback(async () => {
		try {
			const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY)

			if (enabled !== 'true') {
				setIsLocked(false)
				setIsLoading(false)
				return
			}

			const hasHardware = await LocalAuthentication.hasHardwareAsync()
			const isEnrolled = await LocalAuthentication.isEnrolledAsync()

			if (hasHardware && isEnrolled) {
				const types =
					await LocalAuthentication.supportedAuthenticationTypesAsync()
				if (types.length > 0) {
					setBiometryType(types[0])
				}
				authenticate()
			} else {
				setIsLocked(false)
			}
			setIsLoading(false)
		} catch (error) {
			console.error('Error checking biometric settings', error)
			setIsLocked(false)
			setIsLoading(false)
		}
	}, [authenticate])

	useEffect(() => {
		checkBiometricSettings()
	}, [checkBiometricSettings])

	if (isLoading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size='large' color={theme.colors.primary} />
			</View>
		)
	}

	if (isLocked) {
		return (
			<View style={styles.container}>
				<View style={styles.iconContainer}>
					{biometryType ===
					LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION ? (
						<FingerprintIcon size={64} color={theme.colors.primary} />
					) : (
						<LockKeyIcon size={64} color={theme.colors.primary} />
					)}
				</View>
				<Text style={styles.title}>Tick it Locked</Text>
				<TouchableOpacity style={styles.button} onPress={authenticate}>
					<Text style={styles.buttonText}>Try Again</Text>
				</TouchableOpacity>
			</View>
		)
	}

	return children
}

const createStyles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.colors.background,
			alignItems: 'center',
			justifyContent: 'center',
			padding: 24
		},
		iconContainer: {
			marginBottom: 24,
			padding: 20,
			borderRadius: 50,
			backgroundColor: theme.colors.card,
			borderWidth: 1,
			borderColor: theme.colors.border
		},
		title: {
			fontSize: 24,
			fontWeight: 'bold',
			color: theme.colors.text,
			marginBottom: 32
		},
		button: {
			paddingVertical: 12,
			paddingHorizontal: 32,
			backgroundColor: theme.colors.primary,
			borderRadius: 12
		},
		buttonText: {
			color: theme.colors.background,
			fontSize: 16,
			fontWeight: '600'
		}
	})
}
