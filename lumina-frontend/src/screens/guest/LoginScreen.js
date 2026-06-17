import React, { useState, useEffect } from "react";
import {
	View, Text, TextInput, TouchableOpacity, StyleSheet,
	SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../redux_thunk/AuthSlice";

const LoginScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { loading, error, user } = useSelector(s => s.auth);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPass, setShowPass] = useState(false);

	useEffect(() => {
		if (user) { navigation.replace(user.role_id === 1 ? "Admin" : "Reader"); }
	}, [user, navigation]);

	useEffect(() => {
		if (error) { dispatch(clearError()); }
	}, [error, dispatch]);

	const handleLogin = () => {
		if (!username || !password) { Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin"); return; }
		dispatch(loginUser({ username, password }));
	};

	return (
		<SafeAreaView style={s.safe}>
			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

					<View style={s.brand}>
						<View style={s.logo}>
							<MaterialIcons name="auto-stories" size={28} color="#8B4513" />
						</View>
						<Text style={s.appName}>Lumina</Text>
						<Text style={s.appSub}>Đăng nhập để tiếp tục</Text>
					</View>

					<View style={s.form}>
						<View style={s.field}>
							<Text style={s.label}>Tên đăng nhập</Text>
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
							<View style={s.labelRow}>
								<Text style={s.label}>Mật khẩu</Text>
								<TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}><Text style={s.forgot}>Quên mật khẩu?</Text></TouchableOpacity>
							</View>
							<View style={s.passWrap}>
								<TextInput
									style={[s.input, { flex: 1, borderWidth: 0 }]}
									placeholder="Nhập mật khẩu"
									placeholderTextColor="#BBBBBB"
									secureTextEntry={!showPass}
									value={password}
									onChangeText={setPassword}
								/>
								<TouchableOpacity onPress={() => setShowPass(v => !v)} style={s.eyeBtn}>
									<MaterialIcons name={showPass ? "visibility-off" : "visibility"} size={20} color="#BBBBBB" />
								</TouchableOpacity>
							</View>
						</View>

						{error ? (
							<View style={s.errorBox}>
								<MaterialIcons name="error-outline" size={15} color="#D32F2F" />
								<Text style={s.errorText}>{error}</Text>
							</View>
						) : null}
						<TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}>
							{loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnText}>Đăng nhập</Text>}
						</TouchableOpacity>
					</View>

					<View style={s.footer}>
						<Text style={s.footerText}>Chưa có tài khoản? </Text>
						<TouchableOpacity onPress={() => navigation.navigate("Register")}>
							<Text style={s.footerLink}>Đăng ký ngay</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: '#FFFFFF' },
	container: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
	brand: { alignItems: 'center', marginBottom: 40 },
	logo: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
	appName: { fontSize: 26, fontWeight: '800', color: '#1A1A1A' },
	appSub: { fontSize: 14, color: '#888888', marginTop: 4 },
	form: { gap: 16 },
	field: { gap: 6 },
	label: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
	labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	forgot: { fontSize: 12, color: '#8B4513' },
	input: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: '#1A1A1A', borderWidth: 1, borderColor: '#EBEBEB' },
	passWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: '#EBEBEB', overflow: 'hidden' },
	eyeBtn: { paddingHorizontal: 14 },
	btn: { backgroundColor: '#8B4513', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
	btnDisabled: { opacity: 0.6 },
	btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
	footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
	footerText: { fontSize: 14, color: '#888888' },
	footerLink: { fontSize: 14, color: '#8B4513', fontWeight: '700' },
	errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF0F0', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#FFCDD2' },
	errorText: { fontSize: 13, color: '#D32F2F', flex: 1 },
});

export default LoginScreen;
