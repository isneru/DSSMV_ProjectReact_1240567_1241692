import { type Theme, useTheme } from '@react-navigation/native'
import { useMemo } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export type AlertButton = {
	text: string
	style?: 'default' | 'cancel' | 'destructive'
	onPress?: () => void
}

type Props = {
	visible: boolean
	title: string
	message?: string
	buttons?: AlertButton[]
	onClose: () => void
}

export const AlertPortal = ({
	visible,
	title,
	message,
	buttons = [],
	onClose
}: Props) => {
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme), [theme])

	return (
		<Modal
			transparent
			visible={visible}
			animationType='fade'
			onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={styles.alertContainer}>
					<Text style={styles.title}>{title}</Text>
					{message && <Text style={styles.message}>{message}</Text>}

					<View style={styles.buttonContainer}>
						{buttons.length > 0 ? (
							buttons.map((btn, index) => (
								<TouchableOpacity
									key={index}
									style={[styles.button, index > 0 && styles.buttonBorder]}
									onPress={() => {
										onClose()
										btn.onPress?.()
									}}>
									<Text
										style={[
											styles.buttonText,
											btn.style === 'destructive' && styles.destructiveText,
											btn.style === 'cancel' && styles.cancelText
										]}>
										{btn.text}
									</Text>
								</TouchableOpacity>
							))
						) : (
							<TouchableOpacity style={styles.button} onPress={onClose}>
								<Text style={styles.buttonText}>OK</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
			</View>
		</Modal>
	)
}

const createStyles = (theme: Theme) => {
	return StyleSheet.create({
		overlay: {
			flex: 1,
			backgroundColor: 'rgba(0, 0, 0, 0.5)',
			justifyContent: 'center',
			alignItems: 'center',
			padding: 24
		},
		alertContainer: {
			backgroundColor: theme.colors.card,
			borderRadius: 14,
			width: '100%',
			maxWidth: 320,
			alignItems: 'center',
			paddingTop: 20,
			shadowColor: '#000',
			borderColor: theme.colors.border,
			borderWidth: 1,
			shadowOffset: {
				width: 0,
				height: 2
			},
			shadowOpacity: 0.25,
			shadowRadius: 4,
			elevation: 5
		},
		title: {
			fontSize: 17,
			fontWeight: '600',
			color: theme.colors.text,
			marginBottom: 4,
			textAlign: 'center',
			paddingHorizontal: 16
		},
		message: {
			fontSize: 13,
			color: theme.colors.text,
			textAlign: 'center',
			marginBottom: 20,
			paddingHorizontal: 16,
			opacity: 0.8
		},
		buttonContainer: {
			flexDirection: 'row',
			borderTopWidth: StyleSheet.hairlineWidth,
			borderTopColor: theme.colors.border,
			width: '100%'
		},
		button: {
			flex: 1,
			paddingVertical: 12,
			alignItems: 'center',
			justifyContent: 'center'
		},
		buttonBorder: {
			borderLeftWidth: StyleSheet.hairlineWidth,
			borderLeftColor: theme.colors.border
		},
		buttonText: {
			fontSize: 17,
			color: theme.colors.primary,
			fontWeight: '400'
		},
		destructiveText: {
			color: theme.colors.notification,
			fontWeight: '600'
		},
		cancelText: {
			color: theme.colors.text,
			fontWeight: '600'
		}
	})
}
