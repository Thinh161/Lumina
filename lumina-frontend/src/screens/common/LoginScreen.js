import React from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
	return (
		<SafeAreaView style={styles.safeArea}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.flex}
			>
				<ScrollView
					contentContainerStyle={styles.container}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.brandWrap}>
						<View style={styles.brandIcon}>
							<Text style={styles.brandIconText}>LN</Text>
						</View>
						<Text style={styles.title}>Lumina Narrative</Text>
						<Text style={styles.subtitle}>Tiếp tục hành trình của bạn</Text>
					</View>

					<View style={styles.form}>
						<View style={styles.field}>
							<Text style={styles.label}>Email</Text>
							<TextInput
								placeholder="scribe@lumina.com"
								placeholderTextColor="#9f9a97"
								keyboardType="email-address"
								autoCapitalize="none"
								style={styles.input}
							/>
						</View>

						<View style={styles.field}>
							<View style={styles.fieldHeader}>
								<Text style={styles.label}>Mật khẩu</Text>
								<TouchableOpacity onPress={() => navigation.navigate("Register")}>
									<Text style={styles.linkSmall}>Quên mật khẩu?</Text>
								</TouchableOpacity>
							</View>
							<TextInput
								placeholder="********"
								placeholderTextColor="#9f9a97"
								secureTextEntry
								style={styles.input}
							/>
						</View>

						<TouchableOpacity
							style={styles.primaryButton}
							onPress={() => navigation.navigate("User")}
						>
							<Text style={styles.primaryButtonText}>Đăng nhập</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.dividerRow}>
						<View style={styles.dividerLine} />
						<Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
						<View style={styles.dividerLine} />
					</View>

					<View style={styles.socialRow}>
						<TouchableOpacity style={styles.socialButton}>
							<FontAwesome
								name="google"
								size={18}
								color="#5f5f5d"
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
							Chưa có tài khoản?
							<Text
								style={styles.footerLink}
								onPress={() => navigation.navigate("Register")}
							>
								{" "}Đăng ký
							</Text>
						</Text>
					</View>
				</ScrollView>

				<View style={styles.blobTopRight} />
				<View style={styles.blobBottomLeft} />
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
		paddingHorizontal: 28,
		paddingTop: 48,
		paddingBottom: 64,
	},
	brandWrap: {
		alignItems: "center",
		marginBottom: 40,
	},
	brandIcon: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: "#f6f3f1",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 16,
	},
	brandIconText: {
		color: "#8c4f3b",
		fontSize: 20,
		fontWeight: "700",
		letterSpacing: 1,
	},
	title: {
		fontSize: 30,
		fontWeight: "700",
		color: "#323331",
		textAlign: "center",
	},
	subtitle: {
		marginTop: 6,
		fontSize: 18,
		color: "#5f5f5d",
		fontStyle: "italic",
		textAlign: "center",
	},
	form: {
		gap: 20,
	},
	field: {
		gap: 8,
	},
	fieldHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	label: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#5f5f5d",
		marginLeft: 4,
	},
	linkSmall: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 1.5,
		textTransform: "uppercase",
		color: "#8c4f3b",
	},
	input: {
		backgroundColor: "#e4e2df",
		paddingHorizontal: 18,
		paddingVertical: 16,
		borderRadius: 16,
		fontSize: 16,
		color: "#323331",
	},
	primaryButton: {
		backgroundColor: "#8c4f3b",
		paddingVertical: 16,
		borderRadius: 999,
		alignItems: "center",
		marginTop: 4,
	},
	primaryButtonText: {
		color: "#fff7f5",
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
	},
	dividerRow: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 28,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: "#b3b2af",
		opacity: 0.25,
	},
	dividerText: {
		marginHorizontal: 12,
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 2.5,
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
		paddingVertical: 14,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#d8d6d3",
		backgroundColor: "#ffffff",
	},
	socialText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#5f5f5d",
	},
	footer: {
		marginTop: 36,
		alignItems: "center",
	},
	footerText: {
		color: "#5f5f5d",
		fontStyle: "italic",
	},
	footerLink: {
		color: "#8c4f3b",
		fontWeight: "700",
		letterSpacing: 1.5,
		textTransform: "uppercase",
		fontStyle: "normal",
		fontSize: 11,
	},
	blobTopRight: {
		position: "absolute",
		top: -80,
		right: -80,
		width: 220,
		height: 220,
		borderRadius: 110,
		backgroundColor: "#fdae95",
		opacity: 0.12,
	},
	blobBottomLeft: {
		position: "absolute",
		bottom: -80,
		left: -80,
		width: 220,
		height: 220,
		borderRadius: 110,
		backgroundColor: "#ffdb98",
		opacity: 0.12,
	},
});

export default LoginScreen;
