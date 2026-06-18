import React, { useState } from "react";
import {
	View, Text, TextInput, TouchableOpacity, StyleSheet,
	SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { API_URL } from '../../config/api';

const ForgotPasswordScreen = ({ navigation }) => {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleReset = async () => {
		if (!username.trim() || !email.trim() || !newPassword || !confirmPassword) {
			Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin."); return;
		}
		if (newPassword !== confirmPassword) {
			Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp."); return;
		}
		if (newPassword.length < 6) {
			Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự."); return;
		}
		setLoading(true);
		try {
			const res = await fetch(`${API_URL}/reset-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: username.trim(), email: email.trim().toLowerCase(), new_password: newPassword }),
			}).then(r => r.json());
			if (res.status === 'success') {
				Alert.alert("Thành công", "Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại.");
				navigation.goBack();
			} else {
				Alert.alert("Xác minh thất bại", res.message || "Tên đăng nhập hoặc email không đúng.");
			}
		} catch { Alert.alert("Lỗi", "Không thể kết nối máy chủ."); }
		finally { setLoading(false); }
	};

	return (
		<SafeAreaView style={s.safe}>
			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
					<TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
						<MaterialIcons name="arrow-back" size={22} color="#1A1A1A" />
					</TouchableOpacity>

					<View style={s.brand}>
						<View style={s.logo}>
							<MaterialIcons name="lock-reset" size={28} color="#8B4513" />
						</View>
						<Text style={s.title}>Đặt lại mật khẩu</Text>
						<Text style={s.sub}>Nhập tên đăng nhập và email đã đăng ký để xác minh danh tính</Text>
					</View>

					<View style={s.form}>
						<View style={s.field}>
							<Text style={s.label}>Tên đăng nhập *</Text>
							<TextInput
								style={s.input}
								placeholder="Nhập tên đăng nhập"
								placeholderTextColor="#BBBBBB"
								autoCapitalize="none"
								value={username}
								onChangeText={setUsername}
							/>
						</View>

						<View style={s.field}>
							<Text style={s.label}>Email đã đăng ký *</Text>
							<TextInput
								style={s.input}
								placeholder="Nhập email"
								placeholderTextColor="#BBBBBB"
								autoCapitalize="none"
								keyboardType="email-address"
								value={email}
								onChangeText={setEmail}
							/>
						</View>

						<View style={s.divider} />

						<View style={s.field}>
							<Text style={s.label}>Mật khẩu mới *</Text>
							<View style={s.passWrap}>
								<TextInput
									style={[s.input, { flex: 1, borderWidth: 0 }]}
									placeholder="Tối thiểu 6 ký tự"
									placeholderTextColor="#BBBBBB"
									secureTextEntry={!showNew}
									value={newPassword}
									onChangeText={setNewPassword}
								/>
								<TouchableOpacity onPress={() => setShowNew(v => !v)} style={s.eyeBtn}>
									<MaterialIcons name={showNew ? "visibility-off" : "visibility"} size={20} color="#BBBBBB" />
								</TouchableOpacity>
							</View>
						</View>

						<View style={s.field}>
							<Text style={s.label}>Xác nhận mật khẩu *</Text>
							<View style={s.passWrap}>
								<TextInput
									style={[s.input, { flex: 1, borderWidth: 0 }]}
									placeholder="Nhập lại mật khẩu mới"
									placeholderTextColor="#BBBBBB"
									secureTextEntry={!showConfirm}
									value={confirmPassword}
									onChangeText={setConfirmPassword}
								/>
								<TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={s.eyeBtn}>
									<MaterialIcons name={showConfirm ? "visibility-off" : "visibility"} size={20} color="#BBBBBB" />
								</TouchableOpacity>
							</View>
						</View>

						<TouchableOpacity
							style={[s.btn, loading && s.btnDisabled]}
							onPress={handleReset}
							disabled={loading}
						>
							{loading
								? <ActivityIndicator color="#fff" size="small" />
								: <Text style={s.btnText}>Đặt lại mật khẩu</Text>
							}
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: '#FFFFFF' },
	container: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
	backBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
	brand: { alignItems: 'center', marginBottom: 36 },
	logo: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
	title: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
	sub: { fontSize: 13, color: '#888888', marginTop: 6, textAlign: 'center', lineHeight: 19 },
	form: { gap: 16 },
	field: { gap: 6 },
	label: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
	input: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: '#1A1A1A', borderWidth: 1, borderColor: '#EBEBEB' },
	passWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: '#EBEBEB', overflow: 'hidden' },
	eyeBtn: { paddingHorizontal: 14 },
	divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },
	btn: { backgroundColor: '#8B4513', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
	btnDisabled: { opacity: 0.6 },
	btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

export default ForgotPasswordScreen;
