import { Ionicons } from '@expo/vector-icons'
import { type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs'
import { type Theme, useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { GearSixIcon, HouseIcon } from 'phosphor-react-native'
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'

const { width } = Dimensions.get('window')
const TAB_BAR_HEIGHT = 60
const FAB_SIZE = 56
const FAB_RADIUS = FAB_SIZE / 2
const MARGIN = 16
const BORDER_RADIUS = 24

export const Navbar = ({
	state,
	descriptors,
	navigation
}: MaterialTopTabBarProps) => {
	const router = useRouter()
	const theme = useTheme()

	const links = [
		{
			name: 'index',
			icon: HouseIcon
		},
		{
			name: 'settings',
			icon: GearSixIcon
		}
	]

	const getPath = () => {
		const navWidth = width - MARGIN * 2
		const center = navWidth / 2
		const STROKE_WIDTH = 1
		const HALF_STROKE = STROKE_WIDTH / 2

		const FAB_PADDING = 6
		const R = FAB_RADIUS + FAB_PADDING
		const r = 24
		const cy = 2

		const d = R + r
		const dy = r - cy
		const dx = Math.sqrt(d * d - dy * dy)

		const startX = center - dx
		const endX = center + dx

		const Px = center - (dx * R) / d
		const Py = cy + (dy * R) / d

		return `
			M${HALF_STROKE},${BORDER_RADIUS}
			Q${HALF_STROKE},${HALF_STROKE} ${BORDER_RADIUS},${HALF_STROKE}
			L${startX},${HALF_STROKE}
			A${r},${r} 0 0,1 ${Px},${Py + HALF_STROKE}
			A${R},${R} 0 0,0 ${center + (center - Px)},${Py + HALF_STROKE}
			A${r},${r} 0 0,1 ${endX},${HALF_STROKE}
			L${navWidth - BORDER_RADIUS},${HALF_STROKE}
			Q${navWidth - HALF_STROKE},${HALF_STROKE} ${
			navWidth - HALF_STROKE
		},${BORDER_RADIUS}
			L${navWidth - HALF_STROKE},${TAB_BAR_HEIGHT - BORDER_RADIUS}
			Q${navWidth - HALF_STROKE},${TAB_BAR_HEIGHT - HALF_STROKE} ${
			navWidth - BORDER_RADIUS
		},${TAB_BAR_HEIGHT - HALF_STROKE}
			L${BORDER_RADIUS},${TAB_BAR_HEIGHT - HALF_STROKE}
			Q${HALF_STROKE},${TAB_BAR_HEIGHT - HALF_STROKE} ${HALF_STROKE},${
			TAB_BAR_HEIGHT - BORDER_RADIUS
		}
			Z
		`
	}

	const navWidth = width - MARGIN * 2

	const onTabPress = (routeIndex: number, routeName: string) => {
		const isFocused = state.index === routeIndex

		const event = navigation.emit({
			type: 'tabPress',
			target: state.routes[routeIndex].key,
			canPreventDefault: true
		})

		if (!isFocused && !event.defaultPrevented) {
			navigation.navigate(routeName)
		}
	}

	return (
		<View style={styles(theme).container}>
			<View style={styles(theme).backgroundContainer}>
				<Svg width={navWidth} height={TAB_BAR_HEIGHT}>
					<Path
						d={getPath()}
						fill={theme.colors.card}
						stroke={theme.colors.border}
						strokeWidth={1}
					/>
				</Svg>
			</View>

			<View style={styles(theme).contentContainer}>
				<View style={styles(theme).fabContainer}>
					<TouchableOpacity
						onPress={() => router.push('/note/new')}
						style={styles(theme).fab}>
						<Ionicons name='add' size={32} color={theme.colors.text} />
					</TouchableOpacity>
				</View>

				{links.map((link, index) => (
					<TouchableOpacity
						key={index}
						onPress={() => onTabPress(index, link.name)}
						style={styles(theme).button}>
						<link.icon
							weight={state.index === index ? 'fill' : 'regular'}
							size={20}
							color={theme.colors.text}
						/>
					</TouchableOpacity>
				))}
			</View>
		</View>
	)
}

const styles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			position: 'absolute',
			bottom: MARGIN,
			left: MARGIN,
			right: MARGIN,
			height: TAB_BAR_HEIGHT,
			zIndex: 100,
			backgroundColor: 'transparent'
		},
		backgroundContainer: {
			position: 'absolute',
			bottom: 0,
			left: 0,
			right: 0
		},
		contentContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			height: '100%',
			paddingHorizontal: 20
		},
		button: {
			alignItems: 'center',
			justifyContent: 'center',
			padding: 10
		},
		fabContainer: {
			position: 'absolute',
			top: -25,
			left: (width - MARGIN * 2) / 2 - FAB_RADIUS,
			width: FAB_SIZE,
			height: FAB_SIZE,
			borderRadius: FAB_RADIUS,
			elevation: 6,
			zIndex: 101
		},
		fab: {
			width: '100%',
			height: '100%',
			borderRadius: FAB_RADIUS,
			backgroundColor: theme.colors.primary,
			alignItems: 'center',
			justifyContent: 'center'
		}
	})
}
