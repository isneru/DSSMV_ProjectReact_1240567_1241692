import { useTheme, type Theme } from '@react-navigation/native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
	FloppyDiskBackIcon,
	NewspaperIcon,
	PencilIcon,
	TagIcon
} from 'phosphor-react-native'
import { useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Linking,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { Markdown, themes } from 'react-native-remark'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNotes } from '~/lib/providers/notes-provider'
import { sizes } from '~/lib/theme'

export default function NoteScreen() {
	const theme = useTheme()
	const insets = useSafeAreaInsets()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { notes, updateNote, isLoading } = useNotes()
	const router = useRouter()

	const note = notes.find(note => note.id === id)

	useEffect(() => {
		if (!isLoading && !note) {
			router.replace('/')
		}
	}, [isLoading, note, router])

	const [isEditing, setIsEditing] = useState(false)
	const [content, setContent] = useState(note?.content ?? '')
	const [title, setTitle] = useState(note?.title ?? '')
	// Assume que a tag existe ou usa string vazia
	const [tag, setTag] = useState((note as any)?.tag ?? '')

	useEffect(() => {
		if (note) {
			setTitle(note.title)
			setContent(note.content)
			setTag((note as any)?.tag ?? '')
		}
	}, [note])

	const { styles, markdownTheme } = useMemo(() => {
		const appStyles = createStyles(theme, insets)

		// CORREÇÃO 1: Usar 'paragraph' em vez de 'text'
		const mdTheme = {
			...themes.defaultTheme,
			paragraph: {
				color: theme.colors.text,
				fontSize: sizes.md,
				lineHeight: sizes.md * 1.5
			},
			listItem: {
				color: theme.colors.text,
				fontSize: sizes.md,
				lineHeight: sizes.md * 1.5
			}
		}
		return { styles: appStyles, markdownTheme: mdTheme }
	}, [theme, insets])

	async function handleSaveNoteClick() {
		if (!note) return

		// CORREÇÃO 2: Usar 'as any' para ignorar o erro de tipo da Tag temporariamente
		const updatePayload = {
			title,
			content,
			tag
		} as any

		await updateNote(note.id, updatePayload)
		setIsEditing(false)
	}

	if (isLoading || !note) {
		return (
			<View
				style={[
					styles.container,
					{ justifyContent: 'center', alignItems: 'center' }
				]}>
				<ActivityIndicator size='large' color={theme.colors.primary} />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View style={{ flex: 1 }}>
					<TextInput
						editable={isEditing}
						style={styles.title}
						value={title}
						onChangeText={setTitle}
						placeholder='Título'
						placeholderTextColor={theme.colors.border}
					/>

					{/* Área da Tag */}
					<View style={styles.tagContainer}>
						<TagIcon size={16} color={theme.colors.primary} weight='fill' />
						{isEditing ? (
							<TextInput
								value={tag}
								onChangeText={setTag}
								placeholder='Adicionar tag...'
								placeholderTextColor={theme.colors.border}
								style={styles.tagInput}
							/>
						) : (
							<Text style={styles.tagText}>
								{tag.trim() === '' ? 'Tag' : tag}
							</Text>
						)}
					</View>
				</View>

				<View style={styles.actions}>
					<TouchableOpacity
						style={styles.button}
						onPress={() => setIsEditing(prev => !prev)}>
						{isEditing ? (
							<NewspaperIcon
								weight='bold'
								size={20}
								color={theme.colors.text}
							/>
						) : (
							<PencilIcon weight='bold' size={20} color={theme.colors.text} />
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.button, isLoading && { opacity: 0.5 }]}
						onPress={handleSaveNoteClick}
						disabled={isLoading}>
						<FloppyDiskBackIcon
							weight='fill'
							size={20}
							color={theme.colors.text}
						/>
					</TouchableOpacity>
				</View>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
					keyboardShouldPersistTaps='handled'>
					{isEditing ? (
						<TextInput
							style={styles.input}
							value={content}
							onChangeText={setContent}
							multiline={true}
							textAlignVertical='top'
							autoFocus={false}
							scrollEnabled={false}
						/>
					) : (
						<View style={styles.mdContainer}>
							<Markdown
								theme={markdownTheme}
								markdown={content}
								onLinkPress={url => Linking.openURL(url)}
							/>
						</View>
					)}
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	)
}

const createStyles = (theme: Theme, insets: { top: number }) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.colors.background,
			paddingTop: insets.top
		},
		header: {
			paddingHorizontal: 16,
			paddingVertical: 12,
			flexDirection: 'row',
			gap: 12,
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			borderBottomWidth: 1,
			borderBottomColor: theme.colors.border
		},
		title: {
			color: theme.colors.text,
			fontSize: sizes.xl,
			fontWeight: 'bold',
			marginBottom: 4
		},
		tagContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			paddingVertical: 4,
			paddingHorizontal: 0,
			borderRadius: 4,
			alignSelf: 'flex-start'
		},
		tagInput: {
			color: theme.colors.primary,
			fontSize: sizes.sm,
			padding: 0,
			minWidth: 50
		},
		tagText: {
			color: theme.colors.primary,
			fontSize: sizes.sm,
			fontWeight: '600'
		},
		actions: {
			flexDirection: 'row',
			gap: 8,
			paddingTop: 4
		},
		button: {
			padding: 10,
			backgroundColor: theme.colors.card,
			borderWidth: 1,
			borderColor: theme.colors.border,
			borderRadius: 8,
			alignItems: 'center',
			justifyContent: 'center'
		},
		input: {
			color: theme.colors.text,
			fontSize: sizes.md,
			flex: 1,
			textAlignVertical: 'top',
			padding: 16,
			minHeight: 300
		},
		mdContainer: {
			flex: 1,
			paddingHorizontal: 16,
			paddingTop: 16
		}
	})
}
