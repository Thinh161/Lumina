import React, { useEffect, useState } from "react";
import {
	View, Text, StyleSheet, SafeAreaView, ScrollView,
	Image, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, logout } from "../../redux_thunk/AuthSlice";
import { fetchLibrary } from "../../redux_thunk/LibrarySlice";

const DEFAULT_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ8869qWy9nQKmjm2nd15yiyLA6AGe5xluCcknNDETI3u69xO53m5s26W5UQqCmU4zyzf11SgtOc3tECHsxH5V-yyIuo5G1XsRxwOdJkLJJ-E34EqbXhTuus-swwxehy7YNJQoWM_0n6aJfm53T0imvlYsBv985pHJm8YP0BjAl-wxnt_WbT9RiW0ec3PrbteyI9lmRFOmnestzuuwUHyeJYbXbouK6ldtyjvVTAByLLhucHQL4W1tFTwUwiw7lHEMjj4URDKWSpg";

const API_URL = 'http://192.168.10.104:5555/api';

const TOPUP_PACKAGES = [
	{ label: "10.000đ", amount: 10 },
	{ label: "50.000đ", amount: 50 },
	{ label: "100.000đ", amount: 100 },
	{ label: "200.000đ", amount: 200 },
];

const ProfileScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { user } = useSelector(state => state.auth);
	const { items: libraryItems } = useSelector(state => state.library);

	const isAuthor = user?.role_id === 2;
	const isAdmin = user?.role_id === 1;

	const [showTopup, setShowTopup] = useState(false);
	const [topupAmount, setTopupAmount] = useState('');
	const [topupLoading, setTopupLoading] = useState(false);

	const isReader = user?.role_id === 4;

	const managementItems = [
		{ id: "m-1", title: "Thông tin cá nhân", subtitle: "Cập nhật tên và ảnh đại diện", icon: "person", screen: "EditProfile" },
		{ id: "m-2", title: "Bảo mật & Mật khẩu", subtitle: "Đổi mật khẩu tài khoản", icon: "security", screen: "ChangePassword" },
		{ id: "m-history", title: "Lịch sử đọc", subtitle: "Xem lại những chương đã đọc", icon: "history", screen: "ReadingHistory" },
		...(isReader ? [{ id: "m-become-author", title: "Trở thành tác giả", subtitle: "Gửi yêu cầu lên Admin", icon: "create", action: "requestAuthor" }] : []),
		...(isAuthor ? [{ id: "m-author", title: "Quản lý truyện", subtitle: "Đăng truyện mới, thêm chương", icon: "edit-note", screen: "AuthorDashboard" }] : []),
		...(isAdmin ? [{ id: "m-admin", title: "Admin Dashboard", subtitle: "Kiểm duyệt truyện, quản lý user", icon: "admin-panel-settings", screen: "AdminDashboard" }] : []),
	];

	useEffect(() => {
		if (user?.id) {
			dispatch(fetchUserProfile(user.id));
			dispatch(fetchLibrary(user.id));
		}
	}, [dispatch, user?.id]);

	const handleLogout = () => {
		dispatch(logout());
		const rootNavigation = navigation.getParent();
		if (rootNavigation) {
			rootNavigation.reset({
				index: 0,
				routes: [{ name: "Guest", state: { routes: [{ name: "LoginTab" }] } }],
			});
			return;
		}
		Alert.alert("Đăng xuất", "Bạn đã đăng xuất.");
	};

	const handleTopup = async () => {
		const amount = parseInt(topupAmount, 10);
		if (!amount || amount <= 0) { Alert.alert("Lỗi", "Vui lòng nhập số xu hợp lệ."); return; }
		setTopupLoading(true);
		try {
			const res = await fetch(`${API_URL}/users/${user.id}/balance`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount }),
			}).then(r => r.json());
			if (res.status === 'success') {
				dispatch(fetchUserProfile(user.id));
				setShowTopup(false);
				setTopupAmount('');
				Alert.alert("Nạp xu thành công", `Số dư mới: ${Number(res.balance).toLocaleString("vi-VN")} xu`);
			} else {
				Alert.alert("Lỗi", res.message || "Nạp xu thất bại.");
			}
		} catch { Alert.alert("Lỗi", "Không thể kết nối máy chủ."); }
		finally { setTopupLoading(false); }
	};

	const handleBuyVip = () => {
		if (user?.is_vip) { Alert.alert("VIP", "Bạn đã là thành viên VIP rồi."); return; }
		Alert.alert("Mua VIP", `Bạn sẽ tiêu 1000 xu để kích hoạt VIP vĩnh viễn.\nSố dư hiện tại: ${Number(user?.balance || 0).toLocaleString("vi-VN")} xu`, [
			{ text: "Hủy", style: "cancel" },
			{
				text: "Mua ngay", onPress: async () => {
					try {
						const res = await fetch(`${API_URL}/users/${user.id}/buy-vip`, { method: 'PUT' }).then(r => r.json());
						if (res.status === 'success') {
							dispatch(fetchUserProfile(user.id));
							Alert.alert("Thành công", res.message);
						} else {
							Alert.alert("Lỗi", res.message);
						}
					} catch { Alert.alert("Lỗi", "Không thể kết nối máy chủ."); }
				}
			}
		]);
	};

	const handleRequestAuthor = () => {
		Alert.alert("Trở thành tác giả", "Gửi yêu cầu lên Admin để được cấp quyền đăng truyện?", [
			{ text: "Hủy", style: "cancel" },
			{
				text: "Gửi yêu cầu", onPress: async () => {
					try {
						const res = await fetch(`${API_URL}/users/${user.id}/request-author`, { method: 'PUT' }).then(r => r.json());
						Alert.alert(res.status === 'success' ? "Đã gửi" : "Thông báo", res.message);
					} catch { Alert.alert("Lỗi", "Không thể kết nối máy chủ."); }
				}
			}
		]);
	};

	const displayName = user?.full_name || user?.username || "Độc giả";
	const vipLabel = user?.is_vip ? "Thành viên cao cấp" : "Thành viên thường";
	const balanceText = user?.balance != null ? Number(user.balance).toLocaleString("vi-VN") : "0";
	const avatarUri = user?.avatar || DEFAULT_AVATAR;
	const shownLibrary = libraryItems.slice(0, 4);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.root}>
				<View style={styles.topBar}>
					<View style={styles.topBarLeft}>
						<MaterialIcons name="menu" size={22} color="#1A1A1A" />
						<Text style={styles.topBarTitle}>App Đọc Truyện Online</Text>
					</View>
					<MaterialIcons name="search" size={22} color="#1A1A1A" />
				</View>

				<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
					<View style={styles.profileHeader}>
						<View style={styles.avatarWrap}>
							<Image source={{ uri: avatarUri }} style={styles.avatar} />
							<TouchableOpacity style={styles.editAvatarButton} onPress={() => navigation.navigate("EditProfile")}>
								<MaterialIcons name="edit" size={14} color="#FFFFFF" />
							</TouchableOpacity>
						</View>

						<View style={styles.profileInfo}>
							<Text style={styles.profileBadge}>{vipLabel}</Text>
							<Text style={styles.profileName}>{displayName}</Text>
							<Text style={styles.profileQuote}>"Lạc giữa những chương hồi và những giấc mơ."</Text>
						</View>

						<View style={styles.statsRow}>
							<View style={styles.statCard}>
								<Text style={styles.statValue}>{libraryItems.length}</Text>
								<Text style={styles.statLabel}>Thư viện</Text>
							</View>
							<View style={styles.statCard}>
								<Text style={styles.statValue}>{user?.is_vip ? "VIP" : "Free"}</Text>
								<Text style={styles.statLabel}>Hạng thành viên</Text>
							</View>
						</View>
					</View>

					<View style={styles.dashboardGrid}>
						<View style={styles.vipCard}>
							<View>
								<Text style={styles.vipLabel}>Số dư tài khoản</Text>
								<View style={styles.vipRow}>
									<MaterialCommunityIcons name="currency-usd" size={20} color="#8B4513" />
									<Text style={styles.vipValue}>{balanceText}</Text>
								</View>
								<Text style={styles.vipSubtitle}>Xu hiện có trong tài khoản của bạn</Text>
							</View>
							<View style={{ flexDirection: "row", gap: 8 }}>
								<TouchableOpacity style={[styles.vipButton, { flex: 1 }]} onPress={() => setShowTopup(true)}>
									<Text style={styles.vipButtonText}>Nạp Xu</Text>
									<MaterialIcons name="add" size={16} color="#FFFFFF" />
								</TouchableOpacity>
								{!user?.is_vip && (
									<TouchableOpacity style={[styles.vipButton, { flex: 1, backgroundColor: "#5D2E0C" }]} onPress={handleBuyVip}>
										<Text style={styles.vipButtonText}>Mua VIP</Text>
										<MaterialIcons name="star" size={16} color="#FFD700" />
									</TouchableOpacity>
								)}
							</View>
							<View style={styles.vipGlow} />
						</View>

						{/* Thư viện thực */}
						<View style={styles.libraryCard}>
							<View style={styles.libraryHeader}>
								<Text style={styles.libraryTitle}>Thư Viện ({libraryItems.length})</Text>
								<TouchableOpacity onPress={() => navigation.navigate("LibraryTab")}>
									<Text style={styles.libraryAction}>Xem tất cả</Text>
								</TouchableOpacity>
							</View>
							{shownLibrary.length === 0 ? (
								<Text style={{ fontSize: 13, color: "#BBBBBB", textAlign: "center", paddingVertical: 12 }}>
									Chưa có truyện nào. Thêm truyện yêu thích vào đây!
								</Text>
							) : (
								<View style={styles.libraryGrid}>
									{shownLibrary.map(item => (
										<TouchableOpacity
											key={item.id}
											style={styles.libraryItem}
											onPress={() => navigation.navigate("LibraryTab")}
										>
											<Image source={{ uri: item.cover_image || item.thumbnail }} style={styles.libraryCover} />
											<Text style={styles.libraryTag}>{item.category_name || "Khác"}</Text>
											<Text style={styles.libraryName} numberOfLines={2}>{item.title}</Text>
										</TouchableOpacity>
									))}
								</View>
							)}
						</View>

						<View style={styles.managementCard}>
							<Text style={styles.managementTitle}>Quản Lý Hồ Sơ</Text>
							<View style={styles.managementGrid}>
								{managementItems.map(item => (
									<TouchableOpacity
										key={item.id}
										style={styles.managementRow}
										onPress={() => {
											if (item.action === 'requestAuthor') { handleRequestAuthor(); return; }
											if (item.screen) navigation.navigate(item.screen);
										}}
									>
										<View style={styles.managementLeft}>
											<View style={styles.managementIconWrap}>
												<MaterialIcons name={item.icon} size={18} color="#8B4513" />
											</View>
											<View>
												<Text style={styles.managementItemTitle}>{item.title}</Text>
												<Text style={styles.managementItemSubtitle}>{item.subtitle}</Text>
											</View>
										</View>
										<MaterialIcons name="chevron-right" size={20} color="#BBBBBB" />
									</TouchableOpacity>
								))}
							</View>
						</View>

						<TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
							<MaterialIcons name="logout" size={18} color="#D32F2F" />
							<Text style={styles.logoutText}>Đăng xuất khỏi tài khoản</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</View>

			{/* Modal Nạp Xu */}
			<Modal visible={showTopup} animationType="slide" transparent>
				<View style={styles.overlay}>
					<View style={styles.sheet}>
						<View style={styles.sheetHeader}>
							<Text style={styles.sheetTitle}>Nạp Xu</Text>
							<TouchableOpacity onPress={() => { setShowTopup(false); setTopupAmount(''); }}>
								<MaterialIcons name="close" size={22} color="#888888" />
							</TouchableOpacity>
						</View>
						<Text style={styles.sheetSub}>Chọn gói hoặc nhập số xu muốn nạp</Text>
						<View style={styles.packageRow}>
							{TOPUP_PACKAGES.map(p => (
								<TouchableOpacity
									key={p.amount}
									style={[styles.packageBtn, topupAmount === String(p.amount) && styles.packageBtnActive]}
									onPress={() => setTopupAmount(String(p.amount))}
								>
									<Text style={[styles.packageBtnText, topupAmount === String(p.amount) && styles.packageBtnTextActive]}>{p.label}</Text>
								</TouchableOpacity>
							))}
						</View>
						<TextInput
							style={styles.topupInput}
							value={topupAmount}
							onChangeText={setTopupAmount}
							placeholder="Hoặc nhập số xu..."
							placeholderTextColor="#BBBBBB"
							keyboardType="numeric"
						/>
						<TouchableOpacity style={[styles.topupSubmitBtn, topupLoading && { opacity: 0.6 }]} onPress={handleTopup} disabled={topupLoading}>
							{topupLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.topupSubmitText}>Xác nhận nạp xu</Text>}
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
	root: { flex: 1, position: "relative" },
	topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
	topBarLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
	topBarTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
	scrollContent: { padding: 16, paddingBottom: 140 },
	profileHeader: { gap: 16, marginBottom: 24 },
	avatarWrap: { alignSelf: "center", position: "relative" },
	avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: "#EBEBEB" },
	editAvatarButton: { position: "absolute", right: 6, bottom: 6, backgroundColor: "#8B4513", padding: 8, borderRadius: 999 },
	profileInfo: { alignItems: "center", gap: 6 },
	profileBadge: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", color: "#8B4513" },
	profileName: { fontSize: 28, fontWeight: "700", color: "#1A1A1A" },
	profileQuote: { fontSize: 14, fontStyle: "italic", color: "#888888", textAlign: "center" },
	statsRow: { flexDirection: "row", justifyContent: "center", gap: 12 },
	statCard: { backgroundColor: "#F5F5F5", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18, alignItems: "center" },
	statValue: { fontSize: 20, fontWeight: "700", color: "#8B4513" },
	statLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase", color: "#888888", marginTop: 4 },
	dashboardGrid: { gap: 16 },
	vipCard: { backgroundColor: "#F2E8E3", borderRadius: 16, padding: 18, gap: 16, overflow: "hidden", borderWidth: 1, borderColor: "#EBEBEB" },
	vipLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", color: "#8B4513" },
	vipRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
	vipValue: { fontSize: 30, fontWeight: "800", color: "#8B4513" },
	vipSubtitle: { fontSize: 12, color: "#888888", marginTop: 6 },
	vipButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#8B4513", paddingVertical: 12, borderRadius: 999 },
	vipButtonText: { fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", color: "#FFFFFF" },
	vipGlow: { position: "absolute", right: -40, top: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(139, 69, 19, 0.08)" },
	libraryCard: { backgroundColor: "#FAFAFA", borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: "#EBEBEB" },
	libraryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	libraryTitle: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
	libraryAction: { fontSize: 12, fontWeight: "600", color: "#8B4513" },
	libraryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
	libraryItem: { width: "48%" },
	libraryCover: { width: "100%", height: 140, borderRadius: 10, marginBottom: 6 },
	libraryTag: { fontSize: 9, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: "#8B4513" },
	libraryName: { fontSize: 12, fontWeight: "700", color: "#1A1A1A", marginTop: 2 },
	managementCard: { backgroundColor: "#FAFAFA", borderRadius: 16, padding: 18, gap: 12, borderWidth: 1, borderColor: "#EBEBEB" },
	managementTitle: { fontSize: 13, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
	managementGrid: { gap: 6 },
	managementRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
	managementLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
	managementIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
	managementItemTitle: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
	managementItemSubtitle: { fontSize: 10, color: "#888888", marginTop: 2 },
	logoutRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 },
	logoutText: { fontSize: 13, fontWeight: "700", color: "#D32F2F" },
	overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
	sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 12 },
	sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	sheetTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
	sheetSub: { fontSize: 13, color: "#888888" },
	packageRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	packageBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8, backgroundColor: "#F5F5F5", borderWidth: 1, borderColor: "#EBEBEB" },
	packageBtnActive: { backgroundColor: "#8B4513", borderColor: "#8B4513" },
	packageBtnText: { fontSize: 13, fontWeight: "700", color: "#888888" },
	packageBtnTextActive: { color: "#FFFFFF" },
	topupInput: { backgroundColor: "#F5F5F5", borderRadius: 10, borderWidth: 1, borderColor: "#EBEBEB", paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#1A1A1A" },
	topupSubmitBtn: { backgroundColor: "#8B4513", paddingVertical: 14, borderRadius: 999, alignItems: "center" },
	topupSubmitText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});

export default ProfileScreen;
