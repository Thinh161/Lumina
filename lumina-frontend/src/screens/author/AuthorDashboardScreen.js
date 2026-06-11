import React, { useState, useEffect, useCallback } from "react";
import {
	View, Text, FlatList, TouchableOpacity, StyleSheet,
	SafeAreaView, Alert, ActivityIndicator, Modal, TextInput, ScrollView
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

const API_URL = 'http://10.106.42.58:5555/api';
const STATUS_COLOR = { published: "#2e7d32", pending: "#e65100", rejected: "#c62828" };
const STATUS_LABEL = { published: "Đã duyệt", pending: "Chờ duyệt", rejected: "Bị từ chối" };

const AuthorDashboardScreen = ({ navigation }) => {
	const { user } = useSelector(s => s.auth);
	const [stories, setStories] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [thumbnail, setThumbnail] = useState('');
	const [categoryId, setCategoryId] = useState(null);
	const [submitting, setSubmitting] = useState(false);

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

	const renderStory = ({ item }) => (
		<View style={s.card}>
			<View style={s.rowBetween}>
				<Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
				<View style={[s.badge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
					<Text style={[s.badgeText, { color: STATUS_COLOR[item.status] }]}>{STATUS_LABEL[item.status]}</Text>
				</View>
			</View>
			<Text style={s.cardMeta}>{item.category_name} • {item.chapter_count} chương</Text>
			<TouchableOpacity style={s.chapBtn} onPress={() => navigation.navigate("AddChapter", { storyId: item.id, storyTitle: item.title })}>
				<MaterialIcons name="add" size={15} color="#8c4f3b" />
				<Text style={s.chapBtnText}>Thêm chương</Text>
			</TouchableOpacity>
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

			{loading ? <View style={s.center}><ActivityIndicator size="large" color="#dca77c" /></View>
				: stories.length === 0 ? (
					<View style={s.center}>
						<MaterialIcons name="auto-stories" size={52} color="#dca77c" />
						<Text style={s.emptyText}>Chưa có truyện nào.</Text>
					</View>
				) : (
					<FlatList data={stories} keyExtractor={i => String(i.id)} renderItem={renderStory} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} />
				)}

			<Modal visible={showModal} animationType="slide" transparent>
				<View style={s.overlay}>
					<View style={s.sheet}>
						<View style={s.sheetHeader}>
							<Text style={s.sheetTitle}>Đăng truyện mới</Text>
							<TouchableOpacity onPress={() => setShowModal(false)}><MaterialIcons name="close" size={22} color="#5f5f5d" /></TouchableOpacity>
						</View>
						<ScrollView showsVerticalScrollIndicator={false}>
							{[
								{ label: "Tên truyện *", val: title, set: setTitle, ph: "Tên truyện..." },
								{ label: "URL ảnh bìa", val: thumbnail, set: setThumbnail, ph: "https://..." },
							].map(f => (
								<View key={f.label} style={s.field}>
									<Text style={s.fieldLabel}>{f.label}</Text>
									<TextInput style={s.input} value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor="#b3b2af" autoCapitalize="none" />
								</View>
							))}
							<View style={s.field}>
								<Text style={s.fieldLabel}>Mô tả</Text>
								<TextInput style={[s.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="Tóm tắt nội dung..." placeholderTextColor="#b3b2af" multiline />
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
		</SafeAreaView>
	);
};

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: "#fcf9f7" },
	header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
	headerTitle: { fontSize: 20, fontWeight: "800", color: "#323331" },
	headerSub: { fontSize: 12, color: "#5f5f5d", marginTop: 2 },
	btn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#8c4f3b", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
	btnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
	center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
	emptyText: { fontSize: 14, color: "#5f5f5d" },
	card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "rgba(179,178,175,0.2)", elevation: 2 },
	rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 },
	cardTitle: { fontSize: 15, fontWeight: "700", color: "#323331", flex: 1 },
	badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
	badgeText: { fontSize: 10, fontWeight: "700" },
	cardMeta: { fontSize: 12, color: "#8c4f3b", marginBottom: 10 },
	chapBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "rgba(140,79,59,0.3)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" },
	chapBtnText: { fontSize: 12, color: "#8c4f3b", fontWeight: "600" },
	overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
	sheet: { backgroundColor: "#fcf9f7", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "85%" },
	sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
	sheetTitle: { fontSize: 18, fontWeight: "700", color: "#323331" },
	field: { marginBottom: 14 },
	fieldLabel: { fontSize: 13, fontWeight: "700", color: "#323331", marginBottom: 6 },
	input: { backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "rgba(179,178,175,0.3)", paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#323331" },
	chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(140,79,59,0.3)", backgroundColor: "#fff" },
	chipActive: { backgroundColor: "#8c4f3b", borderColor: "#8c4f3b" },
	chipText: { fontSize: 12, color: "#8c4f3b", fontWeight: "600" },
	chipTextActive: { color: "#fff" },
	submitBtn: { backgroundColor: "#8c4f3b", paddingVertical: 14, borderRadius: 999, alignItems: "center", marginTop: 8 },
	submitText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});

export default AuthorDashboardScreen;
