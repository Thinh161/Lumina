import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

import HomeGuestScreen from "../screens/guest/HomeGuestScreen";
import StoryDetailScreen from "../screens/guest/StoryDetailScreen";
import LoginScreen from "../screens/guest/LoginScreen";
import RegisterScreen from "../screens/guest/RegisterScreen";
import ChapterReadScreen from "../screens/guest/ChapterReadScreen";
import SearchScreen from "../screens/guest/SearchScreen";
import UserNavigation from "./UserNavigation";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();

// ==========================================
// VIEW COMPONENTS
// ==========================================
const PlaceholderScreen = ({ label }) => {
	return (
		<View style={styles.placeholder}>
			<Text style={styles.placeholderText}>Màn hình {label}</Text>
		</View>
	);
};

// ==========================================
// NAVIGATION COMPONENTS
// ==========================================
const GuestHomeStack = () => {
	return (
		<HomeStack.Navigator screenOptions={{ headerShown: false }}>
			<HomeStack.Screen name="HomeMain" component={HomeGuestScreen} />
			<HomeStack.Screen name="StoryDetail" component={StoryDetailScreen} />
		</HomeStack.Navigator>
	);
};

const GuestSearchStack = () => {
	return (
		<SearchStack.Navigator screenOptions={{ headerShown: false }}>
			<SearchStack.Screen name="SearchMain" component={SearchScreen} />
			<SearchStack.Screen name="StoryDetail" component={StoryDetailScreen} />
		</SearchStack.Navigator>
	);
};

const GuestTabs = () => {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: true,
				tabBarActiveTintColor: "#fff7f5",
				tabBarInactiveTintColor: "#323331",
				tabBarActiveBackgroundColor: "#8c4f3b",
				tabBarInactiveBackgroundColor: "rgba(252, 249, 247, 0.92)",
				tabBarStyle: styles.tabBar,
				tabBarLabelStyle: styles.tabLabel,
				tabBarItemStyle: styles.tabItem,
			}}
		>
			<Tab.Screen
				name="HomeTab"
				component={GuestHomeStack}
				options={{
					tabBarLabel: "Trang chủ",
					tabBarIcon: ({ color, size }) => (
						<MaterialIcons name="home" size={size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="LibraryTab"
				children={() => <PlaceholderScreen label="Thư viện" />}
				options={{
					tabBarLabel: "Thư viện",
					tabBarIcon: ({ color, size }) => (
						<MaterialIcons name="auto-stories" size={size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="SearchTab"
				component={GuestSearchStack}
				options={{
					tabBarLabel: "Tìm kiếm",
					tabBarIcon: ({ color, size }) => (
						<MaterialIcons name="search" size={size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="LoginTab"
				component={LoginScreen}
				options={{
					tabBarLabel: "Đăng nhập",
					tabBarIcon: ({ color, size }) => (
						<MaterialIcons name="person" size={size} color={color} />
					),
				}}
			/>
		</Tab.Navigator>
	);
};

const Navigation = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName="Guest"
				screenOptions={{ headerShown: false }}
			>
				<Stack.Screen name="Guest" component={GuestTabs} />
				<Stack.Screen name="Login" component={LoginScreen} />
				<Stack.Screen name="Register" component={RegisterScreen} />
				<Stack.Screen name="ChapterRead" component={ChapterReadScreen} />
				<Stack.Screen name="Reader" component={UserNavigation} />
			</Stack.Navigator>
		</NavigationContainer>
	);
};

// ==========================================
// STYLES (CSS)
// ==========================================
const styles = StyleSheet.create({
	tabBar: {
		backgroundColor: "rgba(252, 249, 247, 0.92)",
		borderTopWidth: 1,
		borderTopColor: "rgba(179, 178, 175, 0.2)",
		height: 64,
		paddingBottom: 8,
		paddingTop: 8,
	},
	tabLabel: {
		fontSize: 9,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
	},
	tabItem: {
		borderRadius: 999,
		marginHorizontal: 8,
		overflow: "hidden",
	},
	placeholder: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#fcf9f7",
	},
	placeholderText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#5f5f5d",
	},
});

export default Navigation;
