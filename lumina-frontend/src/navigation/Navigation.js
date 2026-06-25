import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import HomeGuestScreen from "../screens/guest/HomeGuestScreen";
import StoryDetailScreen from "../screens/guest/StoryDetailScreen";
import LoginScreen from "../screens/guest/LoginScreen";
import RegisterScreen from "../screens/guest/RegisterScreen";
import ChapterReadScreen from "../screens/guest/ChapterReadScreen";
import ForgotPasswordScreen from "../screens/guest/ForgotPasswordScreen";
import SearchScreen from "../screens/guest/SearchScreen";
import UserNavigation from "./UserNavigation";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import GlobalConfirmModal from "../components/GlobalConfirmModal";

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
				tabBarActiveTintColor: "#8B4513",
				tabBarInactiveTintColor: "#AAAAAA",
				tabBarActiveBackgroundColor: "#FFFFFF",
				tabBarInactiveBackgroundColor: "#FFFFFF",
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
				children={({ navigation }) => (
					<View style={styles.loginPrompt}>
						<MaterialIcons name="auto-stories" size={60} color="#EBEBEB" />
						<Text style={styles.loginPromptTitle}>Thư viện của bạn</Text>
						<Text style={styles.loginPromptSub}>Đăng nhập để lưu và xem lại những truyện yêu thích.</Text>
						<TouchableOpacity style={styles.loginPromptBtn} onPress={() => navigation.navigate("LoginTab")}>
							<Text style={styles.loginPromptBtnText}>Đăng nhập ngay</Text>
						</TouchableOpacity>
					</View>
				)}
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
	const { user } = useSelector(state => state.auth);

	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{!user ? (
					<>
						<Stack.Screen name="Guest" component={GuestTabs} />
						<Stack.Screen name="Login" component={LoginScreen} />
						<Stack.Screen name="Register" component={RegisterScreen} />
						<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
						<Stack.Screen name="ChapterRead" component={ChapterReadScreen} />
						<Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
					</>
				) : user.role_id === 1 ? (
					<>
						<Stack.Screen name="Admin" component={AdminDashboardScreen} />
						<Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
						<Stack.Screen name="ChapterRead" component={ChapterReadScreen} />
					</>
				) : (
					<>
						<Stack.Screen name="Reader" component={UserNavigation} />
						<Stack.Screen name="ChapterRead" component={ChapterReadScreen} />
						<Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
					</>
				)}
			</Stack.Navigator>
			<GlobalConfirmModal />
		</NavigationContainer>
	);
};

// ==========================================
// STYLES (CSS)
// ==========================================
const styles = StyleSheet.create({
	tabBar: {
		backgroundColor: "#FFFFFF",
		borderTopWidth: 1,
		borderTopColor: "#F0F0F0",
		height: 60,
		paddingBottom: 6,
		paddingTop: 6,
	},
	tabLabel: {
		fontSize: 10,
		fontWeight: "600",
	},
	tabItem: {
		borderRadius: 8,
	},
	placeholder: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
	},
	placeholderText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#888888",
	},
	loginPrompt: { flex: 1, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
	loginPromptTitle: { fontSize: 20, fontWeight: "800", color: "#1A1A1A" },
	loginPromptSub: { fontSize: 14, color: "#888888", textAlign: "center", lineHeight: 20 },
	loginPromptBtn: { marginTop: 8, backgroundColor: "#8B4513", paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999 },
	loginPromptBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});

export default Navigation;
