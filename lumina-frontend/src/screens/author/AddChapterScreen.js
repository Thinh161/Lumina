import React, { useState } from "react";
import {
	View, Text, TextInput, TouchableOpacity, StyleSheet,
	SafeAreaView, ScrollView, Alert, ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { API_URL } from '../../config/api';

const parseDateInput = (str) => {
	if (!str.trim()) return null;
	// DD/MM/YYYY
	const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
	// YYYY-MM-DD
	if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str;
	return null;
};

const AddChapterScreen = ({ navigation, route }) => {
	const { storyId, storyTitle } = route.params || {};
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [unlockAt, setUnlockAt] = useState('');
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		if (!title.trim() || !content.trim()) {
			Alert.alert("Lỗi", "Vui lòng điền tiêu đề và nội dung.");
			return;
		}
		let unlockDate = null;
		if (unlockAt.trim()) {
			unlockDate = parseDateInput(unlockAt);
			if (!unlockDate) {
				Alert.alert("Lỗi", "Định dạng ngày không hợp lệ. Dùng DD/MM/YYYY hoặc YYYY-MM-DD.");
				return;
			}
		}
		setSaving(true);
		try {
			const res = await fetch(`${API_URL}/stories/${storyId}/chapters`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: title.trim(), content: content.trim(), unlock_at: unlockDate }),
			}).then(r => r.json());

			if (res.status === "success") {
				Alert.alert("Thành công", `Đã thêm Chương ${res.chapter_number}.`, [{ text: "OK", onPress: () => navigation.goBack() }]);
			} else {
				Alert.alert("Lỗi", res.message);
			}
		} catch {
			Alert.alert("Lỗi", "Không thể kết nối server.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<SafeAreaView style={s.safe}>
			<View style={s.topBar}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<MaterialIcons name="arrow-back" size={22} color="#8B4513" />
				</TouchableOpacity>
				<View style={{ flex: 1, marginHorizontal: 12 }}>
					<Text style={s.topBarTitle}>Thêm chương mới</Text>
					<Text style={s.topBarSub} numberOfLines={1}>{storyTitle}</Text>
				</View>
				<TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
					{saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Lưu</Text>}
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={s.content}>
				<View style={s.unlockRow}>
					<MaterialIcons name="schedule" size={18} color="#8B4513" style={{ marginTop: 2 }} />
					<View style={{ flex: 1 }}>
						<Text style={s.label}>Ngày mở khóa</Text>
						<TextInput
							style={s.dateInput}
							value={unlockAt}
							onChangeText={setUnlockAt}
							placeholder="DD/MM/YYYY — để trống nếu luôn công khai"
							placeholderTextColor="#BBBBBB"
							keyboardType="numbers-and-punctuation"
						/>
						<Text style={s.unlockHint}>VIP có thể đọc trước ngày mở khóa</Text>
					</View>
				</View>

				<View style={s.field}>
					<Text style={s.label}>Tiêu đề chương *</Text>
					<TextInput
						style={s.input}
						value={title}
						onChangeText={setTitle}
						placeholder="Tên chương..."
						placeholderTextColor="#BBBBBB"
					/>
				</View>

				<View style={s.field}>
					<Text style={s.label}>Nội dung *</Text>
					<TextInput
						style={[s.input, s.contentInput]}
						value={content}
						onChangeText={setContent}
						placeholder="Viết nội dung chương ở đây..."
						placeholderTextColor="#BBBBBB"
						multiline
						textAlignVertical="top"
					/>
					<Text style={s.charCount}>{content.length} ký tự</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: "#FFFFFF" },
	topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
	topBarTitle: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
	topBarSub: { fontSize: 11, color: "#8B4513" },
	saveBtn: { backgroundColor: "#8B4513", paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999 },
	saveBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
	content: { padding: 16, gap: 16 },
	unlockRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "#F5F0EB", padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#E8D5C4" },
	dateInput: { backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1, borderColor: "#E8D5C4", paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: "#1A1A1A", marginTop: 6 },
	unlockHint: { fontSize: 11, color: "#8B4513", marginTop: 4 },
	field: { gap: 6 },
	label: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
	input: { backgroundColor: "#F5F5F5", borderRadius: 10, borderWidth: 1, borderColor: "#EBEBEB", paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: "#1A1A1A" },
	contentInput: { height: 320, lineHeight: 22 },
	charCount: { fontSize: 11, color: "#BBBBBB", textAlign: "right" },
});

export default AddChapterScreen;
