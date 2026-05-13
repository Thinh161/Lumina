import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/common/LoginScreen";
import RegisterScreen from "../screens/common/RegisterScreen";
import ChapterReadScreen from "../screens/common/ChapterReadScreen";
import UserNavigation from "./UserNavigation";
import GuestNavigation from "./GuestNavigation";

const Stack = createNativeStackNavigator();

const Navigation = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName="Guest"
				screenOptions={{ headerShown: false }}
			>
				<Stack.Screen name="Guest" component={GuestNavigation} />
				<Stack.Screen name="Login" component={LoginScreen} />
				<Stack.Screen name="Register" component={RegisterScreen} />
				<Stack.Screen name="User" component={UserNavigation} />
				<Stack.Screen name="ChapterRead" component={ChapterReadScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default Navigation;
