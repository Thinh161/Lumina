import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	View, Text, FlatList, TouchableOpacity, StyleSheet,
	SafeAreaView, Alert, ActivityIndicator, Modal, TextInput, ScrollView, Image, Platform
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import {
	fetchAuthorStories, fetchAuthorStats,
	fetchStoryChapters, fetchChapterForEdit, fetchUnreadCount,
	createStory, updateStory, deleteChapter, updateChapter,
} from "../../redux_thunk/ActorSlice";
import { fetchCategories } from "../../redux_thunk/StorySlice";
import { confirmAlert } from "../../utils/confirmAlert";
const STATUS_COLOR = { published: "#2E7D32", pending: "#E65100", rejected: "#D32F2F" };
const STATUS_LABEL = { published: "Đã duyệt", pending: "Chờ duyệt", rejected: "Bị từ chối" };

const AuthorDashboardScreen = ({ navigation, route }) => {
	const dispatch = useDispatch();
	const { user } = useSelector(s => s.auth);
	const { stories, stats: authorStats, loading, statsLoading, storyChapters, chapLoading, chapContentLoading, submitting, savingChap, unreadCount } = useSelector(s => s.actor);
	const { categories } = useSelector(s => s.story);

	const [activeTab, setActiveTab] = useState('stories');

	// Modal đăng / sửa truyện
	const [showStoryModal, setShowStoryModal] = useState(false);
	const [editingStory, setEditingStory] = useState(null); // null = tạo mới
	const [stTitle, setStTitle] = useState('');
	const [stDesc, setStDesc] = useState('');
	const [stThumb, setStThumb] = useState('');
	const [stCatIds, setStCatIds] = useState([]);
	const [stPriceXu, setStPriceXu] = useState('');
	const [stIsPaid, setStIsPaid] = useState(false);
	// Modal quản lý chương
	const [managingStory, setManagingStory] = useState(null);

	// Modal sửa chương
	const [editingChapter, setEditingChapter] = useState(null);
	const [chapTitle, setChapTitle] = useState('');
	const [chapContent, setChapContent] = useState('');
	const [chapUnlockAt, setChapUnlockAt] = useState('');
	const fileInputRef = useRef(null);

	const loadData = useCallback(() => {
		if (user?.id) {
			dispatch(fetchAuthorStories(user.id));
			dispatch(fetchCategories());
		}
	}, [dispatch, user]);

	useEffect(() => {
		loadData();
		if (user?.id) dispatch(fetchUnreadCount(user.id));
	}, [loadData]);
	useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

	const loadStats = useCallback(() => {
		if (user?.id) {
			dispatch(fetchAuthorStats(user.id));
		}
	}, [dispatch, user]);

	useEffect(() => { if (activeTab === 'income') loadStats(); }, [activeTab, loadStats]);

	const openNewStory = () => {
		setEditingStory(null);
		setStTitle(''); setStDesc(''); setStThumb(''); setStCatIds([]); setStPriceXu(''); setStIsPaid(false);
		setShowStoryModal(true);
	};

	const openEditStory = (story) => {
		setEditingStory(story);
		setStTitle(story.title || '');
		setStDesc(story.description || '');
		setStThumb(story.thumbnail || '');
		setStCatIds(story.category_ids ? story.category_ids.split(',').map(Number) : []);
		const paid = (story.price_xu || 0) > 0;
		setStIsPaid(paid);
		setStPriceXu(paid ? String(story.price_xu) : '');
		setShowStoryModal(true);
	};

	const handleSubmitStory = async () => {
		if (!stTitle.trim() || stCatIds.length === 0) { Alert.alert("Lỗi", "Cần nhập tên và chọn ít nhất 1 thể loại."); return; }
		const priceVal = stIsPaid ? (parseInt(stPriceXu) || 0) : 0;
		if (stIsPaid && priceVal < 100) { Alert.alert("Lỗi", "Giá tối thiểu là 100 xu."); return; }
		try {
			if (editingStory) {
				await dispatch(updateStory({ storyId: editingStory.id, storyData: { title: stTitle, description: stDesc, thumbnail: stThumb, category_ids: stCatIds, price_xu: priceVal } })).unwrap();
			} else {
				await dispatch(createStory({ title: stTitle, description: stDesc, thumbnail: stThumb, author_id: user.id, category_ids: stCatIds, price_xu: priceVal })).unwrap();
			}
			Alert.alert("Thành công", editingStory ? "Đã cập nhật truyện." : "Truyện đang chờ kiểm duyệt.");
			setShowStoryModal(false);
			loadData();
		} catch (err) { Alert.alert("Lỗi", err || "Không thể kết nối."); }
	};

	const openChapterManager = (story) => {
		setManagingStory(story);
		dispatch(fetchStoryChapters(story.id));
	};

	const handleDeleteChapter = (chapter) => {
		confirmAlert("Xóa chương", `Xóa "Chương ${chapter.chapter_number}: ${chapter.title}"?`, async () => {
			try {
				await dispatch(deleteChapter(chapter.id)).unwrap();
				loadData();
			} catch { Alert.alert("Lỗi", "Không thể xóa chương."); }
		}, true);
	};

	const parseDateInput = (str) => {
		if (!str.trim()) return null;
		const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
		if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
		if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str;
		return null;
	};

	const openEditChapter = async (chapter) => {
		setEditingChapter(chapter);
		setChapTitle(chapter.title || '');
		if (chapter.unlock_at) {
			const d = new Date(chapter.unlock_at);
			setChapUnlockAt(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
		} else {
			setChapUnlockAt('');
		}
		setChapContent('');
		try {
			const content = await dispatch(fetchChapterForEdit({ chapterId: chapter.id, userId: user.id })).unwrap();
			setChapContent(content);
		} catch {}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (evt) => setChapContent(evt.target.result);
		reader.readAsText(file, 'UTF-8');
		e.target.value = '';
	};

	const handleSaveChapter = async () => {
		if (!chapTitle.trim() || !chapContent.trim()) { Alert.alert("Lỗi", "Cần điền tiêu đề và nội dung."); return; }
		let unlockDate = null;
		if (chapUnlockAt.trim()) {
			unlockDate = parseDateInput(chapUnlockAt);
			if (!unlockDate) { Alert.alert("Lỗi", "Định dạng ngày không hợp lệ. Dùng DD/MM/YYYY."); return; }
		}
		try {
			await dispatch(updateChapter({ chapterId: editingChapter.id, userId: user.id, chapData: { title: chapTitle, content: chapContent, unlock_at: unlockDate } })).unwrap();
			setEditingChapter(null);
			Alert.alert("Đã lưu", "Chương đã được cập nhật.");
		} catch (err) { Alert.alert("Lỗi", err || "Không thể kết nối."); }
	};

	const renderStory = ({ item }) => (
		<View style={s.card}>
			<View style={s.rowBetween}>
				<Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
				<View style={[s.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
					<Text style={[s.badgeText, { color: STATUS_COLOR[item.status] }]}>{STATUS_LABEL[item.status]}</Text>
				</View>
			</View>
			<Text style={s.cardMeta}>{item.category_names || 'Chưa có thể loại'} • {item.chapter_count} chương</Text>
			{item.status === 'rejected' && item.rejection_reason ? (
				<View style={s.rejectionBox}>
					<MaterialIcons name="info-outline" size={14} color="#D32F2F" />
					<Text style={s.rejectionText} numberOfLines={2}>Lý do: {item.rejection_reason}</Text>
				</View>
			) : null}
			<View style={s.cardActions}>
				<TouchableOpacity style={s.chapBtn} onPress={() => navigation.navigate("AddChapter", { storyId: item.id, storyTitle: item.title })}>
					<MaterialIcons name="add" size={15} color="#8B4513" />
					<Text style={s.chapBtnText}>Thêm chương</Text>
				</TouchableOpacity>
				<TouchableOpacity style={s.manageBtn} onPress={() => openChapterManager(item)}>
					<MaterialIcons name="list" size={15} color="#888888" />
					<Text style={s.manageBtnText}>Quản lý</Text>
				</TouchableOpacity>
				<TouchableOpacity style={s.editBtn} onPress={() => openEditStory(item)}>
					<MaterialIcons name="edit" size={15} color="#888888" />
					<Text style={s.manageBtnText}>Sửa</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={s.safe}>
			<View style={s.header}>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
					{navigation.canGoBack() && (
						<TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
							<MaterialIcons name="arrow-back" size={22} color="#8B4513" />
						</TouchableOpacity>
					)}
					<View>
						<Text style={s.headerTitle}>Quản lý truyện</Text>
						<Text style={s.headerSub}>Xin chào, {user?.full_name || user?.username}</Text>
					</View>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
					<TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate("Notifications")}>
						<MaterialIcons name="notifications" size={22} color="#8B4513" />
						{unreadCount > 0 && (
							<View style={s.badge}>
								<Text style={s.badgeCount}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
							</View>
						)}
					</TouchableOpacity>
					<TouchableOpacity style={s.btn} onPress={openNewStory}>
						<MaterialIcons name="add" size={18} color="#fff" />
						<Text style={s.btnText}>Đăng truyện</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Tab bar */}
			<View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
				{[{ key: 'stories', label: 'Truyện của tôi' }, { key: 'income', label: 'Thu Nhập' }].map(t => (
					<TouchableOpacity
						key={t.key}
						style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === t.key ? '#8B4513' : 'transparent' }}
						onPress={() => setActiveTab(t.key)}
					>
						<Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === t.key ? '#8B4513' : '#888' }}>{t.label}</Text>
					</TouchableOpacity>
				))}
			</View>

			{activeTab === 'stories' ? (
				loading ? <View style={s.center}><ActivityIndicator size="large" color="#8B4513" /></View>
				: stories.length === 0 ? (
					<View style={s.center}>
						<MaterialIcons name="auto-stories" size={52} color="#DDDDDD" />
						<Text style={s.emptyText}>Chưa có truyện nào.</Text>
					</View>
				) : (
					<FlatList data={stories} keyExtractor={i => String(i.id)} renderItem={renderStory} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} />
				)
			) : (
				/* Tab Thu Nhập */
				statsLoading || !authorStats ? <View style={s.center}><ActivityIndicator size="large" color="#8B4513" /></View>
				: <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
					{/* Chính sách doanh thu */}
					<View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFF8E1', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FFE082' }}>
						<MaterialIcons name="info-outline" size={18} color="#E65100" style={{ marginTop: 1 }} />
						<View style={{ flex: 1, gap: 4 }}>
							<Text style={{ fontSize: 13, fontWeight: '700', color: '#E65100' }}>Chính sách doanh thu</Text>
							<Text style={{ fontSize: 12, color: '#5D4037', lineHeight: 18 }}>
								{'• Mua truyện: bạn nhận '}
								<Text style={{ fontWeight: '700' }}>70%</Text>
								{', nền tảng giữ '}
								<Text style={{ fontWeight: '700' }}>30%</Text>
								{'\n• Lượt xem: cứ 100 lượt bạn nhận '}
								<Text style={{ fontWeight: '700' }}>7 xu</Text>
								{', nền tảng nhận 3 xu\n• Phần giữ lại dùng để duy trì và phát triển app'}
							</Text>
						</View>
					</View>

					{/* Tổng quan */}
					<View style={{ flexDirection: 'row', gap: 10 }}>
						{[
							{ label: 'Từ bán truyện', value: `${authorStats.totalEarned || 0} xu`, icon: 'shopping-cart', color: '#2E7D32' },
							{ label: 'Tổng lượt xem', value: String(authorStats.totalViews || 0), icon: 'visibility', color: '#1565C0' },
							{ label: 'Lượt mua', value: String(authorStats.totalPurchases || 0), icon: 'receipt', color: '#E65100' },
						].map(card => (
							<View key={card.label} style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F0F0F0', gap: 4, alignItems: 'center' }}>
								<MaterialIcons name={card.icon} size={20} color={card.color} />
								<Text style={{ fontSize: 15, fontWeight: '800', color: '#1A1A1A' }}>{card.value}</Text>
								<Text style={{ fontSize: 10, color: '#888', textAlign: 'center' }}>{card.label}</Text>
							</View>
						))}
					</View>

					{/* Theo từng truyện */}
					<Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A' }}>Chi tiết từng truyện</Text>
					{(authorStats.storyStats || []).length === 0
						? <Text style={{ color: '#888', fontSize: 13 }}>Chưa có truyện nào.</Text>
						: (authorStats.storyStats || []).map(st => (
							<View key={st.id} style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#F0F0F0', gap: 8 }}>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
									<Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A', flex: 1 }} numberOfLines={1}>{st.title}</Text>
									<View style={{ backgroundColor: st.price_xu > 0 ? '#FFF8E1' : '#F5F5F5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
										<Text style={{ fontSize: 10, fontWeight: '700', color: st.price_xu > 0 ? '#8B4513' : '#888' }}>{st.price_xu > 0 ? `${st.price_xu} xu` : 'Miễn phí'}</Text>
									</View>
								</View>
								<View style={{ flexDirection: 'row', gap: 16 }}>
									<View style={{ alignItems: 'center' }}>
										<Text style={{ fontSize: 14, fontWeight: '800', color: '#1565C0' }}>{st.views || 0}</Text>
										<Text style={{ fontSize: 10, color: '#888' }}>Lượt xem</Text>
									</View>
									<View style={{ alignItems: 'center' }}>
										<Text style={{ fontSize: 14, fontWeight: '800', color: '#E65100' }}>{st.purchase_count || 0}</Text>
										<Text style={{ fontSize: 10, color: '#888' }}>Lượt mua</Text>
									</View>
									<View style={{ alignItems: 'center' }}>
										<Text style={{ fontSize: 14, fontWeight: '800', color: '#2E7D32' }}>{st.earned_from_sales || 0} xu</Text>
										<Text style={{ fontSize: 10, color: '#888' }}>Thu từ bán (70%)</Text>
									</View>
								</View>
							</View>
						))
					}

					{/* Lịch sử rút tiền */}
					<Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A' }}>Lịch sử rút tiền</Text>
					{(authorStats.withdrawHistory || []).length === 0
						? <Text style={{ color: '#888', fontSize: 13 }}>Chưa có lịch sử rút tiền.</Text>
						: (authorStats.withdrawHistory || []).map(w => {
							const statusColor = { pending: '#E65100', approved: '#2E7D32', rejected: '#D32F2F' }[w.status];
							const statusLabel = { pending: 'Đang xử lý', approved: 'Đã chuyển khoản', rejected: 'Bị từ chối' }[w.status];
							return (
								<View key={w.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#F0F0F0' }}>
									<View style={{ gap: 3 }}>
										<Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>{w.amount_xu} xu → {Number(w.amount_vnd).toLocaleString('vi-VN')}đ</Text>
										<Text style={{ fontSize: 11, color: '#888' }}>{w.bank_name} · {w.bank_account}</Text>
										<Text style={{ fontSize: 11, color: '#888' }}>{new Date(w.created_at).toLocaleDateString('vi-VN')}</Text>
									</View>
									<View style={{ backgroundColor: statusColor + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
										<Text style={{ fontSize: 11, fontWeight: '700', color: statusColor }}>{statusLabel}</Text>
									</View>
								</View>
							);
						})
					}
				</ScrollView>
			)}

			{/* Modal đăng / sửa truyện */}
			<Modal visible={showStoryModal} animationType="slide" transparent>
				<View style={s.overlay}>
					<View style={s.sheet}>
						<View style={s.sheetHeader}>
							<Text style={s.sheetTitle}>{editingStory ? "Sửa thông tin truyện" : "Đăng truyện mới"}</Text>
							<TouchableOpacity onPress={() => setShowStoryModal(false)}><MaterialIcons name="close" size={22} color="#888888" /></TouchableOpacity>
						</View>
						<ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
							{[
								{ label: "Tên truyện *", val: stTitle, set: setStTitle, ph: "Tên truyện..." },
								{ label: "URL ảnh bìa", val: stThumb, set: setStThumb, ph: "https://..." },
							].map(f => (
								<View key={f.label} style={s.field}>
									<Text style={s.fieldLabel}>{f.label}</Text>
									<TextInput style={s.input} value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor="#BBBBBB" autoCapitalize="none" />
								</View>
							))}
							{stThumb.length > 0 && (
								<Image source={{ uri: stThumb }} style={{ width: '100%', height: 140, borderRadius: 10, marginBottom: 8, marginTop: -6 }} resizeMode="cover" />
							)}
							<View style={s.field}>
								<Text style={s.fieldLabel}>Mô tả</Text>
								<TextInput style={[s.input, { height: 80 }]} value={stDesc} onChangeText={setStDesc} placeholder="Tóm tắt nội dung..." placeholderTextColor="#BBBBBB" multiline />
							</View>
							<View style={s.field}>
								<Text style={s.fieldLabel}>Loại truyện</Text>
								<View style={{ flexDirection: 'row', gap: 8 }}>
									<TouchableOpacity
										style={[s.chip, !stIsPaid && s.chipActive]}
										onPress={() => { setStIsPaid(false); setStPriceXu(''); }}
									>
										<Text style={[s.chipText, !stIsPaid && s.chipTextActive]}>Miễn phí</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[s.chip, stIsPaid && s.chipActive]}
										onPress={() => setStIsPaid(true)}
									>
										<Text style={[s.chipText, stIsPaid && s.chipTextActive]}>Trả phí</Text>
									</TouchableOpacity>
								</View>
								{stIsPaid && (
									<>
										<TextInput
											style={[s.input, { marginTop: 8 }, (parseInt(stPriceXu) > 0 && parseInt(stPriceXu) < 100) && { borderColor: '#D32F2F' }]}
											value={stPriceXu} onChangeText={setStPriceXu}
											placeholder="Nhập giá (tối thiểu 100 xu)" placeholderTextColor="#BBBBBB" keyboardType="numeric"
										/>
										{parseInt(stPriceXu) > 0 && parseInt(stPriceXu) < 100 && (
											<Text style={{ color: '#D32F2F', fontSize: 11, marginTop: 2 }}>Tối thiểu 100 xu</Text>
										)}
										<View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#FFF8E1', borderRadius: 8, padding: 10, marginTop: 8 }}>
											<MaterialIcons name="info-outline" size={14} color="#E65100" style={{ marginTop: 1 }} />
											<Text style={{ fontSize: 11, color: '#E65100', flex: 1, lineHeight: 16 }}>
												Nền tảng giữ lại <Text style={{ fontWeight: '700' }}>30%</Text> doanh thu để duy trì app. Bạn nhận <Text style={{ fontWeight: '700' }}>70%</Text> trên mỗi lượt mua.
												{parseInt(stPriceXu) >= 100 ? `\nVí dụ: ${stPriceXu} xu → bạn nhận ${Math.floor(parseInt(stPriceXu) * 0.7)} xu.` : ''}
											</Text>
										</View>
									</>
								)}
							</View>
							<View style={s.field}>
								<Text style={s.fieldLabel}>Thể loại *</Text>
								<View style={s.chips}>
									{categories.map(c => {
										const active = stCatIds.includes(c.id);
										return (
											<TouchableOpacity
												key={c.id}
												style={[s.chip, active && s.chipActive]}
												onPress={() => setStCatIds(prev => active ? prev.filter(id => id !== c.id) : [...prev, c.id])}
											>
												<Text style={[s.chipText, active && s.chipTextActive]}>{c.name}</Text>
											</TouchableOpacity>
										);
									})}
								</View>
							</View>
							<TouchableOpacity style={[s.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmitStory} disabled={submitting}>
								{submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.submitText}>{editingStory ? "Lưu thay đổi" : "Gửi kiểm duyệt"}</Text>}
							</TouchableOpacity>
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* Modal quản lý chương */}
			<Modal visible={!!managingStory && !editingChapter} animationType="slide" transparent>
				<View style={s.overlay}>
					<View style={s.sheet}>
						<View style={s.sheetHeader}>
							<View style={{ flex: 1 }}>
								<Text style={s.sheetTitle}>Danh sách chương</Text>
								{managingStory && <Text style={{ fontSize: 12, color: "#888888", marginTop: 2 }} numberOfLines={1}>{managingStory.title}</Text>}
							</View>
							<TouchableOpacity onPress={() => setManagingStory(null)}><MaterialIcons name="close" size={22} color="#888888" /></TouchableOpacity>
						</View>
						{chapLoading ? (
							<View style={{ paddingVertical: 32, alignItems: "center" }}><ActivityIndicator color="#8B4513" /></View>
						) : storyChapters.length === 0 ? (
							<View style={{ paddingVertical: 32, alignItems: "center", gap: 8 }}>
								<MaterialIcons name="menu-book" size={40} color="#DDDDDD" />
								<Text style={{ color: "#888888", fontSize: 14 }}>Chưa có chương nào.</Text>
							</View>
						) : (
							<ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
								{storyChapters.map(chap => (
									<View key={chap.id} style={s.chapRow}>
										<View style={{ flex: 1 }}>
											<Text style={s.chapRowTitle}>Chương {chap.chapter_number}: {chap.title}</Text>
											{chap.unlock_at && new Date(chap.unlock_at) > new Date()
												? <Text style={s.chapVipBadge}>
													Mở khóa {new Date(chap.unlock_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
												</Text>
												: null
											}
										</View>
										<TouchableOpacity style={s.iconBtn} onPress={() => openEditChapter(chap)}>
											<MaterialIcons name="edit" size={18} color="#8B4513" />
										</TouchableOpacity>
										<TouchableOpacity style={s.iconBtn} onPress={() => handleDeleteChapter(chap)}>
											<MaterialIcons name="delete-outline" size={18} color="#D32F2F" />
										</TouchableOpacity>
									</View>
								))}
							</ScrollView>
						)}
						<TouchableOpacity style={[s.submitBtn, { marginTop: 12 }]} onPress={() => {
							setManagingStory(null);
							navigation.navigate("AddChapter", { storyId: managingStory?.id, storyTitle: managingStory?.title });
						}}>
							<MaterialIcons name="add" size={16} color="#fff" />
							<Text style={s.submitText}>Thêm chương mới</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{Platform.OS === 'web' && (
				<input type="file" accept=".txt" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
			)}

			{/* Modal sửa chương */}
			<Modal visible={!!editingChapter} animationType="slide" transparent>
				<View style={s.overlay}>
					<View style={[s.sheet, { maxHeight: "92%" }]}>
						<View style={s.sheetHeader}>
							<Text style={s.sheetTitle}>Sửa chương {editingChapter?.chapter_number}</Text>
							<TouchableOpacity onPress={() => setEditingChapter(null)}><MaterialIcons name="close" size={22} color="#888888" /></TouchableOpacity>
						</View>
						<ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
							<View style={s.field}>
								<Text style={s.fieldLabel}>Tiêu đề *</Text>
								<TextInput style={s.input} value={chapTitle} onChangeText={setChapTitle} placeholder="Tên chương..." placeholderTextColor="#BBBBBB" />
							</View>
							<View style={s.field}>
								<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
									<Text style={s.fieldLabel}>Nội dung *</Text>
									{Platform.OS === 'web' && (
										<TouchableOpacity
											style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F0EB', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#E8D5C4' }}
											onPress={() => fileInputRef.current?.click()}
										>
											<MaterialIcons name="upload-file" size={15} color="#8B4513" />
											<Text style={{ fontSize: 12, fontWeight: '600', color: '#8B4513' }}>Upload .txt</Text>
										</TouchableOpacity>
									)}
								</View>
								{chapContentLoading ? (
									<View style={{ paddingVertical: 20, alignItems: "center" }}>
										<ActivityIndicator color="#8B4513" />
										<Text style={{ fontSize: 12, color: "#888888", marginTop: 6 }}>Đang tải nội dung...</Text>
									</View>
								) : (
									<>
										<TextInput style={[s.input, { height: 260 }]} value={chapContent} onChangeText={setChapContent} placeholder="Nội dung chương..." placeholderTextColor="#BBBBBB" multiline textAlignVertical="top" />
										<Text style={{ fontSize: 11, color: "#BBBBBB", textAlign: "right", marginTop: 4 }}>{chapContent.length} ký tự</Text>
									</>
								)}
							</View>
							<View style={s.field}>
								<Text style={s.fieldLabel}>Ngày mở khóa</Text>
								<TextInput
									style={s.input}
									value={chapUnlockAt}
									onChangeText={setChapUnlockAt}
									placeholder="DD/MM/YYYY — để trống nếu luôn công khai"
									placeholderTextColor="#BBBBBB"
									keyboardType="numbers-and-punctuation"
								/>
								<Text style={{ fontSize: 11, color: "#8B4513", marginTop: 4 }}>VIP có thể đọc trước ngày mở khóa</Text>
							</View>
							<TouchableOpacity style={[s.submitBtn, savingChap && { opacity: 0.6 }]} onPress={handleSaveChapter} disabled={savingChap}>
								{savingChap ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.submitText}>Lưu thay đổi</Text>}
							</TouchableOpacity>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: "#FFFFFF" },
	header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
	headerTitle: { fontSize: 20, fontWeight: "800", color: "#1A1A1A" },
	headerSub: { fontSize: 12, color: "#888888", marginTop: 2 },
	btn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#8B4513", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
	btnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
	center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
	emptyText: { fontSize: 14, color: "#888888" },
	card: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#F0F0F0" },
	rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 },
	cardTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A", flex: 1 },
	statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
	badgeText: { fontSize: 10, fontWeight: "700" },
	cardMeta: { fontSize: 12, color: "#888888", marginBottom: 8 },
	rejectionBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: "#FFF0F0", borderRadius: 8, padding: 8, marginBottom: 8 },
	rejectionText: { flex: 1, fontSize: 12, color: "#D32F2F" },
	cardActions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
	chapBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#EBEBEB", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#F5F5F5" },
	chapBtnText: { fontSize: 12, color: "#8B4513", fontWeight: "600" },
	manageBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#EBEBEB", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#F5F5F5" },
	editBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#EBEBEB", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#F5F5F5" },
	manageBtnText: { fontSize: 12, color: "#888888", fontWeight: "600" },
	overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
	sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "85%" },
	sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
	sheetTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
	field: { marginBottom: 14 },
	fieldLabel: { fontSize: 13, fontWeight: "700", color: "#1A1A1A", marginBottom: 6 },
	input: { backgroundColor: "#F5F5F5", borderRadius: 10, borderWidth: 1, borderColor: "#EBEBEB", paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#1A1A1A" },
	chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "#EBEBEB", backgroundColor: "#F5F5F5" },
	chipActive: { backgroundColor: "#8B4513", borderColor: "#8B4513" },
	chipText: { fontSize: 12, color: "#888888", fontWeight: "600" },
	chipTextActive: { color: "#FFFFFF" },
	submitBtn: { backgroundColor: "#8B4513", paddingVertical: 14, borderRadius: 999, alignItems: "center", marginTop: 8, flexDirection: "row", justifyContent: "center", gap: 6 },
	submitText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
	chapRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
	chapRowTitle: { fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
	chapVipBadge: { fontSize: 10, color: "#8B4513", fontWeight: "700", marginTop: 2 },
	iconBtn: { padding: 8 },
	bellBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
	badge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#D32F2F', borderRadius: 999, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
	badgeCount: { fontSize: 9, color: '#FFFFFF', fontWeight: '700' },
});

export default AuthorDashboardScreen;
