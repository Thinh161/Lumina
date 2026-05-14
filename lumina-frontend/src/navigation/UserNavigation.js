import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";

import HomeScreen from "../screens/reader/HomeScreen";
import ProfileScreen from "../screens/reader/ProfileScreen";
import StoryDetailScreen from "../screens/guest/StoryDetailScreen";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const PlaceholderScreen = ({ label }) => {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Màn hình {label}</Text>
    </View>
  );
};

const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="StoryDetail" component={StoryDetailScreen} />
    </HomeStack.Navigator>
  );
};

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
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarLabel: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        children={() => <PlaceholderScreen label="Thư viện" />}
        options={{
          tabBarLabel: "Thư viện",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="auto-stories" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        children={() => <PlaceholderScreen label="Tìm kiếm" />}
        options={{
          tabBarLabel: "Tìm kiếm",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Hồ sơ",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

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
    fontSize: 8,
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

export default UserNavigation;
