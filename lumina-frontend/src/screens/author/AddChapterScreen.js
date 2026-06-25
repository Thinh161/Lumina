import React, { useState, useRef } from "react";
import {
	View, Text, TextInput, TouchableOpacity, StyleSheet,
	SafeAreaView, ScrollView, Alert, ActivityIndicator, Platform
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { addChapter } from "../../redux_thunk/ActorSlice";

const parseDateInput = (str) => {
	if (!str.trim()) return null;
	const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
	if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str;
	return null;
};

const AddChapterScreen = ({ navigation, route }) => {
	const { storyId, storyTitle } = route.params || {};
	const dispatch = useDispatch();
	const { savingChap } = useSelector(s => s.actor);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [unlockAt, setUnlockAt] = useState('');
	const fileInputRef = useRef(null);

	const handlePickFile = () => {
		if (Platform.OS === 'web') fileInputRef.current?.click();
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (evt) => {
			setContent(evt.target.result);
			if (!title.trim()) setTitle(file.name.replace(/\.txt$/i, ''));
		};
		reader.readAsText(file, 'UTF-8');
		e.target.value = '';
	};

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
		try {
			const res = await dispatch(addChapter({
				storyId,
				chapData: { title: title.trim(), content: content.trim(), unlock_at: unlockDate },
			})).unwrap();
			Alert.alert("Thành công", `Đã thêm Chương ${res.chapter_number}.`);
			navigation.goBack();
		} catch (err) {
			Alert.alert("Lỗi", err);
		}
	};

	return (
		<SafeAreaView style={s.safe}>
			{Platform.OS === 'web' && (
				<input type="file" accept=".txt" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
			)}

			<View style={s.topBar}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<MaterialIcons name="arrow-back" size={22} color="#8B4513" />
				</TouchableOpacity>
				<View style={{ flex: 1, marginHorizontal: 12 }}>
					<Text style={s.topBarTitle}>Thêm chương mới</Text>
					<Text style={s.topBarSub} numberOfLines={1}>{storyTitle}</Text>
				</View>
				<TouchableOpacity style={[s.saveBtn, savingChap && { opacity: 0.6 }]} onPress={handleSave} disabled={savingChap}>
					{savingChap ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Lưu</Text>}
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
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
					<View style={s.labelRow}>
						<Text style={s.label}>Nội dung *</Text>
						{Platform.OS === 'web' && (
							<TouchableOpacity style={s.uploadBtn} onPress={handlePickFile}>
								<MaterialIcons name="upload-file" size={15} color="#8B4513" />
								<Text style={s.uploadBtnText}>Upload .txt</Text>
							</TouchableOpacity>
						)}
					</View>
					<TextInput
						style={[s.input, s.contentInput]}
						value={content}
						onChangeText={setContent}
						placeholder="Viết nội dung chương hoặc upload file .txt..."
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
	labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	label: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
	uploadBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F5F0EB", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: "#E8D5C4" },
	uploadBtnText: { fontSize: 12, fontWeight: "600", color: "#8B4513" },
	input: { backgroundColor: "#F5F5F5", borderRadius: 10, borderWidth: 1, borderColor: "#EBEBEB", paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: "#1A1A1A" },
	contentInput: { height: 320, lineHeight: 22 },
	charCount: { fontSize: 11, color: "#BBBBBB", textAlign: "right" },
});

export default AddChapterScreen;
