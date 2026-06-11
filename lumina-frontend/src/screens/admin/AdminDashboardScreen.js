import React, { useState, useEffect, useCallback } from "react";
import {
	View, Text, FlatList, TouchableOpacity, StyleSheet,
	SafeAreaView, Alert, ActivityIndicator, Image, Modal, TextInput, ScrollView
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { useDispatch } from 'react-redux';
import { logout } from '../../redux_thunk/AuthSlice';
import { API_URL } from '../../config/api';
const DEFAULT_COVER = "https://i.pravatar.cc/150?img=5";

const AdminDashboardScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const [tab, setTab] = useState('stories');
	const [storyFilter, setStoryFilter] = useState('pending'); // pending | published | rejected
	const [pendingStories, setPendingStories] = useState([]);
	const [filteredStories, setFilteredStories] = useState([]);
	const [users, setUsers] = useState([]);
	const [authorRequests, setAuthorRequests] = useState([]);
	const [topupRequests, setTopupRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [rejectTarget, setRejectTarget] = useState(null);
	const [rejectReason, setRejectReason] = useState('');
	const [rejecting, setRejecting] = useState(false);

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			if (tab === 'stories') {
				if (storyFilter === 'pending') {
					const res = await fetch(`${API_URL}/admin/stories/pending`).then(r => r.json());
					setPendingStories(res.data || []);
				} else {
					const res = await fetch(`${API_URL}/admin/stories?status=${storyFilter}`).then(r => r.json());
					setFilteredStories(res.data || []);
				}
			} else if (tab === 'authors') {
				const res = await fetch(`${API_URL}/admin/author-requests`).then(r => r.json());
				setAuthorRequests(res.data || []);
			} else if (tab === 'topup') {
				const res = await fetch(`${API_URL}/admin/topup`).then(r => r.json());
				setTopupRequests(res.data || []);
			} else {
				const res = await fetch(`${API_URL}/admin/users`).then(r => r.json());
				setUsers(res.data || []);
			}
		} finally { setLoading(false); }
	}, [tab, storyFilter]);

	useEffect(() => { loadData(); }, [loadData]);

	// Load counts for badges on every mount
	useEffect(() => {
		fetch(`${API_URL}/admin/author-requests`).then(r => r.json())
			.then(res => setAuthorRequests(res.data || [])).catch(() => {});
		fetch(`${API_URL}/admin/topup`).then(r => r.json())
			.then(res => setTopupRequests(res.data || [])).catch(() => {});
	}, []);

	const handleApprove = (storyId) => {
		Alert.alert("Duyệt truyện", "Xác nhận duyệt truyện này?", [
			{ text: "Hủy", style: "cancel" },
			{
				text: "Duyệt", onPress: async () => {
					await fetch(`${API_URL}/admin/stories/${storyId}/status`, {
						method: 'PUT', headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ status: 'published' }),
					});
					loadData();
				}
			}
		]);
	};

	const handleRejectSubmit = async () => {
		if (!rejectReason.trim()) { Alert.alert("Lỗi", "Vui lòng nhập lý do từ chối."); return; }
		setRejecting(true);
		try {
			await fetch(`${API_URL}/admin/stories/${rejectTarget}/status`, {
				method: 'PUT', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'rejected', rejection_reason: rejectReason.trim() }),
			});
			setRejectTarget(null); setRejectReason(''); loadData();
		} finally { setRejecting(false); }
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
						method: 'PUT', headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ status: newStatus }),
					});
					loadData();
				}
			}
		]);
	};

	const handleGrantVip = (userId, username) => {
		Alert.alert("Cấp VIP", `Cấp VIP vĩnh viễn cho @${username}?`, [
			{ text: "Hủy", style: "cancel" },
			{
				text: "Cấp VIP", onPress: async () => {
					await fetch(`${API_URL}/admin/users/${userId}/vip`, { method: 'PUT' });
					loadData();
				}
			}
		]);
	};

	const handleRevokeVip = (userId, username) => {
		Alert.alert("Thu hồi VIP", `Thu hồi VIP của @${username}?`, [
			{ text: "Hủy", style: "cancel" },
			{
				text: "Thu hồi", style: "destructive",
				onPress: async () => {
					await fetch(`${API_URL}/admin/users/${userId}/revoke-vip`, { method: 'PUT' });
					loadData();
				}
			}
		]);
	};

	const handleApproveAuthor = (userId, name) => {
		Alert.alert("Duyệt tác giả", `Cấp quyền Author cho ${name}?`, [
			{ text: "Hủy", style: "cancel" },
			{
				text: "Duyệt", onPress: async () => {
					await fetch(`${API_URL}/admin/users/${userId}/approve-author`, { method: 'PUT' });
					loadData();
				}
			}
		]);
	};

	const handleApproveTopup = (id) => {
		Alert.alert("Xác nhận nạp xu", "Bạn đã nhận được tiền chuyển khoản và muốn duyệt yêu cầu này?", [
			{ text: "Hủy", style: "cancel" },
			{
				text: "Duyệt", onPress: async () => {
					await fetch(`${API_URL}/admin/topup/${id}/approve`, { method: 'PUT' });
					loadData();
				}
			}
		]);
	};

	const handleRejectTopup = (id) => {
		Alert.alert("Từ chối nạp xu", "Từ chối yêu cầu nạp xu này?", [
			{ text: "Hủy", style: "cancel" },
			{
				text: "Từ chối", style: "destructive",
				onPress: async () => {
					await fetch(`${API_URL}/admin/topup/${id}/reject`, { method: 'PUT' });
					loadData();
				}
			}
		]);
	};

	const handleRejectAuthor = (userId) => {
		Alert.alert("Từ chối", "Từ chối yêu cầu tác giả này?", [
			{ text: "Hủy", style: "cancel" },
			{
				text: "Từ chối", style: "destructive",
				onPress: async () => {
					await fetch(`${API_URL}/admin/users/${userId}/reject-author`, { method: 'PUT' });
					loadData();
				}
			}
		]);
	};

	const displayedStories = storyFilter === 'pending' ? pendingStories : filteredStories;

	const renderStory = ({ item }) => (
		<View style={s.card}>
			<View style={s.cardMain}>
				<Image source={{ uri: item.thumbnail || DEFAULT_COVER }} style={s.cover} />
				<View style={s.cardInfo}>
					<Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
					<Text style={s.cardMeta}>{item.author_name} • {item.category_name}</Text>
					<Text style={s.cardDesc} numberOfLines={2}>{item.description || "Không có mô tả."}</Text>
					{item.rejection_reason ? <Text style={s.rejectionNote}>Lý do: {item.rejection_reason}</Text> : null}
				</View>
			</View>
			{storyFilter === 'pending' ? (
				<View style={s.actions}>
					<TouchableOpacity style={s.viewBtn} onPress={() => navigation.navigate("StoryDetail", { storyId: item.id })}>
						<MaterialIcons name="visibility" size={16} color="#8B4513" />
						<Text style={s.viewBtnText}>Xem</Text>
					</TouchableOpacity>
					<TouchableOpacity style={s.approveBtn} onPress={() => handleApprove(item.id)}>
						<MaterialIcons name="check" size={16} color="#FFFFFF" />
						<Text style={s.approveBtnText}>Duyệt</Text>
					</TouchableOpacity>
					<TouchableOpacity style={s.rejectBtn} onPress={() => { setRejectTarget(item.id); setRejectReason(''); }}>
						<MaterialIcons name="close" size={16} color="#FFFFFF" />
						<Text style={s.rejectBtnText}>Từ chối</Text>
					</TouchableOpacity>
				</View>
			) : (
				<TouchableOpacity style={[s.viewBtn, { alignSelf: 'flex-start' }]} onPress={() => navigation.navigate("StoryDetail", { storyId: item.id })}>
					<MaterialIcons name="visibility" size={16} color="#8B4513" />
					<Text style={s.viewBtnText}>Xem chi tiết</Text>
				</TouchableOpacity>
			)}
		</View>
	);

	const renderUser = ({ item }) => (
		<View style={s.userCard}>
			<Image source={{ uri: item.avatar || DEFAULT_COVER }} style={s.avatar} />
			<View style={s.userInfo}>
				<Text style={s.userName}>{item.full_name || item.username}</Text>
				<Text style={s.userMeta}>@{item.username} • {item.role_name}</Text>
				<View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
					<View style={[s.statusDot, { backgroundColor: item.status === 'active' ? '#2e7d32' : '#c62828' }]}>
						<Text style={s.statusDotText}>{item.status === 'active' ? 'Active' : 'Banned'}</Text>
					</View>
					{item.is_vip ? <View style={[s.statusDot, { backgroundColor: '#8B4513' }]}><Text style={s.statusDotText}>VIP</Text></View> : null}
				</View>
			</View>
			<View style={{ gap: 6 }}>
				<TouchableOpacity style={[s.banBtn, item.status !== 'active' && s.unbanBtn]} onPress={() => handleUserAction(item.id, item.status)}>
					<Text style={s.banBtnText}>{item.status === 'active' ? 'Ban' : 'Unban'}</Text>
				</TouchableOpacity>
				{!item.is_vip ? (
					<TouchableOpacity style={[s.banBtn, { backgroundColor: '#8B4513' }]} onPress={() => handleGrantVip(item.id, item.username)}>
						<Text style={s.banBtnText}>Cấp VIP</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity style={[s.banBtn, { backgroundColor: '#888888' }]} onPress={() => handleRevokeVip(item.id, item.username)}>
						<Text style={s.banBtnText}>Xóa VIP</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);

	const renderAuthorRequest = ({ item }) => (
		<View style={s.userCard}>
			<Image source={{ uri: item.avatar || DEFAULT_COVER }} style={s.avatar} />
			<View style={s.userInfo}>
				<Text style={s.userName}>{item.full_name || item.username}</Text>
				<Text style={s.userMeta}>@{item.username} • {item.role_name}</Text>
				<Text style={{ fontSize: 11, color: '#888888', marginTop: 2 }}>{item.email}</Text>
			</View>
			<View style={{ gap: 6 }}>
				<TouchableOpacity style={[s.banBtn, { backgroundColor: '#2E7D32' }]} onPress={() => handleApproveAuthor(item.id, item.full_name || item.username)}>
					<Text style={s.banBtnText}>Duyệt</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[s.banBtn, { backgroundColor: '#D32F2F' }]} onPress={() => handleRejectAuthor(item.id)}>
					<Text style={s.banBtnText}>Từ chối</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	const renderTopupRequest = ({ item }) => {
		const date = new Date(item.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
		return (
			<View style={s.card}>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
					<Image source={{ uri: item.avatar || DEFAULT_COVER }} style={[s.avatar, { borderRadius: 8 }]} />
					<View style={{ flex: 1 }}>
						<Text style={s.cardTitle}>{item.full_name || item.username}</Text>
						<Text style={s.cardMeta}>@{item.username}</Text>
						<Text style={s.cardMeta}>{date}</Text>
					</View>
					<View style={{ alignItems: 'flex-end' }}>
						<Text style={{ fontSize: 16, fontWeight: '800', color: '#8B4513' }}>{item.amount_xu} xu</Text>
						<Text style={{ fontSize: 12, color: '#888888' }}>{Number(item.amount_vnd).toLocaleString('vi-VN')}đ</Text>
					</View>
				</View>
				<View style={s.actions}>
					<TouchableOpacity style={[s.approveBtn, { flex: 1 }]} onPress={() => handleApproveTopup(item.id)}>
						<MaterialIcons name="check" size={16} color="#FFFFFF" />
						<Text style={s.approveBtnText}>Xác nhận</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[s.rejectBtn, { flex: 1 }]} onPress={() => handleRejectTopup(item.id)}>
						<MaterialIcons name="close" size={16} color="#FFFFFF" />
						<Text style={s.rejectBtnText}>Từ chối</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	const TABS = [
		{ key: 'stories', label: 'Truyện' },
		{ key: 'authors', label: `Tác giả${authorRequests.length > 0 ? ` (${authorRequests.length})` : ''}` },
		{ key: 'users', label: 'Người dùng' },
		{ key: 'topup', label: `Nạp xu${topupRequests.length > 0 ? ` (${topupRequests.length})` : ''}` },
	];

	return (
		<SafeAreaView style={s.safe}>
			<View style={s.header}>
				<Text style={s.headerTitle}>Admin Dashboard</Text>
				<TouchableOpacity
					style={s.logoutBtn}
					onPress={() => Alert.alert("Đăng xuất", "Bạn muốn đăng xuất?", [
						{ text: "Hủy", style: "cancel" },
						{ text: "Đăng xuất", style: "destructive", onPress: () => { dispatch(logout()); navigation.replace("Guest"); } }
					])}
				>
					<MaterialIcons name="logout" size={20} color="#D32F2F" />
				</TouchableOpacity>
			</View>

			<View style={s.tabRow}>
				{TABS.map(t => (
					<TouchableOpacity key={t.key} style={[s.tabBtn, tab === t.key && s.tabBtnActive]} onPress={() => setTab(t.key)}>
						<Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
					</TouchableOpacity>
				))}
			</View>

			{tab === 'stories' && (
				<View style={s.filterRow}>
					{['pending', 'published', 'rejected'].map(f => (
						<TouchableOpacity key={f} style={[s.filterBtn, storyFilter === f && s.filterBtnActive]} onPress={() => setStoryFilter(f)}>
							<Text style={[s.filterText, storyFilter === f && s.filterTextActive]}>
								{f === 'pending' ? 'Chờ duyệt' : f === 'published' ? 'Đã duyệt' : 'Từ chối'}
								{f === 'pending' && pendingStories.length > 0 ? ` (${pendingStories.length})` : ''}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			)}

			{loading ? (
				<View style={s.center}><ActivityIndicator size="large" color="#8B4513" /></View>
			) : tab === 'stories' && displayedStories.length === 0 ? (
				<View style={s.center}>
					<MaterialIcons name="check-circle" size={52} color="#2E7D32" />
					<Text style={s.emptyText}>Không có truyện nào.</Text>
				</View>
			) : tab === 'stories' ? (
				<FlatList data={displayedStories} keyExtractor={i => String(i.id)} renderItem={renderStory} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} />
			) : tab === 'authors' && authorRequests.length === 0 ? (
				<View style={s.center}>
					<MaterialIcons name="person-add-disabled" size={52} color="#EBEBEB" />
					<Text style={s.emptyText}>Không có yêu cầu tác giả nào.</Text>
				</View>
			) : tab === 'authors' ? (
				<FlatList data={authorRequests} keyExtractor={i => String(i.id)} renderItem={renderAuthorRequest} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} />
			) : tab === 'topup' && topupRequests.length === 0 ? (
				<View style={s.center}>
					<MaterialIcons name="account-balance-wallet" size={52} color="#EBEBEB" />
					<Text style={s.emptyText}>Không có yêu cầu nạp xu nào.</Text>
				</View>
			) : tab === 'topup' ? (
				<FlatList data={topupRequests} keyExtractor={i => String(i.id)} renderItem={renderTopupRequest} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} />
			) : (
				<FlatList data={users} keyExtractor={i => String(i.id)} renderItem={renderUser} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} />
			)}

			<Modal visible={!!rejectTarget} animationType="slide" transparent>
				<View style={s.overlay}>
					<View style={s.sheet}>
						<View style={s.sheetHeader}>
							<Text style={s.sheetTitle}>Lý do từ chối</Text>
							<TouchableOpacity onPress={() => setRejectTarget(null)}><MaterialIcons name="close" size={22} color="#888888" /></TouchableOpacity>
						</View>
						<Text style={{ fontSize: 13, color: "#888888", marginBottom: 12 }}>Nhập lý do để tác giả biết cần chỉnh sửa gì.</Text>
						<TextInput
							style={[s.input, { height: 100, textAlignVertical: "top" }]}
							value={rejectReason} onChangeText={setRejectReason}
							placeholder="Ví dụ: Nội dung vi phạm quy định..." placeholderTextColor="#BBBBBB"
							multiline autoFocus
						/>
						<TouchableOpacity style={[s.rejectSubmitBtn, rejecting && { opacity: 0.6 }]} onPress={handleRejectSubmit} disabled={rejecting}>
							{rejecting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.rejectSubmitText}>Xác nhận từ chối</Text>}
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: "#FFFFFF" },
	header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
	headerTitle: { fontSize: 22, fontWeight: "800", color: "#1A1A1A" },
	logoutBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#FFF0F0", alignItems: "center", justifyContent: "center" },
	tabRow: { flexDirection: "row", paddingHorizontal: 16, gap: 6, marginVertical: 10 },
	tabBtn: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 10, backgroundColor: "#F5F5F5", borderWidth: 1, borderColor: "#EBEBEB" },
	tabBtnActive: { backgroundColor: "#8B4513", borderColor: "#8B4513" },
	tabText: { fontSize: 12, fontWeight: "700", color: "#888888" },
	tabTextActive: { color: "#FFFFFF" },
	filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 6, marginBottom: 4 },
	filterBtn: { flex: 1, paddingVertical: 7, alignItems: "center", borderRadius: 8, backgroundColor: "#F5F5F5", borderWidth: 1, borderColor: "#EBEBEB" },
	filterBtnActive: { backgroundColor: "#1A1A1A", borderColor: "#1A1A1A" },
	filterText: { fontSize: 11, fontWeight: "700", color: "#888888" },
	filterTextActive: { color: "#FFFFFF" },
	center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
	emptyText: { fontSize: 14, color: "#888888" },
	card: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#F0F0F0" },
	cardMain: { flexDirection: "row", gap: 12, marginBottom: 12 },
	cover: { width: 70, height: 100, borderRadius: 8 },
	cardInfo: { flex: 1 },
	cardTitle: { fontSize: 14, fontWeight: "700", color: "#1A1A1A", lineHeight: 20 },
	cardMeta: { fontSize: 12, color: "#888888", marginTop: 2 },
	cardDesc: { fontSize: 11, color: "#888888", marginTop: 4, lineHeight: 16 },
	rejectionNote: { fontSize: 11, color: "#D32F2F", marginTop: 4, fontStyle: "italic" },
	actions: { flexDirection: "row", gap: 8 },
	viewBtn: { paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F5F0EB", paddingVertical: 8, borderRadius: 8 },
	viewBtnText: { color: "#8B4513", fontWeight: "700", fontSize: 13 },
	approveBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "#2E7D32", paddingVertical: 8, borderRadius: 8 },
	approveBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
	rejectBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "#D32F2F", paddingVertical: 8, borderRadius: 8 },
	rejectBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
	userCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "#F0F0F0" },
	avatar: { width: 46, height: 46, borderRadius: 23 },
	userInfo: { flex: 1, marginLeft: 12, gap: 2 },
	userName: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
	userMeta: { fontSize: 11, color: "#888888" },
	statusDot: { alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
	statusDotText: { fontSize: 10, fontWeight: "700", color: "#FFFFFF" },
	banBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: "#D32F2F" },
	unbanBtn: { backgroundColor: "#2E7D32" },
	banBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
	overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
	sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
	sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
	sheetTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
	input: { backgroundColor: "#F5F5F5", borderRadius: 10, borderWidth: 1, borderColor: "#EBEBEB", paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#1A1A1A", marginBottom: 12 },
	rejectSubmitBtn: { backgroundColor: "#D32F2F", paddingVertical: 14, borderRadius: 999, alignItems: "center" },
	rejectSubmitText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});

export default AdminDashboardScreen;
