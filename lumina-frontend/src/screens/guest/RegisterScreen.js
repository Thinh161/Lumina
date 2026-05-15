import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	Alert,
	ActivityIndicator
} from "react-native";
import {
	FontAwesome,
	MaterialCommunityIcons,
	MaterialIcons,
} from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../redux_thunk/AuthSlice";

const RegisterScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { loading } = useSelector((state) => state.auth);

	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleRegister = () => {
		if (!fullName || !email || !username || !password || !confirmPassword) {
			Alert.alert("Lỗi", "Vui lòng điền đủ tất cả các trường.");
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
			return;
		}

		// Đẩy action vào Redux
		dispatch(registerUser({ 
			full_name: fullName, 
			email, 
			username, 
			password 
		}))
		.unwrap()
		.then(() => {
			Alert.alert("Thành công", "Đăng ký thành công! Hãy đăng nhập.");
			navigation.reset({
				index: 0,
				routes: [{ name: "Login" }],
			});
		})
		.catch((errorMsg) => {
			Alert.alert("Lỗi", errorMsg);
		});
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<ScrollView
					contentContainerStyle={styles.container}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.card}>
						<View style={styles.blobTopRight} />
						<View style={styles.blobBottomLeft} />

						<View style={styles.content}>
							<View style={styles.brandWrap}>
								<Text style={styles.brand}>The Anthology</Text>
							</View>

							<View style={styles.header}>
								<Text style={styles.title}>Bắt đầu hành trình của bạn</Text>
								<Text style={styles.subtitle}>
									Khám phá những câu chuyện được tuyển chọn tinh tế.
								</Text>
							</View>

							<View style={styles.form}>
								<View style={styles.field}>
									<Text style={styles.label}>Họ và tên</Text>
									<View style={styles.inputWrap}>
										<MaterialIcons
											name="person"
											size={18}
											color="#b3b2af"
											style={styles.inputIcon}
										/>
										<TextInput
											placeholder="Họ và tên của bạn"
											placeholderTextColor="#8e8b89"
											style={styles.input}
											value={fullName}
											onChangeText={setFullName}
										/>
									</View>
								</View>

								<View style={styles.field}>
									<Text style={styles.label}>Email</Text>
									<View style={styles.inputWrap}>
										<MaterialIcons
											name="mail"
											size={18}
											color="#b3b2af"
											style={styles.inputIcon}
										/>
										<TextInput
											placeholder="email@vi-du.com"
											placeholderTextColor="#8e8b89"
											keyboardType="email-address"
											autoCapitalize="none"
											style={styles.input}
											value={email}
											onChangeText={setEmail}
										/>
									</View>
								</View>

								<View style={styles.field}>
									<Text style={styles.label}>Tài khoản</Text>
									<View style={styles.inputWrap}>
										<MaterialIcons
											name="account-circle"
											size={18}
											color="#b3b2af"
											style={styles.inputIcon}
										/>
										<TextInput
											placeholder="Tên đăng nhập"
											placeholderTextColor="#8e8b89"
											autoCapitalize="none"
											style={styles.input}
											value={username}
											onChangeText={setUsername}
										/>
									</View>
								</View>

								<View style={styles.field}>
									<Text style={styles.label}>Mật khẩu</Text>
									<View style={styles.inputWrap}>
										<MaterialIcons
											name="lock"
											size={18}
											color="#b3b2af"
											style={styles.inputIcon}
										/>
										<TextInput
											placeholder="********"
											placeholderTextColor="#8e8b89"
											secureTextEntry
											style={styles.input}
											value={password}
											onChangeText={setPassword}
										/>
										<MaterialIcons
											name="visibility"
											size={18}
											color="#b3b2af"
											style={styles.inputIconRight}
										/>
									</View>
								</View>

								<View style={styles.field}>
									<Text style={styles.label}>Xác nhận mật khẩu</Text>
									<View style={styles.inputWrap}>
										<MaterialIcons
											name="verified-user"
											size={18}
											color="#b3b2af"
											style={styles.inputIcon}
										/>
										<TextInput
											placeholder="********"
											placeholderTextColor="#8e8b89"
											secureTextEntry
											style={styles.input}
											value={confirmPassword}
											onChangeText={setConfirmPassword}
										/>
									</View>
								</View>

								<TouchableOpacity 
									style={styles.primaryButton}
									onPress={handleRegister}
									disabled={loading}
								>
									{loading ? (
										<ActivityIndicator color="#fff" />
									) : (
										<>
											<Text style={styles.primaryButtonText}>Tạo tài khoản</Text>
											<MaterialIcons
												name="arrow-forward"
												size={18}
												color="#fff7f5"
											/>
										</>
									)}
								</TouchableOpacity>
							</View>

							<View style={styles.dividerRow}>
								<View style={styles.dividerLine} />
								<Text style={styles.dividerText}>Hoặc đăng ký bằng</Text>
								<View style={styles.dividerLine} />
							</View>

							<View style={styles.socialRow}>
								<TouchableOpacity style={styles.socialButton}>
									<FontAwesome
										name="google"
										size={18}
										color="#323331"
									/>
									<Text style={styles.socialText}>Google</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.socialButton}>
									<MaterialCommunityIcons
										name="apple"
										size={20}
										color="#323331"
									/>
									<Text style={styles.socialText}>Apple</Text>
								</TouchableOpacity>
							</View>

							<View style={styles.footer}>
								<Text style={styles.footerText}>
									Đã có tài khoản?
									<Text
										style={styles.footerLink}
										onPress={() => navigation.navigate("Login")}
									>
										{" "}Đăng nhập
									</Text>
								</Text>
							</View>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
		backgroundColor: "#fcf9f7",
	},
	container: {
		padding: 16,
		paddingBottom: 40,
	},
	card: {
		backgroundColor: "#f6f3f1",
		borderRadius: 16,
		padding: 24,
		overflow: "hidden",
	},
	content: {
		gap: 20,
	},
	brandWrap: {
		alignItems: "center",
	},
	brand: {
		fontSize: 28,
		fontWeight: "700",
		fontStyle: "italic",
		color: "#8c4f3b",
	},
	header: {
		gap: 8,
	},
	title: {
		fontSize: 26,
		fontWeight: "600",
		color: "#323331",
	},
	subtitle: {
		fontSize: 13,
		fontWeight: "600",
		color: "#5f5f5d",
	},
	form: {
		gap: 14,
	},
	field: {
		gap: 6,
	},
	label: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#5f5f5d",
		marginLeft: 4,
	},
	inputWrap: {
		position: "relative",
		justifyContent: "center",
	},
	input: {
		backgroundColor: "#e4e2df",
		borderRadius: 16,
		paddingVertical: 14,
		paddingLeft: 44,
		paddingRight: 44,
		fontSize: 14,
		color: "#323331",
	},
	inputIcon: {
		position: "absolute",
		left: 16,
	},
	inputIconRight: {
		position: "absolute",
		right: 16,
	},
	primaryButton: {
		marginTop: 8,
		backgroundColor: "#8c4f3b",
		paddingVertical: 14,
		borderRadius: 999,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	primaryButtonText: {
		color: "#fff7f5",
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 1.5,
		textTransform: "uppercase",
	},
	dividerRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: "#b3b2af",
		opacity: 0.3,
	},
	dividerText: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#7b7b78",
	},
	socialRow: {
		flexDirection: "row",
		gap: 12,
	},
	socialButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 12,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#d8d6d3",
		backgroundColor: "#ffffff",
	},
	socialText: {
		fontSize: 12,
		fontWeight: "700",
		color: "#323331",
	},
	footer: {
		alignItems: "center",
		marginTop: 6,
	},
	footerText: {
		fontSize: 13,
		color: "#5f5f5d",
		fontWeight: "600",
	},
	footerLink: {
		color: "#8c4f3b",
		fontWeight: "700",
	},
	blobTopRight: {
		position: "absolute",
		top: -80,
		right: -80,
		width: 180,
		height: 180,
		borderRadius: 90,
		backgroundColor: "#fdae95",
		opacity: 0.12,
	},
	blobBottomLeft: {
		position: "absolute",
		bottom: -80,
		left: -80,
		width: 180,
		height: 180,
		borderRadius: 90,
		backgroundColor: "#ffdb98",
		opacity: 0.12,
	},
});

export default RegisterScreen;
