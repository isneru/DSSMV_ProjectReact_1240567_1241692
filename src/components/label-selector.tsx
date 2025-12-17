import { Theme, useTheme } from '@react-navigation/native'
import { TagIcon, XCircleIcon } from 'phosphor-react-native'
import { useEffect, useRef, useState } from 'react'
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { sizes } from '~/lib/theme'

type Props = {
	value: string
	onChange: (value: string) => void
}

export const LabelSelector = ({ value, onChange }: Props) => {
	const theme = useTheme()
	const [isEditing, setIsEditing] = useState(false)
	const [text, setText] = useState(value)
	const inputRef = useRef<TextInput>(null)

	useEffect(() => {
		setText(value)
	}, [value])

	useEffect(() => {
		if (isEditing) {
			inputRef.current?.focus()
		}
	}, [isEditing])

	const handleBlur = () => {
		setIsEditing(false)
		onChange(text)
	}

	const handleClear = () => {
		setText('')
		onChange('')
		setIsEditing(false)
	}

	if (isEditing) {
		return (
			<View style={styles(theme).chipInputContainer}>
				<TextInput
					ref={inputRef}
					style={styles(theme).input}
					value={text}
					onChangeText={setText}
					onBlur={handleBlur}
					placeholder='Enter tag name'
					placeholderTextColor={theme.colors.text + '80'}
					returnKeyType='done'
				/>
			</View>
		)
	}

	if (value && value.trim().length > 0) {
		return (
			<View style={styles(theme).chipContainer}>
				<TouchableOpacity
					style={styles(theme).chip}
					onPress={() => setIsEditing(true)}>
					<TagIcon size={14} color={theme.colors.text} weight='fill' />
					<Text style={styles(theme).chipText}>{value}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={handleClear} style={styles(theme).clearBtn}>
					<XCircleIcon size={16} color={theme.colors.text} weight='fill' />
				</TouchableOpacity>
			</View>
		)
	}

	return (
		<TouchableOpacity
			style={styles(theme).addBtn}
			onPress={() => setIsEditing(true)}>
			<TagIcon size={16} color={theme.colors.primary} />
			<Text style={styles(theme).addBtnText}>Add Tag</Text>
		</TouchableOpacity>
	)
}

const styles = (theme: Theme) =>
	StyleSheet.create({
		chipContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			alignSelf: 'flex-start',
			gap: 4
		},
		chip: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: theme.colors.card,
			paddingVertical: 6,
			paddingHorizontal: 12,
			borderRadius: 16,
			borderWidth: 1,
			borderColor: theme.colors.border,
			gap: 6
		},
		chipText: {
			color: theme.colors.text,
			fontSize: sizes.sm,
			fontWeight: '600'
		},
		clearBtn: {
			padding: 4,
			opacity: 0.6
		},
		addBtn: {
			flexDirection: 'row',
			alignItems: 'center',
			alignSelf: 'flex-start',
			paddingVertical: 6,
			paddingHorizontal: 12,
			borderRadius: 16,
			backgroundColor: theme.colors.primary + '15',
			gap: 6
		},
		addBtnText: {
			color: theme.colors.primary,
			fontSize: sizes.sm,
			fontWeight: '600'
		},
		chipInputContainer: {
			alignSelf: 'flex-start',
			minWidth: 100
		},
		input: {
			backgroundColor: theme.colors.card,
			paddingVertical: 6,
			paddingHorizontal: 12,
			borderRadius: 16,
			borderWidth: 1,
			borderColor: theme.colors.primary,
			color: theme.colors.text,
			fontSize: sizes.sm
		}
	})
