import React, { useState } from "react";
import {
	View, Text, TextInput, TouchableOpacity, StyleSheet,
	SafeAreaView, ScrollView, Alert, ActivityIndicator, Switch
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const API_URL = 'http://10.106.42.58:5555/api';

const AddChapterScreen = ({ navigation, route }) => {
	const { storyId, storyTitle } = route.params || {};
	const [chapterNumber, setChapterNumber] = useState('');
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [isVip, setIsVip] = useState(false);
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		if (!chapterNumber || !title.trim() || !content.trim()) {
			Alert.alert("Lỗi", "Vui lòng điền đầy đủ số chương, tiêu đề và nội dung.");
			return;
		}
		setSaving(true);
		try {
			const res = await fetch(`${API_URL}/stories/${storyId}/chapters`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chapter_number: parseInt(chapterNumber),
					title: title.trim(),
					content: content.trim(),
					is_vip: isVip,
				}),
			}).then(r => r.json());

			if (res.status === "success") {
				Alert.alert("Thành công", "Đã thêm chương.", [{ text: "OK", onPress: () => navigation.goBack() }]);
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
					<MaterialIcons name="arrow-back" size={22} color="#8c4f3b" />
				</TouchableOpacity>
				<View style={{ flex: 1, marginHorizontal: 12 }}>
					<Text style={s.topBarTitle}>Thêm chương</Text>
					<Text style={s.topBarSub} numberOfLines={1}>{storyTitle}</Text>
				</View>
				<TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
					{saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Lưu</Text>}
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={s.content}>
				<View style={s.row}>
					<View style={[s.field, { flex: 1 }]}>
						<Text style={s.label}>Số chương *</Text>
						<TextInput
							style={s.input}
							value={chapterNumber}
							onChangeText={setChapterNumber}
							placeholder="1"
							placeholderTextColor="#b3b2af"
							keyboardType="number-pad"
						/>
					</View>
					<View style={s.vipToggle}>
						<Text style={s.label}>Chương VIP</Text>
						<Switch
							value={isVip}
							onValueChange={setIsVip}
							trackColor={{ false: "#e4e2df", true: "#dca77c" }}
							thumbColor={isVip ? "#8c4f3b" : "#b3b2af"}
						/>
					</View>
				</View>

				<View style={s.field}>
					<Text style={s.label}>Tiêu đề chương *</Text>
					<TextInput
						style={s.input}
						value={title}
						onChangeText={setTitle}
						placeholder="Tên chương..."
						placeholderTextColor="#b3b2af"
					/>
				</View>

				<View style={s.field}>
					<Text style={s.label}>Nội dung *</Text>
					<TextInput
						style={[s.input, s.contentInput]}
						value={content}
						onChangeText={setContent}
						placeholder="Viết nội dung chương ở đây..."
						placeholderTextColor="#b3b2af"
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
	safe: { flex: 1, backgroundColor: "#fcf9f7" },
	topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(179,178,175,0.2)" },
	topBarTitle: { fontSize: 14, fontWeight: "700", color: "#323331" },
	topBarSub: { fontSize: 11, color: "#8c4f3b" },
	saveBtn: { backgroundColor: "#8c4f3b", paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999 },
	saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
	content: { padding: 16, gap: 16 },
	row: { flexDirection: "row", gap: 12, alignItems: "flex-end" },
	field: { gap: 6 },
	label: { fontSize: 13, fontWeight: "700", color: "#323331" },
	input: { backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "rgba(179,178,175,0.3)", paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: "#323331" },
	contentInput: { height: 320, lineHeight: 22 },
	charCount: { fontSize: 11, color: "#b3b2af", textAlign: "right" },
	vipToggle: { alignItems: "center", gap: 4, paddingBottom: 2 },
});

export default AddChapterScreen;
