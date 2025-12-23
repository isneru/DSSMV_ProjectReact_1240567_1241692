import { Theme, useTheme } from '@react-navigation/native'
import { Icon as IconType } from 'phosphor-react-native'
import React, { useMemo } from 'react'
import {
	StyleProp,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewStyle
} from 'react-native'
import { rgbOpacity } from '~/lib/theme'

type BadgeProps = {
	label: string
	Icon?: IconType
	onPress?: () => void
	containerStyle?: StyleProp<ViewStyle>
	disabled?: boolean
}

export const Badge = ({
	label,
	Icon,
	onPress,
	containerStyle,
	disabled = false
}: BadgeProps) => {
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme), [theme])

	const Container = onPress ? TouchableOpacity : View

	return (
		<Container
			style={[
				styles.container,
				{
					backgroundColor: disabled
						? rgbOpacity(theme.colors.primary, 0.2)
						: theme.colors.primary,
					justifyContent: Icon ? 'flex-start' : 'center'
				},
				containerStyle
			]}
			onPress={onPress}
			disabled={disabled}
			activeOpacity={0.7}>
			{Icon && (
				<View style={styles.iconContainer}>
					<Icon
						size={14}
						color={disabled ? theme.colors.primary : theme.colors.text}
						weight='fill'
					/>
				</View>
			)}

			<Text
				style={[
					styles.text,
					{
						color: disabled ? theme.colors.primary : theme.colors.text
					}
				]}
				numberOfLines={1}>
				{label}
			</Text>
		</Container>
	)
}

const createStyles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingVertical: 4,
			paddingHorizontal: 8,
			borderRadius: 999
		},
		disabled: {
			opacity: 0.5
		},
		iconContainer: {
			marginRight: 6
		},
		text: {
			fontSize: 14,
			fontWeight: '500',
			textAlign: 'center'
		}
	})
}
