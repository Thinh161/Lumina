import React, { useEffect, useState } from "react";
import {
	View, Text, StyleSheet, SafeAreaView, ScrollView,
	Image, TouchableOpacity, Alert, Modal, ActivityIndicator, TextInput,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, logout } from "../../redux_thunk/AuthSlice";
import { fetchLibrary } from "../../redux_thunk/LibrarySlice";
import { fetchUnreadCount } from "../../redux_thunk/ActorSlice";
import { requestTopup, buyVip, requestWithdraw, requestAuthorRole } from "../../redux_thunk/UserSlice";

const DEFAULT_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ8869qWy9nQKmjm2nd15yiyLA6AGe5xluCcknNDETI3u69xO53m5s26W5UQqCmU4zyzf11SgtOc3tECHsxH5V-yyIuo5G1XsRxwOdJkLJJ-E34EqbXhTuus-swwxehy7YNJQoWM_0n6aJfm53T0imvlYsBv985pHJm8YP0BjAl-wxnt_WbT9RiW0ec3PrbteyI9lmRFOmnestzuuwUHyeJYbXbouK6ldtyjvVTAByLLhucHQL4W1tFTwUwiw7lHEMjj4URDKWSpg";

import { confirmAlert } from '../../utils/confirmAlert';

const BANK_INFO = { bank: 'Vietcombank', account: '1234567890', owner: 'LUMINA APP' };

const VIP_PACKAGES = [
	{ label: "1 tháng", xu: 500, months: 1 },
	{ label: "3 tháng", xu: 1200, months: 3 },
	{ label: "1 năm", xu: 4000, months: 12 },
	{ label: "Vĩnh viễn", xu: 10000, months: null },
];

const TOPUP_PACKAGES = [
	{ label: "10.000đ", vnd: 10000, xu: 10 },
	{ label: "20.000đ", vnd: 20000, xu: 20 },
	{ label: "50.000đ", vnd: 50000, xu: 50 },
	{ label: "100.000đ", vnd: 100000, xu: 100 },
	{ label: "200.000đ", vnd: 200000, xu: 200 },
	{ label: "500.000đ", vnd: 500000, xu: 500 },
];

const ProfileScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { user } = useSelector(state => state.auth);
	const { items: libraryItems } = useSelector(state => state.library);
	const { unreadCount } = useSelector(state => state.actor);

	const isAuthor = user?.role_id === 2;
	const isAdmin = user?.role_id === 1;

	const [showTopup, setShowTopup] = useState(false);
	const [topupStep, setTopupStep] = useState(1);
	const [selectedPkg, setSelectedPkg] = useState(null);
	const [topupLoading, setTopupLoading] = useState(false);
	const [showVip, setShowVip] = useState(false);
	const [selectedVipPkg, setSelectedVipPkg] = useState(null);
	const [vipLoading, setVipLoading] = useState(false);

	const [showWithdraw, setShowWithdraw] = useState(false);
	const [withdrawXu, setWithdrawXu] = useState('');
	const [withdrawBank, setWithdrawBank] = useState('');
	const [withdrawAccount, setWithdrawAccount] = useState('');
	const [withdrawOwner, setWithdrawOwner] = useState('');
	const [withdrawStep, setWithdrawStep] = useState(1);
	const [withdrawLoading, setWithdrawLoading] = useState(false);
	const [withdrawResult, setWithdrawResult] = useState(null);

	const isReader = user?.role_id === 4;

	const managementItems = [
		{ id: "m-1", title: "Thông tin cá nhân", subtitle: "Cập nhật tên và ảnh đại diện", icon: "person", screen: "EditProfile" },
		{ id: "m-2", title: "Bảo mật & Mật khẩu", subtitle: "Đổi mật khẩu tài khoản", icon: "security", screen: "ChangePassword" },
		{ id: "m-history", title: "Lịch sử đọc", subtitle: "Xem lại những chương đã đọc", icon: "history", screen: "ReadingHistory" },
		...(isReader && !user?.author_request ? [{ id: "m-become-author", title: "Trở thành tác giả", subtitle: "Gửi yêu cầu lên Admin", icon: "create", action: "requestAuthor" }] : []),
		...(isReader && user?.author_request ? [{ id: "m-pending-author", title: "Đang chờ duyệt", subtitle: "Yêu cầu tác giả đang được Admin xem xét", icon: "hourglass-empty", action: null }] : []),
		...(isAuthor ? [
			{ id: "m-author", title: "Quản lý truyện", subtitle: "Đăng truyện mới, thêm chương", icon: "edit-note", screen: "AuthorDashboard" },
			{ id: "m-notifications", title: "Thông báo", subtitle: unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Xem thông báo từ Admin", icon: "notifications", screen: "Notifications", badge: unreadCount > 0 ? unreadCount : null },
		] : []),
		...(isAdmin ? [{ id: "m-admin", title: "Admin Dashboard", subtitle: "Kiểm duyệt truyện, quản lý user", icon: "admin-panel-settings", screen: "AdminDashboard" }] : []),
	];

	useEffect(() => {
		if (user?.id) {
			dispatch(fetchUserProfile(user.id));
			dispatch(fetchLibrary(user.id));
			if (user.role_id === 2) dispatch(fetchUnreadCount(user.id));
		}
	}, [dispatch, user?.id]);

	const handleLogout = () => {
		dispatch(logout());
	};

	const handleTopup = async () => {
		if (!selectedPkg) return;
		setTopupLoading(true);
		try {
			await dispatch(requestTopup({ userId: user.id, amountVnd: selectedPkg.vnd, amountXu: selectedPkg.xu })).unwrap();
			setTopupStep(3);
		} catch (err) {
			Alert.alert("Lỗi", err || "Không thể gửi yêu cầu.");
		} finally { setTopupLoading(false); }
	};

	const handleConfirmBuyVip = async () => {
		if (!selectedVipPkg) return;
		if ((user?.balance || 0) < selectedVipPkg.xu) {
			Alert.alert("Không đủ xu", `Bạn cần ít nhất ${selectedVipPkg.xu} xu để mua gói này.`);
			return;
		}
		setVipLoading(true);
		try {
			await dispatch(buyVip({ userId: user.id, xu: selectedVipPkg.xu, months: selectedVipPkg.months })).unwrap();
			dispatch(fetchUserProfile(user.id));
			setShowVip(false);
			Alert.alert("Thành công", `Đã kích hoạt VIP ${selectedVipPkg.label}!`);
		} catch (err) {
			Alert.alert("Lỗi", err || "Không thể mua VIP.");
		} finally { setVipLoading(false); }
	};

	const handleWithdraw = async () => {
		const xu = parseInt(withdrawXu, 10);
		if (!xu || xu < 10) { Alert.alert("Lỗi", "Cần ít nhất 10 xu để rút."); return; }
		if (!withdrawAccount.trim()) { Alert.alert("Lỗi", "Vui lòng nhập số tài khoản."); return; }
		setWithdrawLoading(true);
		try {
			const res = await dispatch(requestWithdraw({
				userId: user.id,
				amountXu: xu,
				bankName: withdrawBank,
				bankAccount: withdrawAccount,
				bankOwner: withdrawOwner,
			})).unwrap();
			setWithdrawResult(res);
			setWithdrawStep(2);
			dispatch(fetchUserProfile(user.id));
		} catch (err) {
			Alert.alert("Lỗi", err || "Không thể gửi yêu cầu.");
		} finally { setWithdrawLoading(false); }
	};

	const handleRequestAuthor = () => {
		confirmAlert("Trở thành tác giả", "Gửi yêu cầu lên Admin để được cấp quyền đăng truyện?", async () => {
			try {
				const msg = await dispatch(requestAuthorRole(user.id)).unwrap();
				Alert.alert("Đã gửi", msg);
				dispatch(fetchUserProfile(user.id));
			} catch (err) {
				Alert.alert("Thông báo", err);
			}
		});
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
					<Text style={styles.topBarTitle}>App Đọc Truyện Online</Text>
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
									<MaterialCommunityIcons name="circle-multiple" size={20} color="#8B4513" />
									<Text style={styles.vipValue}>{balanceText} xu</Text>
								</View>
								<Text style={styles.vipSubtitle}>Xu hiện có trong tài khoản của bạn</Text>
							</View>
							<View style={{ flexDirection: "row", gap: 8 }}>
								<TouchableOpacity style={[styles.vipButton, { flex: 1 }]} onPress={() => setShowTopup(true)}>
									<Text style={styles.vipButtonText}>Nạp Xu</Text>
									<MaterialIcons name="add" size={16} color="#FFFFFF" />
								</TouchableOpacity>
								{!user?.is_vip && (
									<TouchableOpacity style={[styles.vipButton, { flex: 1, backgroundColor: "#5D2E0C" }]} onPress={() => { setSelectedVipPkg(null); setShowVip(true); }}>
										<Text style={styles.vipButtonText}>Mua VIP</Text>
										<MaterialIcons name="star" size={16} color="#FFD700" />
									</TouchableOpacity>
								)}
								{isAuthor && (
									<TouchableOpacity style={[styles.vipButton, { flex: 1, backgroundColor: "#2E7D32" }]} onPress={() => { setWithdrawStep(1); setWithdrawXu(''); setWithdrawResult(null); setShowWithdraw(true); }}>
										<Text style={styles.vipButtonText}>Rút Tiền</Text>
										<MaterialIcons name="account-balance" size={16} color="#FFFFFF" />
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
											<Text style={styles.libraryTag}>{item.category_names || "Khác"}</Text>
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
												{item.badge ? (
													<View style={styles.mgmtBadge}>
														<Text style={styles.mgmtBadgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
													</View>
												) : null}
											</View>
											<View>
												<Text style={styles.managementItemTitle}>{item.title}</Text>
												<Text style={[styles.managementItemSubtitle, item.badge && { color: '#8B4513' }]}>{item.subtitle}</Text>
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

			{/* Modal Mua VIP */}
			<Modal visible={showVip} animationType="slide" transparent>
				<View style={styles.overlay}>
					<View style={[styles.sheet, { gap: 14 }]}>
						<View style={styles.sheetHeader}>
							<Text style={styles.sheetTitle}>Mua VIP</Text>
							<TouchableOpacity onPress={() => setShowVip(false)}>
								<MaterialIcons name="close" size={22} color="#888888" />
							</TouchableOpacity>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF8E1', borderRadius: 10, padding: 12 }}>
							<MaterialIcons name="star" size={28} color="#FFD700" />
							<Text style={{ fontSize: 13, color: '#5D2E0C', flex: 1, lineHeight: 18 }}>
								Đọc trước các chương bị khóa, không giới hạn nội dung
							</Text>
						</View>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
							<Text style={{ fontSize: 13, color: '#888888' }}>Số dư của bạn</Text>
							<Text style={{ fontSize: 14, fontWeight: '700', color: '#8B4513' }}>{Math.floor(user?.balance || 0)} xu</Text>
						</View>
						<View style={{ gap: 8 }}>
							{VIP_PACKAGES.map(p => {
								const active = selectedVipPkg?.label === p.label;
								const canAfford = (user?.balance || 0) >= p.xu;
								return (
									<TouchableOpacity
										key={p.label}
										style={[styles.packageBtn, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, active && styles.packageBtnActive, !canAfford && { opacity: 0.4 }]}
										onPress={() => canAfford && setSelectedVipPkg(p)}
									>
										<View>
											<Text style={[styles.packageBtnText, active && styles.packageBtnTextActive]}>{p.label}</Text>
											<Text style={[styles.packageBtnXu, active && { color: '#FFFFFF99' }]}>
												{p.months ? `${p.months} tháng VIP` : 'VIP vĩnh viễn'}
											</Text>
										</View>
										<Text style={[{ fontSize: 15, fontWeight: '800' }, active ? { color: '#FFFFFF' } : { color: '#8B4513' }]}>
											{p.xu.toLocaleString('vi-VN')} xu
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>
						<TouchableOpacity
							style={[styles.topupSubmitBtn, (!selectedVipPkg || vipLoading) && { opacity: 0.4 }]}
							onPress={handleConfirmBuyVip}
							disabled={!selectedVipPkg || vipLoading}
						>
							{vipLoading
								? <ActivityIndicator color="#fff" size="small" />
								: <Text style={styles.topupSubmitText}>
									{selectedVipPkg ? `Mua ${selectedVipPkg.label} — ${selectedVipPkg.xu.toLocaleString('vi-VN')} xu` : 'Chọn gói VIP'}
								</Text>
							}
						</TouchableOpacity>
						<TouchableOpacity style={styles.backStepBtn} onPress={() => setShowVip(false)}>
							<Text style={styles.backStepText}>Hủy</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Modal Rút Tiền */}
			<Modal visible={showWithdraw} animationType="slide" transparent>
				<View style={styles.overlay}>
					<View style={[styles.sheet, { gap: 14 }]}>
						<View style={styles.sheetHeader}>
							<Text style={styles.sheetTitle}>{withdrawStep === 1 ? 'Rút tiền' : 'Yêu cầu đã gửi'}</Text>
							{withdrawStep !== 2 && (
								<TouchableOpacity onPress={() => setShowWithdraw(false)}>
									<MaterialIcons name="close" size={22} color="#888888" />
								</TouchableOpacity>
							)}
						</View>
						{withdrawStep === 1 ? (
							<ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
								<Text style={[styles.sheetSub, { marginBottom: 4 }]}>Số dư: <Text style={{ fontWeight: '800', color: '#8B4513' }}>{Number(user?.balance || 0).toLocaleString('vi-VN')} xu</Text></Text>
								<Text style={[styles.sheetSub, { marginBottom: 4 }]}>Tỷ lệ: 1 xu = 1.000đ</Text>
								<View style={{ gap: 10, marginTop: 8 }}>
									<View>
										<Text style={styles.withdrawLabel}>Số xu muốn rút</Text>
										<TextInput
											style={styles.withdrawInput}
											keyboardType="numeric"
											placeholder="Tối thiểu 10 xu"
											placeholderTextColor="#BBBBBB"
											value={withdrawXu}
											onChangeText={setWithdrawXu}
										/>
									</View>
									{withdrawXu ? (
										<Text style={{ fontSize: 13, color: '#2E7D32', fontWeight: '700' }}>
											= {(parseInt(withdrawXu, 10) * 1000).toLocaleString('vi-VN')}đ
										</Text>
									) : null}
									<View>
										<Text style={styles.withdrawLabel}>Tên ngân hàng</Text>
										<TextInput style={styles.withdrawInput} placeholder="VD: Vietcombank" placeholderTextColor="#BBBBBB" value={withdrawBank} onChangeText={setWithdrawBank} />
									</View>
									<View>
										<Text style={styles.withdrawLabel}>Số tài khoản *</Text>
										<TextInput style={styles.withdrawInput} placeholder="Nhập số tài khoản" placeholderTextColor="#BBBBBB" value={withdrawAccount} onChangeText={setWithdrawAccount} />
									</View>
									<View>
										<Text style={styles.withdrawLabel}>Tên chủ tài khoản</Text>
										<TextInput style={styles.withdrawInput} placeholder="Nhập tên chủ TK" placeholderTextColor="#BBBBBB" value={withdrawOwner} onChangeText={setWithdrawOwner} />
									</View>
								</View>
								<TouchableOpacity
									style={[styles.topupSubmitBtn, { marginTop: 16 }, withdrawLoading && { opacity: 0.6 }]}
									onPress={handleWithdraw} disabled={withdrawLoading}
								>
									{withdrawLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.topupSubmitText}>Gửi yêu cầu rút tiền</Text>}
								</TouchableOpacity>
							</ScrollView>
						) : (
							<View style={styles.waitingBox}>
								<MaterialIcons name="check-circle" size={56} color="#2E7D32" />
								<Text style={styles.waitingTitle}>Yêu cầu đã gửi!</Text>
								<Text style={styles.waitingDesc}>
									Admin sẽ chuyển khoản <Text style={{ fontWeight: '800', color: '#2E7D32' }}>{withdrawResult?.amount_vnd?.toLocaleString('vi-VN')}đ</Text> đến tài khoản của bạn.
								</Text>
								<Text style={styles.waitingHint}>Xu đã được trừ khỏi tài khoản. Bạn sẽ nhận được thông báo khi tiền được chuyển.</Text>
								<TouchableOpacity style={[styles.topupSubmitBtn, { marginTop: 8 }]} onPress={() => setShowWithdraw(false)}>
									<Text style={styles.topupSubmitText}>Đóng</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>
				</View>
			</Modal>

			{/* Modal Nạp Xu */}
			<Modal visible={showTopup} animationType="slide" transparent>
				<View style={styles.overlay}>
					<View style={styles.sheet}>
						<View style={styles.sheetHeader}>
							<Text style={styles.sheetTitle}>
								{topupStep === 1 ? 'Chọn gói nạp xu' : topupStep === 2 ? 'Thông tin chuyển khoản' : 'Đang chờ xác nhận'}
							</Text>
							{topupStep !== 3 && (
								<TouchableOpacity onPress={() => { setShowTopup(false); setTopupStep(1); setSelectedPkg(null); }}>
									<MaterialIcons name="close" size={22} color="#888888" />
								</TouchableOpacity>
							)}
						</View>

						{topupStep === 1 ? (
							<>
								<Text style={styles.sheetSub}>10.000đ = 10 xu • Chọn gói phù hợp</Text>
								<View style={styles.packageRow}>
									{TOPUP_PACKAGES.map(p => (
										<TouchableOpacity
											key={p.vnd}
											style={[styles.packageBtn, selectedPkg?.vnd === p.vnd && styles.packageBtnActive]}
											onPress={() => setSelectedPkg(p)}
										>
											<Text style={[styles.packageBtnText, selectedPkg?.vnd === p.vnd && styles.packageBtnTextActive]}>{p.label}</Text>
											<Text style={[styles.packageBtnXu, selectedPkg?.vnd === p.vnd && { color: '#FFFFFF' }]}>{p.xu} xu</Text>
										</TouchableOpacity>
									))}
								</View>
								<TouchableOpacity
									style={[styles.topupSubmitBtn, !selectedPkg && { opacity: 0.4 }]}
									onPress={() => selectedPkg && setTopupStep(2)}
									disabled={!selectedPkg}
								>
									<Text style={styles.topupSubmitText}>Tiếp theo</Text>
									<MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
								</TouchableOpacity>
							</>
						) : topupStep === 2 ? (
							<>
								<View style={styles.bankCard}>
									{[
										{ label: 'Ngân hàng', value: BANK_INFO.bank },
										{ label: 'Số tài khoản', value: BANK_INFO.account, bold: true },
										{ label: 'Chủ tài khoản', value: BANK_INFO.owner },
										{ label: 'Số tiền', value: selectedPkg?.label, accent: true },
									].map(r => (
										<View key={r.label} style={styles.bankRow}>
											<Text style={styles.bankLabel}>{r.label}</Text>
											<Text style={[styles.bankValue, r.bold && { fontSize: 16 }, r.accent && { color: '#8B4513' }]}>{r.value}</Text>
										</View>
									))}
								</View>
								<View style={styles.transferNoteBox}>
									<Text style={styles.transferNoteLabel}>Nội dung chuyển khoản:</Text>
									<Text style={styles.transferNoteValue}>LUMINA {user?.username?.toUpperCase()} {selectedPkg?.vnd}</Text>
								</View>
								<Text style={styles.transferHint}>Sau khi chuyển khoản xong, ấn xác nhận bên dưới. Admin sẽ kiểm tra và cộng xu cho bạn.</Text>
								<TouchableOpacity
									style={[styles.topupSubmitBtn, topupLoading && { opacity: 0.6 }]}
									onPress={handleTopup}
									disabled={topupLoading}
								>
									{topupLoading
										? <ActivityIndicator color="#fff" size="small" />
										: <Text style={styles.topupSubmitText}>Đã chuyển khoản — Xác nhận</Text>
									}
								</TouchableOpacity>
								<TouchableOpacity style={styles.backStepBtn} onPress={() => setTopupStep(1)}>
									<Text style={styles.backStepText}>Chọn lại gói khác</Text>
								</TouchableOpacity>
							</>
						) : (
							<View style={styles.waitingBox}>
								<ActivityIndicator size="large" color="#8B4513" />
								<Text style={styles.waitingTitle}>Yêu cầu đã được gửi!</Text>
								<Text style={styles.waitingDesc}>
									Admin sẽ kiểm tra chuyển khoản và cộng <Text style={{ fontWeight: '800', color: '#8B4513' }}>{selectedPkg?.xu} xu</Text> vào tài khoản của bạn trong vài phút.
								</Text>
								<Text style={styles.waitingHint}>Bạn sẽ nhận được thông báo khi xu được cộng.</Text>
								<TouchableOpacity
									style={[styles.topupSubmitBtn, { marginTop: 8 }]}
									onPress={() => { setShowTopup(false); setTopupStep(1); setSelectedPkg(null); }}
								>
									<Text style={styles.topupSubmitText}>Đóng</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
	root: { flex: 1, position: "relative" },
	topBar: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
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
	mgmtBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#D32F2F', borderRadius: 999, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
	mgmtBadgeText: { fontSize: 9, color: '#FFFFFF', fontWeight: '700' },
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
	packageBtnXu: { fontSize: 11, color: "#AAAAAA", marginTop: 2 },
	topupSubmitBtn: { backgroundColor: "#8B4513", paddingVertical: 14, borderRadius: 999, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 },
	topupSubmitText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
	bankCard: { backgroundColor: "#F9F6F3", borderRadius: 12, borderWidth: 1, borderColor: "#E8D5C4", padding: 16, gap: 10 },
	bankRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
	bankLabel: { fontSize: 12, color: "#888888" },
	bankValue: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
	transferNoteBox: { backgroundColor: "#FFF8F5", borderRadius: 10, borderWidth: 1, borderColor: "#F2D9C8", padding: 12 },
	transferNoteLabel: { fontSize: 11, color: "#888888", marginBottom: 4 },
	transferNoteValue: { fontSize: 15, fontWeight: "800", color: "#8B4513", letterSpacing: 0.5 },
	transferHint: { fontSize: 12, color: "#888888", lineHeight: 18, textAlign: "center" },
	backStepBtn: { alignItems: "center", paddingVertical: 8 },
	backStepText: { fontSize: 13, color: "#8B4513", fontWeight: "600" },
	waitingBox: { alignItems: "center", gap: 12, paddingVertical: 8 },
	waitingTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A1A" },
	waitingDesc: { fontSize: 14, color: "#444444", lineHeight: 22, textAlign: "center" },
	waitingHint: { fontSize: 12, color: "#AAAAAA", textAlign: "center" },
	withdrawLabel: { fontSize: 12, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
	withdrawInput: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#1A1A1A', borderWidth: 1, borderColor: '#EBEBEB' },
});

export default ProfileScreen;
