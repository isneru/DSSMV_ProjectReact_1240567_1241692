import { Theme, useTheme } from '@react-navigation/native'
import { TagIcon, XIcon } from 'phosphor-react-native'
import { useMemo, useState } from 'react'
import {
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { Badge } from '~/components'
import { Note } from '~/lib/types'

type Props = {
	isEditing?: boolean
	label: Note['label']
	setLabel: (label: Note['label']) => void
}

export const LabelPicker = ({ isEditing = true, label, setLabel }: Props) => {
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme), [theme])

	const [showLabelModal, setShowLabelModal] = useState(false)

	return (
		<>
			<Badge
				label={label ?? 'Label'}
				Icon={TagIcon}
				onPress={() => isEditing && setShowLabelModal(true)}
				disabled={!isEditing}
			/>
			{showLabelModal && (
				<Modal
					visible={showLabelModal}
					transparent={true}
					animationType='fade'
					onRequestClose={() => setShowLabelModal(false)}>
					<View style={styles.modalOverlay}>
						<View style={styles.modalContent}>
							<View style={styles.modalHeader}>
								<Text style={styles.modalTitle}>Edit Label</Text>
								<TouchableOpacity onPress={() => setShowLabelModal(false)}>
									<XIcon color={theme.colors.text} size={20} />
								</TouchableOpacity>
							</View>
							<TextInput
								value={label ?? 'Label'}
								onChangeText={setLabel}
								placeholder='Enter label...'
								placeholderTextColor={theme.colors.border}
								style={styles.modalInput}
								autoFocus
							/>
							<TouchableOpacity
								style={styles.modalSaveButton}
								onPress={() => setShowLabelModal(false)}>
								<Text style={styles.modalSaveText}>Done</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			)}
		</>
	)
}

const createStyles = (theme: Theme) => {
	return StyleSheet.create({
		modalOverlay: {
			flex: 1,
			backgroundColor: 'rgba(0,0,0,0.5)',
			justifyContent: 'center',
			alignItems: 'center'
		},
		modalContent: {
			width: '80%',
			backgroundColor: theme.colors.card,
			borderRadius: 12,
			padding: 16,
			elevation: 5
		},
		modalHeader: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 12
		},
		modalTitle: {
			color: theme.colors.text,
			fontSize: 16,
			fontWeight: 'bold'
		},
		modalInput: {
			borderWidth: 1,
			borderColor: theme.colors.border,
			borderRadius: 8,
			padding: 10,
			color: theme.colors.text,
			marginBottom: 16
		},
		modalSaveButton: {
			backgroundColor: theme.colors.primary,
			borderRadius: 8,
			paddingVertical: 10,
			alignItems: 'center'
		},
		modalSaveText: {
			color: theme.colors.text,
			fontWeight: '600'
		}
	})
}
