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
	ChartBarIcon,
	GearSixIcon,
	HouseIcon
} from 'phosphor-react-native'
import { Navbar } from '~/components/navbar'

const { Navigator } = createMaterialTopTabNavigator()

export const MaterialTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Navigator)

export default function TabLayout() {
	const theme = useTheme()

	return (
		<MaterialTopTabs
			initialRouteName='index'
			tabBar={props => <Navbar {...props} />}
			tabBarPosition='bottom'
			screenOptions={{
				lazy: true,
				swipeEnabled: true,
				animationEnabled: true,
				tabBarActiveTintColor: theme.colors.text,
				tabBarInactiveTintColor: theme.colors.text,
				sceneStyle: { paddingBottom: 76 }
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
				name='statistics'
				options={{
					title: 'Stats',
					tabBarIcon: ({ color, focused }) => (
						<ChartBarIcon
							weight={focused ? 'fill' : 'regular'}
							size={20}
							color={color}
						/>
					)
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
