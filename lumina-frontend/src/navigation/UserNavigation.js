import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";

import HomeScreen from "../screens/reader/HomeScreen";
import ProfileScreen from "../screens/reader/ProfileScreen";
import LibraryScreen from "../screens/reader/LibraryScreen";
import EditProfileScreen from "../screens/reader/EditProfileScreen";
import ChangePasswordScreen from "../screens/reader/ChangePasswordScreen";
import AuthorDashboardScreen from "../screens/author/AuthorDashboardScreen";
import AddChapterScreen from "../screens/author/AddChapterScreen";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import SearchScreen from "../screens/guest/SearchScreen";
import StoryDetailScreen from "../screens/guest/StoryDetailScreen";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const LibraryStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="StoryDetail" component={StoryDetailScreen} />
  </HomeStack.Navigator>
);

const LibraryStackScreen = () => (
  <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
    <LibraryStack.Screen name="LibraryMain" component={LibraryScreen} />
    <LibraryStack.Screen name="StoryDetail" component={StoryDetailScreen} />
  </LibraryStack.Navigator>
);

const SearchStackScreen = () => (
  <SearchStack.Navigator screenOptions={{ headerShown: false }}>
    <SearchStack.Screen name="SearchMain" component={SearchScreen} />
    <SearchStack.Screen name="StoryDetail" component={StoryDetailScreen} />
  </SearchStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <ProfileStack.Screen name="AuthorDashboard" component={AuthorDashboardScreen} />
    <ProfileStack.Screen name="AddChapter" component={AddChapterScreen} />
    <ProfileStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <ProfileStack.Screen name="StoryDetail" component={StoryDetailScreen} />
  </ProfileStack.Navigator>
);

const UserNavigation = () => {
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
        component={HomeStackScreen}
        options={{
          tabBarLabel: "Trang chủ",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryStackScreen}
        options={{
          tabBarLabel: "Thư viện",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="auto-stories" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStackScreen}
        options={{
          tabBarLabel: "Tìm kiếm",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="search" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{
          tabBarLabel: "Hồ sơ",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: { backgroundColor: "rgba(252, 249, 247, 0.92)", borderTopWidth: 1, borderTopColor: "rgba(179, 178, 175, 0.2)", height: 64, paddingBottom: 8, paddingTop: 8 },
  tabLabel: { fontSize: 8, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  tabItem: { borderRadius: 999, marginHorizontal: 8, overflow: "hidden" },
});

export default UserNavigation;
