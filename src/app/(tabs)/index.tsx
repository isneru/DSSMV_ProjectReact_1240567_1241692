import { Theme, useTheme } from '@react-navigation/native'
import { useMemo } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { NoteLink, WeatherWidget, WeekRow } from '~/components'
import { useAuth } from '~/lib/context/auth/provider'
import { useNotes } from '~/lib/context/notes/provider'
import { rgbOpacity } from '~/lib/theme'

export default function Index() {
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme), [theme])
	const { notes, isLoading, getNotes } = useNotes()
	const { session } = useAuth()

	return (
		<View style={styles.container}>
			<Text style={styles.sectionTitle}>Home</Text>
			<View style={styles.hero}>
				<View style={styles.greet}>
					<Text style={styles.textGreet}>Good Morning,</Text>
					<Text style={styles.textGreet}>
						{session?.user.name ?? 'Local user'}
					</Text>
				</View>
				<WeatherWidget />
			</View>
			<WeekRow />
			<FlatList
				data={notes}
				keyExtractor={item => item.id}
				renderItem={({ item }) => <NoteLink note={item} />}
				contentContainerStyle={{ gap: 8 }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isLoading}
						tintColor={theme.colors.background}
						progressBackgroundColor={theme.colors.primary}
						colors={[theme.colors.background]}
						onRefresh={getNotes}
					/>
				}
			/>
		</View>
	)
}

const createStyles = (theme: Theme) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			padding: 12,
			gap: 12
		},
		sectionTitle: {
			fontSize: 14,
			fontWeight: '600',
			color: rgbOpacity(theme.colors.text, 0.6),
			marginLeft: 4,
			textTransform: 'uppercase'
		},
		hero: {
			flexDirection: 'row',
			justifyContent: 'space-between'
		},
		greet: {
			paddingVertical: 8
		},
		textGreet: {
			color: theme.colors.text,
			fontSize: 18
		}
	})
}
