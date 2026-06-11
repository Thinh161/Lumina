import React, { useEffect, useState, useCallback } from "react";
import {
	View, Text, FlatList, TouchableOpacity, StyleSheet,
	SafeAreaView, ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { API_URL } from '../../config/api';

const NOTIF_ICONS = {
	story_approved: { name: 'check-circle', color: '#2E7D32' },
	story_rejected: { name: 'cancel', color: '#D32F2F' },
	author_approved: { name: 'verified-user', color: '#2E7D32' },
	author_rejected: { name: 'block', color: '#D32F2F' },
};

const NotificationsScreen = ({ navigation }) => {
	const { user } = useSelector(s => s.auth);
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);

	const loadNotifications = useCallback(async () => {
		if (!user) return;
		try {
			const res = await fetch(`${API_URL}/notifications/${user.id}`).then(r => r.json());
			setNotifications(res.data || []);
		} catch {} finally { setLoading(false); }
	}, [user]);

	useEffect(() => {
		loadNotifications();
		if (user) {
			fetch(`${API_URL}/notifications/read/${user.id}`, { method: 'PUT' }).catch(() => {});
		}
	}, [loadNotifications, user]);

	const renderItem = ({ item }) => {
		const icon = NOTIF_ICONS[item.type] || { name: 'notifications', color: '#8B4513' };
		const dateStr = new Date(item.created_at).toLocaleString('vi-VN', {
			day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
		});
		return (
			<View style={[s.item, !item.is_read && s.itemUnread]}>
				<View style={s.iconWrap}>
					<MaterialIcons name={icon.name} size={24} color={icon.color} />
				</View>
				<View style={s.content}>
					<Text style={s.message}>{item.message}</Text>
					<Text style={s.time}>{dateStr}</Text>
				</View>
				{!item.is_read && <View style={s.dot} />}
			</View>
		);
	};

	return (
		<SafeAreaView style={s.safe}>
			<View style={s.header}>
				<TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
					<MaterialIcons name="arrow-back" size={22} color="#1A1A1A" />
				</TouchableOpacity>
				<Text style={s.headerTitle}>Thông báo</Text>
				<View style={{ width: 40 }} />
			</View>

			{loading ? (
				<View style={s.center}><ActivityIndicator size="large" color="#8B4513" /></View>
			) : notifications.length === 0 ? (
				<View style={s.center}>
					<MaterialIcons name="notifications-none" size={60} color="#DDDDDD" />
					<Text style={s.emptyText}>Chưa có thông báo nào.</Text>
				</View>
			) : (
				<FlatList
					data={notifications}
					keyExtractor={item => String(item.id)}
					renderItem={renderItem}
					contentContainerStyle={{ padding: 16, gap: 8 }}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</SafeAreaView>
	);
};

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: '#FFFFFF' },
	header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
	backBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
	headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
	emptyText: { fontSize: 14, color: '#888888' },
	item: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#F0F0F0', gap: 12 },
	itemUnread: { backgroundColor: '#FFF8F5', borderColor: '#F2E8E3' },
	iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
	content: { flex: 1, gap: 4 },
	message: { fontSize: 14, color: '#1A1A1A', lineHeight: 20 },
	time: { fontSize: 11, color: '#AAAAAA' },
	dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8B4513', marginTop: 4 },
});

export default NotificationsScreen;
