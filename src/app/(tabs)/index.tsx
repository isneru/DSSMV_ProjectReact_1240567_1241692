import { Theme, useTheme } from '@react-navigation/native'
import { useMemo } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { NoteLink, WeatherWidget, WeekRow } from '~/components'
import { useAuth } from '~/lib/providers/auth-provider'
import { useNotes } from '~/lib/providers/notes-provider'
import { sizes } from '~/lib/theme'

export default function Index() {
	const theme = useTheme()
	const styles = useMemo(() => createStyles(theme), [theme])
	const { notes, isLoading, getNotes } = useNotes()
	const { session } = useAuth()

	return (
		<View style={styles.container}>
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
		hero: {
			flexDirection: 'row',
			justifyContent: 'space-between'
		},
		greet: {
			paddingVertical: 8,
			paddingHorizontal: 12
		},
		textGreet: {
			color: theme.colors.text,
			fontSize: sizes.md
		}
	})
}
