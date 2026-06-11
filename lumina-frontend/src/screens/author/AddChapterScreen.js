import React, { useState } from "react";
import {
	View, Text, TextInput, TouchableOpacity, StyleSheet,
	SafeAreaView, ScrollView, Alert, ActivityIndicator, Switch
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const API_URL = 'http://192.168.10.104:5555/api';

const AddChapterScreen = ({ navigation, route }) => {
	const { storyId, storyTitle } = route.params || {};
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [isVip, setIsVip] = useState(false);
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		if (!title.trim() || !content.trim()) {
			Alert.alert("Lỗi", "Vui lòng điền tiêu đề và nội dung.");
			return;
		}
		setSaving(true);
		try {
			const res = await fetch(`${API_URL}/stories/${storyId}/chapters`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: title.trim(), content: content.trim(), is_vip: isVip }),
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
				<View style={s.vipRow}>
					<View style={{ flex: 1 }}>
						<Text style={s.label}>Chương VIP</Text>
						<Text style={s.vipSub}>Chỉ thành viên VIP mới đọc được</Text>
					</View>
					<Switch
						value={isVip}
						onValueChange={setIsVip}
						trackColor={{ false: "#EBEBEB", true: "rgba(139,69,19,0.4)" }}
						thumbColor={isVip ? "#8B4513" : "#BBBBBB"}
					/>
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
	vipRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F0EB", padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#E8D5C4" },
	vipSub: { fontSize: 11, color: "#8B4513", marginTop: 2 },
	field: { gap: 6 },
	label: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
	input: { backgroundColor: "#F5F5F5", borderRadius: 10, borderWidth: 1, borderColor: "#EBEBEB", paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: "#1A1A1A" },
	contentInput: { height: 320, lineHeight: 22 },
	charCount: { fontSize: 11, color: "#BBBBBB", textAlign: "right" },
});

export default AddChapterScreen;
