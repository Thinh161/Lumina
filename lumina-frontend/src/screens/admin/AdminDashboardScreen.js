import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AdminDashboardScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Màn hình Admin Dashboard</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    text: { fontSize: 20, fontWeight: "bold" }
});