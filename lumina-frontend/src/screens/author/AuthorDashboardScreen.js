import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	View, Text, FlatList, TouchableOpacity, StyleSheet,
	SafeAreaView, Alert, ActivityIndicator, Modal, TextInput, ScrollView, Image, Platform
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { confirmAlert } from "../../utils/confirmAlert";

import { API_URL } from '../../config/api';
const STATUS_COLOR = { published: "#2E7D32", pending: "#E65100", rejected: "#D32F2F" };
const STATUS_LABEL = { published: "Đã duyệt", pending: "Chờ duyệt", rejected: "Bị từ chối" };

const AuthorDashboardScreen = ({ navigation, route }) => {
	const { user } = useSelector(s => s.auth);
	const [stories, setStories] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);

	// Modal đăng / sửa truyện
	const [showStoryModal, setShowStoryModal] = useState(false);
	const [editingStory, setEditingStory] = useState(null); // null = tạo mới
	const [stTitle, setStTitle] = useState('');
	const [stDesc, setStDesc] = useState('');
	const [stThumb, setStThumb] = useState('');
	const [stCatId, setStCatId] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	// Modal quản lý chương
	const [managingStory, setManagingStory] = useState(null);
	const [storyChapters, setStoryChapters] = useState([]);
	const [chapLoading, setChapLoading] = useState(false);

	// Modal sửa chương
	const [editingChapter, setEditingChapter] = useState(null);
	const [chapTitle, setChapTitle] = useState('');
	const [chapContent, setChapContent] = useState('');
	const [chapUnlockAt, setChapUnlockAt] = useState('');
	const [savingChap, setSavingChap] = useState(false);
	const [chapContentLoading, setChapContentLoading] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const fileInputRef = useRef(null);

	const loadUnreadCount = useCallback(async () => {
		if (!user) return;
		try {
			const res = await fetch(`${API_URL}/notifications/${user.id}/unread-count`).then(r => r.json());
			setUnreadCount(res.count || 0);
		} catch {}
	}, [user]);

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const [sr, cr] = await Promise.all([
				fetch(`${API_URL}/author/stories/${user.id}`).then(r => r.json()),
				fetch(`${API_URL}/categories`).then(r => r.json()),
			]);
			setStories(sr.data || []);
			setCategories(cr.data || []);
		} finally { setLoading(false); }
	}, [user]);

	useEffect(() => { loadData(); loadUnreadCount(); }, [loadData, loadUnreadCount]);
	useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

	const openNewStory = () => {
		setEditingStory(null);
		setStTitle(''); setStDesc(''); setStThumb(''); setStCatId(null);
		setShowStoryModal(true);
	};

	const openEditStory = (story) => {
		setEditingStory(story);
		setStTitle(story.title || '');
		setStDesc(story.description || '');
		setStThumb(story.thumbnail || '');
		setStCatId(story.category_id || null);
		setShowStoryModal(true);
	};

	const handleSubmitStory = async () => {
		if (!stTitle.trim() || !stCatId) { Alert.alert("Lỗi", "Cần nhập tên và chọn thể loại."); return; }
		setSubmitting(true);
		try {
			let res;
			if (editingStory) {
				res = await fetch(`${API_URL}/stories/${editingStory.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ title: stTitle, description: stDesc, thumbnail: stThumb, category_id: stCatId }),
				}).then(r => r.json());
			} else {
				res = await fetch(`${API_URL}/stories`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ title: stTitle, description: stDesc, thumbnail: stThumb, author_id: user.id, category_id: stCatId }),
				}).then(r => r.json());
			}
			if (res.status === "success") {
				Alert.alert("Thành công", editingStory ? "Đã cập nhật truyện." : "Truyện đang chờ kiểm duyệt.");
				setShowStoryModal(false);
				loadData();
			} else Alert.alert("Lỗi", res.message);
		} catch { Alert.alert("Lỗi", "Không thể kết nối."); } finally { setSubmitting(false); }
	};

	const openChapterManager = async (story) => {
		setManagingStory(story);
		setChapLoading(true);
		try {
			const res = await fetch(`${API_URL}/stories/${story.id}/chapters`).then(r => r.json());
			setStoryChapters(res.data || []);
		} finally { setChapLoading(false); }
	};

	const handleDeleteChapter = (chapter) => {
		confirmAlert("Xóa chương", `Xóa "Chương ${chapter.chapter_number}: ${chapter.title}"?`, async () => {
			try {
				await fetch(`${API_URL}/chapters/${chapter.id}`, { method: 'DELETE' });
				setStoryChapters(prev => prev.filter(c => c.id !== chapter.id));
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
		// Hiển thị unlock_at theo DD/MM/YYYY nếu có
		if (chapter.unlock_at) {
			const d = new Date(chapter.unlock_at);
			setChapUnlockAt(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
		} else {
			setChapUnlockAt('');
		}
		setChapContent('');
		setChapContentLoading(true);
		try {
			const res = await fetch(`${API_URL}/chapters/${chapter.id}?user_id=${user.id}`).then(r => r.json());
			if (res.status === 'success') setChapContent(res.data.content || '');
		} catch {} finally { setChapContentLoading(false); }
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
		setSavingChap(true);
		try {
			const res = await fetch(`${API_URL}/chapters/${editingChapter.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: chapTitle, content: chapContent, unlock_at: unlockDate }),
			}).then(r => r.json());
			if (res.status === "success") {
				const newUnlockAt = chapUnlockAt.trim() ? parseDateInput(chapUnlockAt) : null;
				setStoryChapters(prev => prev.map(c => c.id === editingChapter.id ? { ...c, title: chapTitle, unlock_at: newUnlockAt } : c));
				setEditingChapter(null);
				Alert.alert("Đã lưu", "Chương đã được cập nhật.");
			} else Alert.alert("Lỗi", res.message);
		} catch { Alert.alert("Lỗi", "Không thể kết nối."); } finally { setSavingChap(false); }
	};

	const renderStory = ({ item }) => (
		<View style={s.card}>
			<View style={s.rowBetween}>
				<Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
				<View style={[s.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
					<Text style={[s.badgeText, { color: STATUS_COLOR[item.status] }]}>{STATUS_LABEL[item.status]}</Text>
				</View>
			</View>
			<Text style={s.cardMeta}>{item.category_name} • {item.chapter_count} chương</Text>
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
					<TouchableOpacity style={s.bellBtn} onPress={() => { setUnreadCount(0); navigation.navigate("Notifications"); }}>
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

			{loading ? <View style={s.center}><ActivityIndicator size="large" color="#8B4513" /></View>
				: stories.length === 0 ? (
					<View style={s.center}>
						<MaterialIcons name="auto-stories" size={52} color="#DDDDDD" />
						<Text style={s.emptyText}>Chưa có truyện nào.</Text>
					</View>
				) : (
					<FlatList data={stories} keyExtractor={i => String(i.id)} renderItem={renderStory} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} />
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
								<Text style={s.fieldLabel}>Thể loại *</Text>
								<View style={s.chips}>
									{categories.map(c => (
										<TouchableOpacity key={c.id} style={[s.chip, stCatId === c.id && s.chipActive]} onPress={() => setStCatId(c.id)}>
											<Text style={[s.chipText, stCatId === c.id && s.chipTextActive]}>{c.name}</Text>
										</TouchableOpacity>
									))}
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
