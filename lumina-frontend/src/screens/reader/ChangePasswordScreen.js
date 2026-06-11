import React, { useState } from "react";
import {
	View, Text, TextInput, TouchableOpacity, StyleSheet,
	SafeAreaView, ScrollView, Alert, ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

const API_URL = 'http://192.168.10.104:5555/api';

const ChangePasswordScreen = ({ navigation }) => {
	const { user } = useSelector(state => state.auth);
	const [oldPass, setOldPass] = useState('');
	const [newPass, setNewPass] = useState('');
	const [confirmPass, setConfirmPass] = useState('');
	const [saving, setSaving] = useState(false);
	const [showOld, setShowOld] = useState(false);
	const [showNew, setShowNew] = useState(false);

	const handleChange = async () => {
		if (!oldPass || !newPass || !confirmPass) {
			Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
			return;
		}
		if (newPass !== confirmPass) {
			Alert.alert("Lỗi", "Mật khẩu mới không khớp.");
			return;
		}
		if (newPass.length < 6) {
			Alert.alert("Lỗi", "Mật khẩu mới phải ít nhất 6 ký tự.");
			return;
		}

		setSaving(true);
		try {
			const res = await fetch(`${API_URL}/users/${user.id}/password`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ old_password: oldPass, new_password: newPass }),
			}).then(r => r.json());

			if (res.status === "success") {
				Alert.alert("Thành công", "Đã đổi mật khẩu.", [{ text: "OK", onPress: () => navigation.goBack() }]);
			} else {
				Alert.alert("Lỗi", res.message);
			}
		} catch {
			Alert.alert("Lỗi", "Không thể kết nối server.");
		} finally {
			setSaving(false);
		}
	};

	const PasswordField = ({ label, value, onChangeText, show, onToggle }) => (
		<View style={styles.field}>
			<Text style={styles.label}>{label}</Text>
			<View style={styles.passwordRow}>
				<TextInput
					style={styles.passwordInput}
					placeholder="••••••••"
					placeholderTextColor="#BBBBBB"
					value={value}
					onChangeText={onChangeText}
					secureTextEntry={!show}
				/>
				<TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
					<MaterialIcons name={show ? "visibility-off" : "visibility"} size={20} color="#8B4513" />
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.topBar}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<MaterialIcons name="arrow-back" size={22} color="#8B4513" />
				</TouchableOpacity>
				<Text style={styles.topBarTitle}>Đổi mật khẩu</Text>
				<View style={{ width: 22 }} />
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.notice}>
					<MaterialIcons name="lock" size={20} color="#8B4513" />
					<Text style={styles.noticeText}>Mật khẩu phải ít nhất 6 ký tự</Text>
				</View>

				<PasswordField
					label="Mật khẩu hiện tại"
					value={oldPass}
					onChangeText={setOldPass}
					show={showOld}
					onToggle={() => setShowOld(v => !v)}
				/>
				<PasswordField
					label="Mật khẩu mới"
					value={newPass}
					onChangeText={setNewPass}
					show={showNew}
					onToggle={() => setShowNew(v => !v)}
				/>
				<PasswordField
					label="Xác nhận mật khẩu mới"
					value={confirmPass}
					onChangeText={setConfirmPass}
					show={showNew}
					onToggle={() => setShowNew(v => !v)}
				/>

				<TouchableOpacity
					style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
					onPress={handleChange}
					disabled={saving}
				>
					{saving ? (
						<ActivityIndicator color="#fff" size="small" />
					) : (
						<Text style={styles.saveBtnText}>Đổi mật khẩu</Text>
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
	notice: {
		flexDirection: "row", alignItems: "center", gap: 8,
		backgroundColor: "#F2E8E3",
		padding: 12, borderRadius: 10,
	},
	noticeText: { fontSize: 13, color: "#8B4513" },
	field: { gap: 6 },
	label: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
	passwordRow: {
		flexDirection: "row", alignItems: "center",
		backgroundColor: "#F5F5F5",
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#EBEBEB",
	},
	passwordInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#1A1A1A" },
	eyeBtn: { padding: 12 },
	saveBtn: {
		backgroundColor: "#8B4513", paddingVertical: 14,
		borderRadius: 999, alignItems: "center", marginTop: 8,
	},
	saveBtnDisabled: { opacity: 0.6 },
	saveBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});

export default ChangePasswordScreen;
