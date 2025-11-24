import { Theme } from '@react-navigation/native'
import { Platform } from 'react-native'

export const colors = {
	light: {
		primary: '#a684ff',
		background: '#FFFFFF',
		card: '#F2F2F2',
		text: '#000000',
		border: '#C7C7CC',
		notification: '#FF3B30'
	},
	dark: {
		primary: '#8e51ff',
		background: '#010101',
		card: '#121212',
		text: '#E5E5E7',
		border: '#272729',
		notification: '#FF453A'
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

export const sizes = {
	sm: 12,
	base: 16,
	md: 18,
	lg: 24,
	xl: 32
} as const

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
