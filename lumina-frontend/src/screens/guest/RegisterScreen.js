import React, { useState } from "react";
import {
	View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
	ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../redux_thunk/AuthSlice";

const RegisterScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { loading } = useSelector(s => s.auth);
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleRegister = () => {
		if (!fullName || !email || !username || !password || !confirmPassword) {
			Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin."); return;
		}
		if (password !== confirmPassword) {
			Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp."); return;
		}
		dispatch(registerUser({ full_name: fullName, email, username, password }))
			.unwrap()
			.then(() => {
				Alert.alert("Thành công", "Đăng ký thành công! Hãy đăng nhập.");
				navigation.reset({ index: 0, routes: [{ name: "Login" }] });
			})
			.catch(err => Alert.alert("Lỗi", err));
	};

	const fields = [
		{ label: "Họ tên", val: fullName, set: setFullName, ph: "Nguyễn Văn A", type: "default" },
		{ label: "Email", val: email, set: setEmail, ph: "email@example.com", type: "email-address" },
		{ label: "Tên đăng nhập", val: username, set: setUsername, ph: "username", type: "default", cap: "none" },
		{ label: "Mật khẩu", val: password, set: setPassword, ph: "Mật khẩu (ít nhất 6 ký tự)", secure: true },
		{ label: "Xác nhận mật khẩu", val: confirmPassword, set: setConfirmPassword, ph: "Nhập lại mật khẩu", secure: true },
	];

	return (
		<SafeAreaView style={s.safe}>
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
				<ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

					<View style={s.header}>
						<TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
							<MaterialIcons name="arrow-back" size={22} color="#1A1A1A" />
						</TouchableOpacity>
						<Text style={s.title}>Tạo tài khoản</Text>
						<Text style={s.sub}>Chỉ mất 1 phút để bắt đầu</Text>
					</View>

					<View style={s.form}>
						{fields.map(f => (
							<View key={f.label} style={s.field}>
								<Text style={s.label}>{f.label}</Text>
								<TextInput
									style={s.input}
									placeholder={f.ph}
									placeholderTextColor="#BBBBBB"
									value={f.val}
									onChangeText={f.set}
									secureTextEntry={f.secure}
									keyboardType={f.type || "default"}
									autoCapitalize={f.cap || (f.secure ? "none" : "words")}
								/>
							</View>
						))}

						<TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={handleRegister} disabled={loading}>
							{loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnText}>Tạo tài khoản</Text>}
						</TouchableOpacity>
					</View>

					<View style={s.footer}>
						<Text style={s.footerText}>Đã có tài khoản? </Text>
						<TouchableOpacity onPress={() => navigation.navigate("Login")}>
							<Text style={s.footerLink}>Đăng nhập</Text>
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
	header: { marginBottom: 28 },
	backBtn: { marginBottom: 16 },
	title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A' },
	sub: { fontSize: 14, color: '#888888', marginTop: 4 },
	form: { gap: 14 },
	field: { gap: 6 },
	label: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
	input: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: '#1A1A1A', borderWidth: 1, borderColor: '#EBEBEB' },
	btn: { backgroundColor: '#8B4513', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
	btnOff: { opacity: 0.6 },
	btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
	footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
	footerText: { fontSize: 14, color: '#888888' },
	footerLink: { fontSize: 14, color: '#8B4513', fontWeight: '700' },
});

export default RegisterScreen;
