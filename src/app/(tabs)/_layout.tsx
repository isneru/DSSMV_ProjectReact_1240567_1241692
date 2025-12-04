import {
	createMaterialTopTabNavigator,
	MaterialTopTabNavigationEventMap,
	MaterialTopTabNavigationOptions
} from '@react-navigation/material-top-tabs'
import {
	ParamListBase,
	TabNavigationState,
	useTheme
} from '@react-navigation/native'
import { withLayoutContext } from 'expo-router'
import {
	CalendarDotsIcon,
	FileDashedIcon,
	FileIcon,
	GearSixIcon,
	HouseIcon
} from 'phosphor-react-native'
import { Navbar } from '~/components/navbar'
import { useNotes } from '~/lib/providers/notes-provider'

const { Navigator } = createMaterialTopTabNavigator()

export const MaterialTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Navigator)

export default function TabLayout() {
	const { lastAccessedNoteId } = useNotes()
	const theme = useTheme()

	return (
		<MaterialTopTabs
			tabBar={props => <Navbar {...props} />}
			tabBarPosition='bottom'
			screenOptions={{
				swipeEnabled: true,
				animationEnabled: true,
				tabBarActiveTintColor: theme.colors.text,
				tabBarInactiveTintColor: theme.colors.text
			}}>
			<MaterialTopTabs.Screen
				name='calendar'
				options={{
					title: 'Calendar',
					tabBarIcon: ({ color, focused }) => (
						<CalendarDotsIcon
							weight={focused ? 'fill' : 'regular'}
							size={20}
							color={color}
						/>
					)
				}}
			/>
			<MaterialTopTabs.Screen
				name='index'
				options={{
					title: 'Home',
					tabBarIcon: ({ color, focused }) => (
						<HouseIcon
							weight={focused ? 'fill' : 'regular'}
							size={20}
							color={color}
						/>
					)
				}}
			/>
			<MaterialTopTabs.Screen
				name='note/[id]'
				listeners={{
					tabPress: e => {
						if (!lastAccessedNoteId) {
							e.preventDefault()
						}
					}
				}}
				options={{
					title: 'Last Note',
					swipeEnabled: false,
					tabBarStyle: { display: 'none' },
					tabBarIcon: ({ color, focused }) => {
						const Icon = lastAccessedNoteId ? FileIcon : FileDashedIcon
						return (
							<Icon
								weight={focused ? 'fill' : 'regular'}
								size={20}
								color={color}
							/>
						)
					}
				}}
			/>
			<MaterialTopTabs.Screen
				name='settings'
				options={{
					title: 'Settings',
					tabBarIcon: ({ color, focused }) => (
						<GearSixIcon
							weight={focused ? 'fill' : 'regular'}
							size={20}
							color={color}
						/>
					)
				}}
			/>
		</MaterialTopTabs>
	)
}
