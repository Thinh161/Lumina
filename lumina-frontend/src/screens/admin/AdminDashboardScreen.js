import React, { useState, useEffect, useCallback } from "react";
import {
	View, Text, FlatList, TouchableOpacity, StyleSheet,
	SafeAreaView, Alert, ActivityIndicator, Image
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const API_URL = 'http://10.106.42.58:5555/api';
const DEFAULT_COVER = "https://i.pravatar.cc/150?img=5";

const AdminDashboardScreen = () => {
	const [tab, setTab] = useState('pending'); // 'pending' | 'users'
	const [pendingStories, setPendingStories] = useState([]);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			if (tab === 'pending') {
				const res = await fetch(`${API_URL}/admin/stories/pending`).then(r => r.json());
				setPendingStories(res.data || []);
			} else {
				const res = await fetch(`${API_URL}/admin/users`).then(r => r.json());
				setUsers(res.data || []);
			}
		} finally {
			setLoading(false);
		}
	}, [tab]);

	useEffect(() => { loadData(); }, [loadData]);

	const handleStoryAction = (storyId, status) => {
		const label = status === 'published' ? 'Duyệt' : 'Từ chối';
		Alert.alert(label + " truyện", `Bạn muốn ${label.toLowerCase()} truyện này?`, [
			{ text: "Hủy", style: "cancel" },
			{
				text: label, style: status === 'rejected' ? 'destructive' : 'default',
				onPress: async () => {
					await fetch(`${API_URL}/admin/stories/${storyId}/status`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ status }),
					});
					loadData();
				}
			}
		]);
	};

	const handleUserAction = (userId, currentStatus) => {
		const newStatus = currentStatus === 'active' ? 'banned' : 'active';
		const label = newStatus === 'banned' ? 'Ban' : 'Unban';
		Alert.alert(`${label} người dùng`, `Bạn muốn ${label} người dùng này?`, [
			{ text: "Hủy", style: "cancel" },
			{
				text: label, style: newStatus === 'banned' ? 'destructive' : 'default',
				onPress: async () => {
					await fetch(`${API_URL}/admin/users/${userId}/status`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ status: newStatus }),
					});
					loadData();
				}
			}
		]);
	};

	const renderStory = ({ item }) => (
		<View style={s.card}>
			<View style={s.cardMain}>
				<Image source={{ uri: item.thumbnail || DEFAULT_COVER }} style={s.cover} />
				<View style={s.cardInfo}>
					<Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
					<Text style={s.cardMeta}>{item.author_name} • {item.category_name}</Text>
					<Text style={s.cardDesc} numberOfLines={2}>{item.description || "Không có mô tả."}</Text>
				</View>
			</View>
			<View style={s.actions}>
				<TouchableOpacity style={s.approveBtn} onPress={() => handleStoryAction(item.id, 'published')}>
					<MaterialIcons name="check" size={16} color="#fff" />
					<Text style={s.approveBtnText}>Duyệt</Text>
				</TouchableOpacity>
				<TouchableOpacity style={s.rejectBtn} onPress={() => handleStoryAction(item.id, 'rejected')}>
					<MaterialIcons name="close" size={16} color="#fff" />
					<Text style={s.rejectBtnText}>Từ chối</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	const renderUser = ({ item }) => (
		<View style={s.userCard}>
			<Image source={{ uri: item.avatar || DEFAULT_COVER }} style={s.avatar} />
			<View style={s.userInfo}>
				<Text style={s.userName}>{item.full_name || item.username}</Text>
				<Text style={s.userMeta}>@{item.username} • {item.role_name}</Text>
				<View style={[s.statusDot, { backgroundColor: item.status === 'active' ? '#2e7d32' : '#c62828' }]}>
					<Text style={s.statusDotText}>{item.status === 'active' ? 'Hoạt động' : 'Bị khóa'}</Text>
				</View>
			</View>
			<TouchableOpacity
				style={[s.banBtn, item.status !== 'active' && s.unbanBtn]}
				onPress={() => handleUserAction(item.id, item.status)}
			>
				<Text style={s.banBtnText}>{item.status === 'active' ? 'Ban' : 'Unban'}</Text>
			</TouchableOpacity>
		</View>
	);

	return (
		<SafeAreaView style={s.safe}>
			<View style={s.header}>
				<Text style={s.headerTitle}>Admin Dashboard</Text>
			</View>

			<View style={s.tabRow}>
				<TouchableOpacity style={[s.tabBtn, tab === 'pending' && s.tabBtnActive]} onPress={() => setTab('pending')}>
					<Text style={[s.tabText, tab === 'pending' && s.tabTextActive]}>
						Chờ duyệt {pendingStories.length > 0 ? `(${pendingStories.length})` : ''}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[s.tabBtn, tab === 'users' && s.tabBtnActive]} onPress={() => setTab('users')}>
					<Text style={[s.tabText, tab === 'users' && s.tabTextActive]}>Người dùng</Text>
				</TouchableOpacity>
			</View>

			{loading ? (
				<View style={s.center}><ActivityIndicator size="large" color="#8B4513" /></View>
			) : tab === 'pending' && pendingStories.length === 0 ? (
				<View style={s.center}>
					<MaterialIcons name="check-circle" size={52} color="#2e7d32" />
					<Text style={s.emptyText}>Không có truyện nào chờ duyệt.</Text>
				</View>
			) : tab === 'pending' ? (
				<FlatList data={pendingStories} keyExtractor={i => String(i.id)} renderItem={renderStory} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} />
			) : (
				<FlatList data={users} keyExtractor={i => String(i.id)} renderItem={renderUser} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} />
			)}
		</SafeAreaView>
	);
};

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: "#FFFFFF" },
	header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
	headerTitle: { fontSize: 22, fontWeight: "800", color: "#1A1A1A" },
	tabRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginVertical: 12 },
	tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10, backgroundColor: "#F5F5F5", borderWidth: 1, borderColor: "#EBEBEB" },
	tabBtnActive: { backgroundColor: "#8B4513", borderColor: "#8B4513" },
	tabText: { fontSize: 13, fontWeight: "700", color: "#888888" },
	tabTextActive: { color: "#FFFFFF" },
	center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
	emptyText: { fontSize: 14, color: "#888888" },
	card: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#F0F0F0" },
	cardMain: { flexDirection: "row", gap: 12, marginBottom: 12 },
	cover: { width: 70, height: 100, borderRadius: 8 },
	cardInfo: { flex: 1 },
	cardTitle: { fontSize: 14, fontWeight: "700", color: "#1A1A1A", lineHeight: 20 },
	cardMeta: { fontSize: 12, color: "#888888", marginTop: 2 },
	cardDesc: { fontSize: 11, color: "#888888", marginTop: 4, lineHeight: 16 },
	actions: { flexDirection: "row", gap: 8 },
	approveBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "#2E7D32", paddingVertical: 8, borderRadius: 8 },
	approveBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
	rejectBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "#D32F2F", paddingVertical: 8, borderRadius: 8 },
	rejectBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
	userCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "#F0F0F0" },
	avatar: { width: 46, height: 46, borderRadius: 23 },
	userInfo: { flex: 1, marginLeft: 12, gap: 2 },
	userName: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
	userMeta: { fontSize: 11, color: "#888888" },
	statusDot: { alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, marginTop: 2 },
	statusDotText: { fontSize: 10, fontWeight: "700", color: "#FFFFFF" },
	banBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: "#D32F2F" },
	unbanBtn: { backgroundColor: "#2E7D32" },
	banBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
});

export default AdminDashboardScreen;
