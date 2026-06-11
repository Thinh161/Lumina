import React, { useState, useEffect, useCallback } from "react";
import {
	View, Text, FlatList, TouchableOpacity, StyleSheet,
	SafeAreaView, Alert, ActivityIndicator, Modal, TextInput, ScrollView
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

const API_URL = 'http://192.168.10.104:5555/api';
const STATUS_COLOR = { published: "#2e7d32", pending: "#e65100", rejected: "#c62828" };
const STATUS_LABEL = { published: "Đã duyệt", pending: "Chờ duyệt", rejected: "Bị từ chối" };

const AuthorDashboardScreen = ({ navigation }) => {
	const { user } = useSelector(s => s.auth);
	const [stories, setStories] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	// Modal đăng truyện mới
	const [showModal, setShowModal] = useState(false);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [thumbnail, setThumbnail] = useState('');
	const [categoryId, setCategoryId] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	// Modal quản lý chương
	const [managingStory, setManagingStory] = useState(null);
	const [storyChapters, setStoryChapters] = useState([]);
	const [chapLoading, setChapLoading] = useState(false);

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const [sr, cr] = await Promise.all([
				fetch(`${API_URL}/author/stories/${user.id}`).then(r => r.json()),
				fetch(`${API_URL}/categories`).then(r => r.json()),
			]);
			setStories(sr.data || []);
			setCategories(cr.data || []);
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => { loadData(); }, [loadData]);

	const handleSubmit = async () => {
		if (!title.trim() || !categoryId) { Alert.alert("Lỗi", "Cần nhập tên và chọn thể loại."); return; }
		setSubmitting(true);
		try {
			const res = await fetch(`${API_URL}/stories`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title, description, thumbnail, author_id: user.id, category_id: categoryId }),
			}).then(r => r.json());
			if (res.status === "success") {
				Alert.alert("Đã gửi", "Truyện đang chờ kiểm duyệt.");
				setShowModal(false); setTitle(''); setDescription(''); setThumbnail(''); setCategoryId(null);
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
		} finally {
			setChapLoading(false);
		}
	};

	const handleDeleteChapter = (chapter) => {
		Alert.alert(
			"Xóa chương",
			`Xóa "Chương ${chapter.chapter_number}: ${chapter.title}"?`,
			[
				{ text: "Hủy", style: "cancel" },
				{
					text: "Xóa", style: "destructive",
					onPress: async () => {
						try {
							await fetch(`${API_URL}/chapters/${chapter.id}`, { method: 'DELETE' });
							setStoryChapters(prev => prev.filter(c => c.id !== chapter.id));
							loadData();
						} catch { Alert.alert("Lỗi", "Không thể xóa chương."); }
					}
				}
			]
		);
	};

	const renderStory = ({ item }) => (
		<View style={s.card}>
			<View style={s.rowBetween}>
				<Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
				<View style={[s.badge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
					<Text style={[s.badgeText, { color: STATUS_COLOR[item.status] }]}>{STATUS_LABEL[item.status]}</Text>
				</View>
			</View>
			<Text style={s.cardMeta}>{item.category_name} • {item.chapter_count} chương</Text>
			<View style={s.cardActions}>
				<TouchableOpacity style={s.chapBtn} onPress={() => navigation.navigate("AddChapter", { storyId: item.id, storyTitle: item.title })}>
					<MaterialIcons name="add" size={15} color="#8B4513" />
					<Text style={s.chapBtnText}>Thêm chương</Text>
				</TouchableOpacity>
				<TouchableOpacity style={s.manageBtn} onPress={() => openChapterManager(item)}>
					<MaterialIcons name="list" size={15} color="#888888" />
					<Text style={s.manageBtnText}>Quản lý chương</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={s.safe}>
			<View style={s.header}>
				<View>
					<Text style={s.headerTitle}>Quản lý truyện</Text>
					<Text style={s.headerSub}>Xin chào, {user?.full_name || user?.username}</Text>
				</View>
				<TouchableOpacity style={s.btn} onPress={() => setShowModal(true)}>
					<MaterialIcons name="add" size={18} color="#fff" />
					<Text style={s.btnText}>Đăng truyện</Text>
				</TouchableOpacity>
			</View>

			{loading ? <View style={s.center}><ActivityIndicator size="large" color="#8B4513" /></View>
				: stories.length === 0 ? (
					<View style={s.center}>
						<MaterialIcons name="auto-stories" size={52} color="#8B4513" />
						<Text style={s.emptyText}>Chưa có truyện nào.</Text>
					</View>
				) : (
					<FlatList data={stories} keyExtractor={i => String(i.id)} renderItem={renderStory} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} />
				)}

			{/* Modal đăng truyện mới */}
			<Modal visible={showModal} animationType="slide" transparent>
				<View style={s.overlay}>
					<View style={s.sheet}>
						<View style={s.sheetHeader}>
							<Text style={s.sheetTitle}>Đăng truyện mới</Text>
							<TouchableOpacity onPress={() => setShowModal(false)}><MaterialIcons name="close" size={22} color="#888888" /></TouchableOpacity>
						</View>
						<ScrollView showsVerticalScrollIndicator={false}>
							{[
								{ label: "Tên truyện *", val: title, set: setTitle, ph: "Tên truyện..." },
								{ label: "URL ảnh bìa", val: thumbnail, set: setThumbnail, ph: "https://..." },
							].map(f => (
								<View key={f.label} style={s.field}>
									<Text style={s.fieldLabel}>{f.label}</Text>
									<TextInput style={s.input} value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor="#BBBBBB" autoCapitalize="none" />
								</View>
							))}
							<View style={s.field}>
								<Text style={s.fieldLabel}>Mô tả</Text>
								<TextInput style={[s.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="Tóm tắt nội dung..." placeholderTextColor="#BBBBBB" multiline />
							</View>
							<View style={s.field}>
								<Text style={s.fieldLabel}>Thể loại *</Text>
								<View style={s.chips}>
									{categories.map(c => (
										<TouchableOpacity key={c.id} style={[s.chip, categoryId === c.id && s.chipActive]} onPress={() => setCategoryId(c.id)}>
											<Text style={[s.chipText, categoryId === c.id && s.chipTextActive]}>{c.name}</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>
							<TouchableOpacity style={[s.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
								{submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.submitText}>Gửi kiểm duyệt</Text>}
							</TouchableOpacity>
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* Modal quản lý chương */}
			<Modal visible={!!managingStory} animationType="slide" transparent>
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
							<ScrollView showsVerticalScrollIndicator={false}>
								{storyChapters.map(chap => (
									<View key={chap.id} style={s.chapRow}>
										<View style={{ flex: 1 }}>
											<Text style={s.chapRowTitle}>Chương {chap.chapter_number}: {chap.title}</Text>
											{chap.is_vip ? (
												<Text style={s.chapVipBadge}>VIP</Text>
											) : null}
										</View>
										<TouchableOpacity style={s.deleteChapBtn} onPress={() => handleDeleteChapter(chap)}>
											<MaterialIcons name="delete-outline" size={20} color="#D32F2F" />
										</TouchableOpacity>
									</View>
								))}
							</ScrollView>
						)}
						<TouchableOpacity
							style={[s.submitBtn, { marginTop: 12 }]}
							onPress={() => {
								setManagingStory(null);
								navigation.navigate("AddChapter", { storyId: managingStory?.id, storyTitle: managingStory?.title });
							}}
						>
							<MaterialIcons name="add" size={16} color="#fff" />
							<Text style={s.submitText}>Thêm chương mới</Text>
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
	headerTitle: { fontSize: 20, fontWeight: "800", color: "#1A1A1A" },
	headerSub: { fontSize: 12, color: "#888888", marginTop: 2 },
	btn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#8B4513", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
	btnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
	center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
	emptyText: { fontSize: 14, color: "#888888" },
	card: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#F0F0F0" },
	rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 },
	cardTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A", flex: 1 },
	badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
	badgeText: { fontSize: 10, fontWeight: "700" },
	cardMeta: { fontSize: 12, color: "#888888", marginBottom: 10 },
	cardActions: { flexDirection: "row", gap: 8 },
	chapBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#EBEBEB", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#F5F5F5" },
	chapBtnText: { fontSize: 12, color: "#8B4513", fontWeight: "600" },
	manageBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#EBEBEB", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#F5F5F5" },
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
	deleteChapBtn: { padding: 6 },
});

export default AuthorDashboardScreen;
