import React, { useState, useEffect, useCallback } from "react";
import {
	View, Text, FlatList, TouchableOpacity, StyleSheet,
	SafeAreaView, Alert, ActivityIndicator, Image, Modal, TextInput, RefreshControl, ScrollView
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { useDispatch } from 'react-redux';
import { logout } from '../../redux_thunk/AuthSlice';
import { API_URL } from '../../config/api';
const DEFAULT_COVER = "https://i.pravatar.cc/150?img=5";

const AdminDashboardScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const [tab, setTab] = useState('stories');
	const [storyFilter, setStoryFilter] = useState('pending');
	const [pendingStories, setPendingStories] = useState([]);
	const [filteredStories, setFilteredStories] = useState([]);
	const [users, setUsers] = useState([]);
	const [authorRequests, setAuthorRequests] = useState([]);
	const [topupRequests, setTopupRequests] = useState([]);
	const [topupFilter, setTopupFilter] = useState('pending');
	const [vipRequests, setVipRequests] = useState([]);
	const [vipFilter, setVipFilter] = useState('pending');
	const [withdrawRequests, setWithdrawRequests] = useState([]);
	const [withdrawFilter, setWithdrawFilter] = useState('pending');
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [rejectTarget, setRejectTarget] = useState(null);
	const [rejectReason, setRejectReason] = useState('');
	const [rejecting, setRejecting] = useState(false);
	const [confirmModal, setConfirmModal] = useState({ visible: false, title: '', message: '', onOk: null, destructive: false });
	const [adminStats, setAdminStats] = useState(null);

	const confirm = (title, msg, onOk, destructive = false) => {
		setConfirmModal({ visible: true, title, message: msg, onOk, destructive });
	};

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
				const res = await fetch(`${API_URL}/admin/topup?status=${topupFilter}`).then(r => r.json());
				setTopupRequests(res.data || []);
			} else if (tab === 'vip') {
				const res = await fetch(`${API_URL}/admin/vip-requests?status=${vipFilter}`).then(r => r.json());
				setVipRequests(res.data || []);
			} else if (tab === 'withdraw') {
				const res = await fetch(`${API_URL}/admin/withdrawals?status=${withdrawFilter}`).then(r => r.json());
				setWithdrawRequests(res.data || []);
			} else if (tab === 'stats') {
				const res = await fetch(`${API_URL}/admin/stats`).then(r => r.json());
				setAdminStats(res.data || null);
			} else {
				const res = await fetch(`${API_URL}/admin/users`).then(r => r.json());
				setUsers((res.data || []).filter(u => u.role_id !== 1));
			}
		} finally { setLoading(false); setRefreshing(false); }
	}, [tab, storyFilter, topupFilter, vipFilter, withdrawFilter]);

	useEffect(() => { loadData(); }, [loadData]);

	const onRefresh = useCallback(() => { setRefreshing(true); loadData(); }, [loadData]);

	// Load badge counts
	useEffect(() => {
		fetch(`${API_URL}/admin/author-requests`).then(r => r.json())
			.then(res => setAuthorRequests(res.data || [])).catch(() => {});
		fetch(`${API_URL}/admin/topup`).then(r => r.json())
			.then(res => setTopupRequests(res.data || [])).catch(() => {});
		fetch(`${API_URL}/admin/vip-requests`).then(r => r.json())
			.then(res => setVipRequests(res.data || [])).catch(() => {});
		fetch(`${API_URL}/admin/withdrawals`).then(r => r.json())
			.then(res => setWithdrawRequests(res.data || [])).catch(() => {});
	}, []);

	const apiCall = async (url, options = {}) => {
		const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
		const json = await res.json();
		if (json.status !== 'success') throw new Error(json.message || 'Lỗi không xác định');
		return json;
	};

	const handleApprove = (storyId) => confirm(
		"Duyệt truyện", "Xác nhận duyệt và phát hành truyện này?",
		async () => {
			try {
				await apiCall(`${API_URL}/admin/stories/${storyId}/status`, { method: 'PUT', body: JSON.stringify({ status: 'published' }) });
				loadData();
			} catch (e) { Alert.alert("Lỗi", e.message); }
		}
	);

	const handleRejectSubmit = async () => {
		if (!rejectReason.trim()) { Alert.alert("Lỗi", "Vui lòng nhập lý do từ chối."); return; }
		setRejecting(true);
		try {
			await apiCall(`${API_URL}/admin/stories/${rejectTarget}/status`, {
				method: 'PUT', body: JSON.stringify({ status: 'rejected', rejection_reason: rejectReason.trim() }),
			});
			setRejectTarget(null); setRejectReason('');
			loadData();
		} catch (e) { Alert.alert("Lỗi", e.message); }
		finally { setRejecting(false); }
	};

	const handleUserAction = (userId, currentStatus) => {
		const newStatus = currentStatus === 'active' ? 'banned' : 'active';
		confirm(
			newStatus === 'banned' ? "Ban người dùng" : "Unban người dùng",
			`Bạn muốn ${newStatus === 'banned' ? 'ban' : 'unban'} người dùng này?`,
			async () => {
				try {
					await apiCall(`${API_URL}/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
					loadData();
				} catch (e) { Alert.alert("Lỗi", e.message); }
			},
			newStatus === 'banned'
		);
	};

	const handleGrantVip = (userId, username) => confirm(
		"Cấp VIP", `Cấp VIP vĩnh viễn cho @${username}?`,
		async () => {
			try {
				await apiCall(`${API_URL}/admin/users/${userId}/vip`, { method: 'PUT' });
				loadData();
			} catch (e) { Alert.alert("Lỗi", e.message); }
		}
	);

	const handleRevokeVip = (userId, username) => confirm(
		"Thu hồi VIP", `Thu hồi VIP của @${username}?`,
		async () => {
			try {
				await apiCall(`${API_URL}/admin/users/${userId}/revoke-vip`, { method: 'PUT' });
				loadData();
			} catch (e) { Alert.alert("Lỗi", e.message); }
		}, true
	);

	const handleApproveAuthor = (userId, name) => confirm(
		"Duyệt tác giả", `Cấp quyền Author cho ${name}?`,
		async () => {
			try {
				await apiCall(`${API_URL}/admin/users/${userId}/approve-author`, { method: 'PUT' });
				loadData();
			} catch (e) { Alert.alert("Lỗi", e.message); }
		}
	);

	const handleRejectAuthor = (userId) => confirm(
		"Từ chối", "Từ chối yêu cầu tác giả này?",
		async () => {
			try {
				await apiCall(`${API_URL}/admin/users/${userId}/reject-author`, { method: 'PUT' });
				loadData();
			} catch (e) { Alert.alert("Lỗi", e.message); }
		}, true
	);

	const handleApproveTopup = (id) => confirm(
		"Xác nhận nạp xu", "Bạn đã nhận được tiền và muốn cộng xu cho người dùng này?",
		async () => {
			try {
				await apiCall(`${API_URL}/admin/topup/${id}/approve`, { method: 'PUT' });
				loadData();
			} catch (e) { Alert.alert("Lỗi", e.message); }
		}
	);

	const handleRejectTopup = (id) => confirm(
		"Từ chối nạp xu", "Từ chối yêu cầu nạp xu này?",
		async () => {
			try {
				await apiCall(`${API_URL}/admin/topup/${id}/reject`, { method: 'PUT' });
				loadData();
			} catch (e) { Alert.alert("Lỗi", e.message); }
		}, true
	);

	const handleApproveVip = (id) => confirm(
		"Xác nhận VIP", "Bạn đã nhận được thanh toán và muốn cấp VIP cho người dùng này?",
		async () => {
			try {
				await apiCall(`${API_URL}/admin/vip/${id}/approve`, { method: 'PUT' });
				loadData();
			} catch (e) { Alert.alert("Lỗi", e.message); }
		}
	);

	const handleRejectVip = (id) => confirm(
		"Từ chối VIP", "Từ chối yêu cầu mua VIP này?",
		async () => {
			try {
				await apiCall(`${API_URL}/admin/vip/${id}/reject`, { method: 'PUT' });
				loadData();
			} catch (e) { Alert.alert("Lỗi", e.message); }
		}, true
	);

	const handleApproveWithdraw = (id) => confirm(
		"Xác nhận rút tiền", "Bạn đã chuyển khoản thành công cho tác giả này?",
		async () => {
			try {
				await apiCall(`${API_URL}/admin/withdraw/${id}/approve`, { method: 'PUT' });
				loadData();
			} catch (e) { Alert.alert("Lỗi", e.message); }
		}
	);

	const handleRejectWithdraw = (id) => confirm(
		"Từ chối rút tiền", "Từ chối yêu cầu rút tiền? Xu sẽ được hoàn lại.",
		async () => {
			try {
				await apiCall(`${API_URL}/admin/withdraw/${id}/reject`, { method: 'PUT' });
				loadData();
			} catch (e) { Alert.alert("Lỗi", e.message); }
		}, true
	);

	const displayedStories = storyFilter === 'pending' ? pendingStories : filteredStories;

	const renderStory = ({ item }) => (
		<View style={s.card}>
			<View style={s.cardMain}>
				<Image source={{ uri: item.thumbnail || DEFAULT_COVER }} style={s.cover} />
				<View style={s.cardInfo}>
					<Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
					<Text style={s.cardMeta}>{item.author_name} • {item.category_names || ''}</Text>
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
				{item.status === 'pending' ? (
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
				) : (
					<View style={[s.statusDot, { alignSelf: 'flex-start', backgroundColor: item.status === 'approved' ? '#2E7D32' : '#D32F2F', paddingHorizontal: 10, paddingVertical: 4 }]}>
						<Text style={s.statusDotText}>{item.status === 'approved' ? '✓ Đã duyệt' : '✗ Từ chối'}</Text>
					</View>
				)}
			</View>
		);
	};

	const renderVipRequest = ({ item }) => {
		const date = new Date(item.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
		return (
			<View style={s.card}>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
					<Image source={{ uri: item.avatar || DEFAULT_COVER }} style={[s.avatar, { borderRadius: 8 }]} />
					<View style={{ flex: 1 }}>
						<Text style={s.cardTitle}>{item.full_name || item.username}</Text>
						<Text style={s.cardMeta}>@{item.username} • {date}</Text>
						<Text style={s.cardMeta}>{item.months ? `${item.months} tháng VIP` : 'VIP vĩnh viễn'}</Text>
					</View>
					<View style={{ alignItems: 'flex-end' }}>
						<Text style={{ fontSize: 16, fontWeight: '800', color: '#8B4513' }}>{Number(item.amount_vnd).toLocaleString('vi-VN')}đ</Text>
						<View style={[s.statusDot, { backgroundColor: '#8B4513', marginTop: 4 }]}>
							<Text style={s.statusDotText}>VIP</Text>
						</View>
					</View>
				</View>
				{item.status === 'pending' ? (
					<View style={s.actions}>
						<TouchableOpacity style={[s.approveBtn, { flex: 1 }]} onPress={() => handleApproveVip(item.id)}>
							<MaterialIcons name="star" size={16} color="#FFFFFF" />
							<Text style={s.approveBtnText}>Cấp VIP</Text>
						</TouchableOpacity>
						<TouchableOpacity style={[s.rejectBtn, { flex: 1 }]} onPress={() => handleRejectVip(item.id)}>
							<MaterialIcons name="close" size={16} color="#FFFFFF" />
							<Text style={s.rejectBtnText}>Từ chối</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View style={[s.statusDot, { alignSelf: 'flex-start', backgroundColor: item.status === 'approved' ? '#2E7D32' : '#D32F2F', paddingHorizontal: 10, paddingVertical: 4 }]}>
						<Text style={s.statusDotText}>{item.status === 'approved' ? '✓ Đã cấp VIP' : '✗ Từ chối'}</Text>
					</View>
				)}
			</View>
		);
	};

	const renderWithdrawRequest = ({ item }) => {
		const date = new Date(item.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
		return (
			<View style={s.card}>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
					<Image source={{ uri: item.avatar || DEFAULT_COVER }} style={[s.avatar, { borderRadius: 8 }]} />
					<View style={{ flex: 1 }}>
						<Text style={s.cardTitle}>{item.full_name || item.username}</Text>
						<Text style={s.cardMeta}>@{item.username} • {date}</Text>
					</View>
					<View style={{ alignItems: 'flex-end' }}>
						<Text style={{ fontSize: 15, fontWeight: '800', color: '#2E7D32' }}>{item.amount_xu} xu</Text>
						<Text style={{ fontSize: 12, color: '#888888' }}>{Number(item.amount_vnd).toLocaleString('vi-VN')}đ</Text>
					</View>
				</View>
				<View style={{ backgroundColor: '#F5F5F5', borderRadius: 8, padding: 10, marginBottom: 8, gap: 4 }}>
					{item.bank_name ? <Text style={s.cardMeta}>Ngân hàng: <Text style={{ fontWeight: '700', color: '#1A1A1A' }}>{item.bank_name}</Text></Text> : null}
					<Text style={s.cardMeta}>STK: <Text style={{ fontWeight: '700', color: '#1A1A1A' }}>{item.bank_account}</Text></Text>
					{item.bank_owner ? <Text style={s.cardMeta}>Chủ TK: <Text style={{ fontWeight: '700', color: '#1A1A1A' }}>{item.bank_owner}</Text></Text> : null}
				</View>
				{item.status === 'pending' ? (
					<View style={s.actions}>
						<TouchableOpacity style={[s.approveBtn, { flex: 1 }]} onPress={() => handleApproveWithdraw(item.id)}>
							<MaterialIcons name="account-balance" size={16} color="#FFFFFF" />
							<Text style={s.approveBtnText}>Đã chuyển khoản</Text>
						</TouchableOpacity>
						<TouchableOpacity style={[s.rejectBtn, { flex: 1 }]} onPress={() => handleRejectWithdraw(item.id)}>
							<MaterialIcons name="close" size={16} color="#FFFFFF" />
							<Text style={s.rejectBtnText}>Từ chối</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View style={[s.statusDot, { alignSelf: 'flex-start', backgroundColor: item.status === 'approved' ? '#2E7D32' : '#D32F2F', paddingHorizontal: 10, paddingVertical: 4 }]}>
						<Text style={s.statusDotText}>{item.status === 'approved' ? '✓ Đã chuyển khoản' : '✗ Từ chối'}</Text>
					</View>
				)}
			</View>
		);
	};

	const pendingVipCount = vipRequests.filter(r => r.status === 'pending').length;
	const pendingWithdrawCount = withdrawRequests.filter(r => r.status === 'pending').length;

	const TABS = [
		{ key: 'stories', label: 'Truyện' },
		{ key: 'authors', label: `Tác giả${authorRequests.length > 0 ? ` (${authorRequests.length})` : ''}` },
		{ key: 'users', label: 'Users' },
		{ key: 'topup', label: `Nạp xu${topupRequests.filter(r => r.status === 'pending').length > 0 ? ` (${topupRequests.filter(r => r.status === 'pending').length})` : ''}` },
		{ key: 'vip', label: `VIP${pendingVipCount > 0 ? ` (${pendingVipCount})` : ''}` },
		{ key: 'withdraw', label: `Rút${pendingWithdrawCount > 0 ? ` (${pendingWithdrawCount})` : ''}` },
		{ key: 'stats', label: 'Thống Kê' },
	];

	const filterOptions = {
		stories: ['pending', 'published', 'rejected'],
		topup: ['pending', 'approved', 'rejected'],
		vip: ['pending', 'approved', 'rejected'],
		withdraw: ['pending', 'approved', 'rejected'],
	};
	const filterLabels = { pending: 'Chờ duyệt', published: 'Đã duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };
	const currentFilter = tab === 'stories' ? storyFilter : tab === 'topup' ? topupFilter : tab === 'vip' ? vipFilter : withdrawFilter;
	const setFilter = (f) => {
		if (tab === 'stories') setStoryFilter(f);
		else if (tab === 'topup') setTopupFilter(f);
		else if (tab === 'vip') setVipFilter(f);
		else if (tab === 'withdraw') setWithdrawFilter(f);
	};

	return (
		<SafeAreaView style={s.safe}>
			<View style={s.header}>
				<Text style={s.headerTitle}>Admin Dashboard</Text>
				<TouchableOpacity
					style={s.logoutBtn}
					onPress={() => confirm("Đăng xuất", "Bạn muốn đăng xuất?", () => { dispatch(logout()); navigation.replace("Guest"); }, true)}
				>
					<MaterialIcons name="logout" size={20} color="#D32F2F" />
				</TouchableOpacity>
			</View>

			<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 52 }} contentContainerStyle={s.tabRow}>
				{TABS.map(t => (
					<TouchableOpacity key={t.key} style={[s.tabBtn, tab === t.key && s.tabBtnActive]} onPress={() => setTab(t.key)}>
						<Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
					</TouchableOpacity>
				))}
			</ScrollView>

			{filterOptions[tab] && (
				<View style={s.filterRow}>
					{filterOptions[tab].map(f => (
						<TouchableOpacity key={f} style={[s.filterBtn, currentFilter === f && s.filterBtnActive]} onPress={() => setFilter(f)}>
							<Text style={[s.filterText, currentFilter === f && s.filterTextActive]}>
								{filterLabels[f] || f}
								{f === 'pending' && tab === 'stories' && pendingStories.length > 0 ? ` (${pendingStories.length})` : ''}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			)}

			{loading ? (
				<View style={s.center}><ActivityIndicator size="large" color="#8B4513" /></View>
			) : tab === 'stories' ? (
				displayedStories.length === 0
					? <View style={s.center}><MaterialIcons name="check-circle" size={52} color="#2E7D32" /><Text style={s.emptyText}>Không có truyện nào.</Text></View>
					: <FlatList data={displayedStories} keyExtractor={i => String(i.id)} renderItem={renderStory} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B4513" />} />
			) : tab === 'authors' ? (
				authorRequests.length === 0
					? <View style={s.center}><MaterialIcons name="person-add-disabled" size={52} color="#EBEBEB" /><Text style={s.emptyText}>Không có yêu cầu tác giả nào.</Text></View>
					: <FlatList data={authorRequests} keyExtractor={i => String(i.id)} renderItem={renderAuthorRequest} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B4513" />} />
			) : tab === 'topup' ? (
				topupRequests.length === 0
					? <View style={s.center}><MaterialIcons name="account-balance-wallet" size={52} color="#EBEBEB" /><Text style={s.emptyText}>Không có yêu cầu nạp xu nào.</Text></View>
					: <FlatList data={topupRequests} keyExtractor={i => String(i.id)} renderItem={renderTopupRequest} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B4513" />} />
			) : tab === 'vip' ? (
				vipRequests.length === 0
					? <View style={s.center}><MaterialIcons name="star-outline" size={52} color="#EBEBEB" /><Text style={s.emptyText}>Không có yêu cầu VIP nào.</Text></View>
					: <FlatList data={vipRequests} keyExtractor={i => String(i.id)} renderItem={renderVipRequest} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B4513" />} />
			) : tab === 'withdraw' ? (
				withdrawRequests.length === 0
					? <View style={s.center}><MaterialIcons name="account-balance" size={52} color="#EBEBEB" /><Text style={s.emptyText}>Không có yêu cầu rút tiền nào.</Text></View>
					: <FlatList data={withdrawRequests} keyExtractor={i => String(i.id)} renderItem={renderWithdrawRequest} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B4513" />} />
			) : tab === 'stats' ? (
				!adminStats
					? <View style={s.center}><ActivityIndicator size="large" color="#8B4513" /></View>
					: <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B4513" />}>
						{/* Thẻ tổng quan */}
						<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
							{[
								{ label: 'Doanh thu (mua)', value: `${Math.floor(adminStats.adminShare)} xu`, icon: 'shopping-cart', color: '#2E7D32' },
								{ label: 'Tổng lượt xem', value: String(adminStats.totalViews || 0), icon: 'visibility', color: '#1565C0' },
								{ label: 'Lượt mua truyện', value: String(adminStats.totalPurchases || 0), icon: 'receipt', color: '#E65100' },
								{ label: 'Xu lưu hành', value: `${Math.floor(adminStats.totalXuCirculating)} xu`, icon: 'account-balance-wallet', color: '#6A1B9A' },
								{ label: 'Người dùng', value: String(adminStats.totalUsers || 0), icon: 'group', color: '#00695C' },
								{ label: 'Truyện đã duyệt', value: String(adminStats.totalStories || 0), icon: 'menu-book', color: '#8B4513' },
							].map(card => (
								<View key={card.label} style={{ width: '47%', backgroundColor: '#FFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#F0F0F0', gap: 6 }}>
									<MaterialIcons name={card.icon} size={22} color={card.color} />
									<Text style={{ fontSize: 18, fontWeight: '800', color: '#1A1A1A' }}>{card.value}</Text>
									<Text style={{ fontSize: 11, color: '#888' }}>{card.label}</Text>
								</View>
							))}
						</View>

						{/* Thống kê theo truyện */}
						<Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A' }}>Doanh thu theo truyện</Text>
						{(adminStats.storyStats || []).map(s => (
							<View key={s.id} style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#F0F0F0', gap: 6 }}>
								<Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }} numberOfLines={1}>{s.title}</Text>
								<Text style={{ fontSize: 11, color: '#8B4513' }}>{s.author_name}</Text>
								<View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
									<View style={{ alignItems: 'center' }}>
										<Text style={{ fontSize: 14, fontWeight: '800', color: '#1565C0' }}>{s.views || 0}</Text>
										<Text style={{ fontSize: 10, color: '#888' }}>Lượt xem</Text>
									</View>
									<View style={{ alignItems: 'center' }}>
										<Text style={{ fontSize: 14, fontWeight: '800', color: '#E65100' }}>{s.purchase_count || 0}</Text>
										<Text style={{ fontSize: 10, color: '#888' }}>Lượt mua</Text>
									</View>
									<View style={{ alignItems: 'center' }}>
										<Text style={{ fontSize: 14, fontWeight: '800', color: '#2E7D32' }}>{s.admin_earned || 0} xu</Text>
										<Text style={{ fontSize: 10, color: '#888' }}>Admin nhận (30%)</Text>
									</View>
									{s.price_xu > 0 && <View style={{ alignItems: 'center' }}>
										<Text style={{ fontSize: 14, fontWeight: '800', color: '#8B4513' }}>{s.price_xu} xu</Text>
										<Text style={{ fontSize: 10, color: '#888' }}>Giá bán</Text>
									</View>}
								</View>
							</View>
						))}

						{/* Giao dịch gần đây */}
						<Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A' }}>Giao dịch gần đây</Text>
						{(adminStats.recentPurchases || []).length === 0
							? <Text style={{ color: '#888', fontSize: 13 }}>Chưa có giao dịch.</Text>
							: (adminStats.recentPurchases || []).map((p, i) => (
								<View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
									<View style={{ flex: 1 }}>
										<Text style={{ fontSize: 13, fontWeight: '600', color: '#1A1A1A' }} numberOfLines={1}>{p.title}</Text>
										<Text style={{ fontSize: 11, color: '#888' }}>{p.buyer} · {new Date(p.purchased_at).toLocaleDateString('vi-VN')}</Text>
									</View>
									<View style={{ alignItems: 'flex-end' }}>
										<Text style={{ fontSize: 13, fontWeight: '700', color: '#2E7D32' }}>+{p.admin_cut} xu</Text>
										<Text style={{ fontSize: 10, color: '#888' }}>{p.price_xu} xu tổng</Text>
									</View>
								</View>
							))
						}
					</ScrollView>
			) : (
				<FlatList data={users} keyExtractor={i => String(i.id)} renderItem={renderUser} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B4513" />} />
			)}

			{/* Reject Story Modal */}
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
							multiline
						/>
						<TouchableOpacity style={[s.rejectSubmitBtn, rejecting && { opacity: 0.6 }]} onPress={handleRejectSubmit} disabled={rejecting}>
							{rejecting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.rejectSubmitText}>Xác nhận từ chối</Text>}
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* ConfirmModal */}
			<Modal visible={confirmModal.visible} animationType="fade" transparent>
				<View style={s.overlay}>
					<View style={[s.sheet, { paddingBottom: 28 }]}>
						<Text style={[s.sheetTitle, { marginBottom: 8 }]}>{confirmModal.title}</Text>
						<Text style={{ fontSize: 14, color: "#888888", marginBottom: 20 }}>{confirmModal.message}</Text>
						<View style={{ flexDirection: 'row', gap: 10 }}>
							<TouchableOpacity
								style={{ flex: 1, paddingVertical: 12, borderRadius: 999, backgroundColor: '#F5F5F5', alignItems: 'center' }}
								onPress={() => setConfirmModal(m => ({ ...m, visible: false }))}>
								<Text style={{ fontWeight: '700', color: '#888888' }}>Hủy</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={{ flex: 1, paddingVertical: 12, borderRadius: 999, backgroundColor: confirmModal.destructive ? '#D32F2F' : '#2E7D32', alignItems: 'center' }}
								onPress={() => { setConfirmModal(m => ({ ...m, visible: false })); confirmModal.onOk?.(); }}>
								<Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Xác nhận</Text>
							</TouchableOpacity>
						</View>
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
	tabRow: { flexDirection: "row", paddingHorizontal: 16, gap: 6, paddingVertical: 10 },
	tabBtn: { paddingVertical: 9, paddingHorizontal: 14, alignItems: "center", borderRadius: 10, backgroundColor: "#F5F5F5", borderWidth: 1, borderColor: "#EBEBEB" },
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
