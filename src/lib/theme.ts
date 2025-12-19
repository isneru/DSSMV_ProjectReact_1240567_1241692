import { Theme } from '@react-navigation/native'
import { Platform } from 'react-native'

export const colors = {
	light: {
		primary: 'rgb(166, 132, 255)',
		background: 'rgb(255, 255, 255)',
		card: 'rgb(250, 250, 250)',
		text: 'rgb(0, 0, 0)',
		border: 'rgb(212, 212, 216)',
		notification: 'rgb(255, 59, 48)'
	},
	dark: {
		primary: 'rgb(142, 81, 255)',
		background: 'rgb(1, 1, 1)',
		card: 'rgb(18, 18, 18)',
		text: 'rgb(229, 229, 231)',
		border: 'rgb(39, 39, 41)',
		notification: 'rgb(255, 69, 58)'
	}
}

const WEB_FONT_STACK =
	'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'

export const fonts = Platform.select({
	web: {
		regular: {
			fontFamily: WEB_FONT_STACK,
			fontWeight: '400'
		},
		medium: {
			fontFamily: WEB_FONT_STACK,
			fontWeight: '500'
		},
		bold: {
			fontFamily: WEB_FONT_STACK,
			fontWeight: '600'
		},
		heavy: {
			fontFamily: WEB_FONT_STACK,
			fontWeight: '700'
		}
	},
	ios: {
		regular: {
			fontFamily: 'System',
			fontWeight: '400'
		},
		medium: {
			fontFamily: 'System',
			fontWeight: '500'
		},
		bold: {
			fontFamily: 'System',
			fontWeight: '600'
		},
		heavy: {
			fontFamily: 'System',
			fontWeight: '700'
		}
	},
	default: {
		regular: {
			fontFamily: 'sans-serif',
			fontWeight: 'normal'
		},
		medium: {
			fontFamily: 'sans-serif-medium',
			fontWeight: 'normal'
		},
		bold: {
			fontFamily: 'sans-serif',
			fontWeight: '600'
		},
		heavy: {
			fontFamily: 'sans-serif',
			fontWeight: '700'
		}
	}
}) as Theme['fonts']

export const theme: Record<'dark' | 'light', Theme> = {
	dark: {
		dark: true,
		colors: colors.dark,
		fonts
	},
	light: {
		dark: false,
		colors: colors.light,
		fonts
	}
}

export function rgbOpacity(rgbValue: string, opacity: number) {
	const [r, g, b] = rgbValue.match(/\d+/g)?.map(Number) || []
	return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
