import { useTheme } from '@react-navigation/native'
import { Href, useRouter } from 'expo-router'
import { useState } from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNotes } from '~/lib/providers/notes-provider'

export default function NewNoteScreen() {
	const router = useRouter()
	const theme = useTheme()
	const { addNote } = useNotes()

	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleBack = () => {
		if (router.canGoBack()) {
			router.back()
		} else {
			router.replace('/' as Href)
		}
	}

	const handleSave = async () => {
		if (!title.trim() && !content.trim()) return

		setIsSubmitting(true)
		try {
			await addNote({
				title,
				content,
				priority: 1 // Default priority
			})
			handleBack()
		} catch (error) {
			console.error('Failed to create note:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<SafeAreaView style={styles(theme).container} edges={['bottom']}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles(theme).keyboardView}>
				<View style={styles(theme).header}>
					<TouchableOpacity onPress={handleBack}>
						<Text style={styles(theme).cancelButton}>Cancel</Text>
					</TouchableOpacity>
					<Text style={styles(theme).headerTitle}>New Note</Text>
					<TouchableOpacity
						onPress={handleSave}
						disabled={isSubmitting || (!title.trim() && !content.trim())}>
						<Text
							style={[
								styles(theme).saveButton,
								!title.trim() && !content.trim() && styles(theme).disabledButton
							]}>
							Save
						</Text>
					</TouchableOpacity>
				</View>

				<View style={styles(theme).content}>
					<TextInput
						style={styles(theme).titleInput}
						placeholder='Title'
						placeholderTextColor={theme.colors.text + '80'}
						value={title}
						onChangeText={setTitle}
						autoFocus
					/>
					<TextInput
						style={styles(theme).contentInput}
						placeholder='Note'
						placeholderTextColor={theme.colors.text + '80'}
						value={content}
						onChangeText={setContent}
						multiline
						textAlignVertical='top'
					/>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

const styles = (theme: any) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.colors.background
		},
		keyboardView: {
			flex: 1
		},
		header: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingHorizontal: 16,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: theme.colors.border
		},
		headerTitle: {
			fontSize: 17,
			fontWeight: '600',
			color: theme.colors.text
		},
		cancelButton: {
			fontSize: 17,
			color: theme.colors.primary
		},
		saveButton: {
			fontSize: 17,
			fontWeight: '600',
			color: theme.colors.primary
		},
		disabledButton: {
			opacity: 0.5
		},
		content: {
			flex: 1,
			padding: 16
		},
		titleInput: {
			fontSize: 24,
			fontWeight: 'bold',
			color: theme.colors.text,
			marginBottom: 16
		},
		contentInput: {
			flex: 1,
			fontSize: 16,
			color: theme.colors.text,
			lineHeight: 24
		}
	})
