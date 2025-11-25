import {
	createMaterialTopTabNavigator,
	MaterialTopTabNavigationEventMap,
	MaterialTopTabNavigationOptions
} from '@react-navigation/material-top-tabs'
import { ParamListBase, TabNavigationState } from '@react-navigation/native'
import { withLayoutContext } from 'expo-router'
import { Navbar } from '~/components/navbar'

const { Navigator } = createMaterialTopTabNavigator()

export const MaterialTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Navigator)

export default function TabLayout() {
	return (
		<MaterialTopTabs
			tabBar={props => <Navbar {...props} />}
			tabBarPosition='bottom'
			screenOptions={{
				swipeEnabled: true,
				animationEnabled: true
			}}>
			<MaterialTopTabs.Screen name='index' options={{ title: 'Home' }} />
			<MaterialTopTabs.Screen name='settings' options={{ title: 'Settings' }} />
		</MaterialTopTabs>
	)
}
