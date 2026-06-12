import React, { useState } from "react";
import {
	View, Text, TextInput, TouchableOpacity, StyleSheet,
	SafeAreaView, ScrollView, Image, Alert, ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../../redux_thunk/AuthSlice";

import { API_URL } from '../../config/api';
const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=3";

const EditProfileScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { user } = useSelector(state => state.auth);

	const [fullName, setFullName] = useState(user?.full_name || '');
	const [avatar, setAvatar] = useState(user?.avatar || '');
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		if (!fullName.trim()) {
			Alert.alert("Lỗi", "Tên không được để trống.");
			return;
		}
		setSaving(true);
		try {
			const res = await fetch(`${API_URL}/users/${user.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ full_name: fullName.trim(), avatar: avatar.trim() || user?.avatar }),
			}).then(r => r.json());

			if (res.status === "success") {
				await dispatch(fetchUserProfile(user.id));
				Alert.alert("Thành công", "Đã cập nhật hồ sơ.", [{ text: "OK", onPress: () => navigation.goBack() }]);
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
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.topBar}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<MaterialIcons name="arrow-back" size={22} color="#8B4513" />
				</TouchableOpacity>
				<Text style={styles.topBarTitle}>Chỉnh sửa hồ sơ</Text>
				<View style={{ width: 22 }} />
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.avatarSection}>
					<Image
						source={{ uri: avatar || user?.avatar || DEFAULT_AVATAR }}
						style={styles.avatar}
					/>
					<Text style={styles.avatarHint}>URL ảnh đại diện</Text>
					<TextInput
						style={styles.input}
						placeholder="https://..."
						placeholderTextColor="#BBBBBB"
						value={avatar}
						onChangeText={setAvatar}
						autoCapitalize="none"
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Tên hiển thị</Text>
					<TextInput
						style={styles.input}
						placeholder="Nhập tên của bạn"
						placeholderTextColor="#BBBBBB"
						value={fullName}
						onChangeText={setFullName}
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Tên đăng nhập</Text>
					<View style={styles.inputDisabled}>
						<Text style={styles.inputDisabledText}>{user?.username}</Text>
					</View>
					<Text style={styles.hint}>Tên đăng nhập không thể thay đổi</Text>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Email</Text>
					<View style={styles.inputDisabled}>
						<Text style={styles.inputDisabledText}>{user?.email}</Text>
					</View>
				</View>

				<TouchableOpacity
					style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
					onPress={handleSave}
					disabled={saving}
				>
					{saving ? (
						<ActivityIndicator color="#fff" size="small" />
					) : (
						<Text style={styles.saveBtnText}>Lưu thay đổi</Text>
					)}
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
	topBar: {
		flexDirection: "row", alignItems: "center", justifyContent: "space-between",
		paddingHorizontal: 16, paddingVertical: 12,
		borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
	},
	topBarTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
	content: { padding: 20, gap: 20 },
	avatarSection: { alignItems: "center", gap: 10 },
	avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#EBEBEB" },
	avatarHint: { fontSize: 12, color: "#888888" },
	field: { gap: 6 },
	label: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
	input: {
		backgroundColor: "#F5F5F5",
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#EBEBEB",
		paddingHorizontal: 14,
		paddingVertical: 12,
		fontSize: 14,
		color: "#1A1A1A",
	},
	inputDisabled: {
		backgroundColor: "#F5F5F5",
		borderRadius: 10,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	inputDisabledText: { fontSize: 14, color: "#BBBBBB" },
	hint: { fontSize: 11, color: "#BBBBBB" },
	saveBtn: {
		backgroundColor: "#8B4513",
		paddingVertical: 14,
		borderRadius: 999,
		alignItems: "center",
		marginTop: 8,
	},
	saveBtnDisabled: { opacity: 0.6 },
	saveBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});

export default EditProfileScreen;
