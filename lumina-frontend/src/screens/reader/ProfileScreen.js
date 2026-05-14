import React from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Image,
	TouchableOpacity,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const libraryItems = [
	{
		id: "lib-1",
		tag: "Kỳ Ảo",
		title: "Rừng Xanh Vô Tận",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuAuBOAWEGm1r8xYw1mxAcNxN4Jg2xiqkq6iLi7DLEqD66_aMzDrYBWs72CbQmjFxe0Asc9F39qztW8kS1M0J-0FinSG7cMzc2ZOcLCbqLYW4KbVImvPYYuKM6sjbSWOALiDY1wUOCUF3CIaV11-UdCZJBTg-pvUHCa6NLkKbOWeQCjN2F56ulc6dMeea1DOq7t9EfC4cglSYOzXKTzdeGeOeF4KpXcDHsjZygIMN0831biOX6SDYM3u2ogDiT_oyN_SQ6qfs2cew5I",
	},
	{
		id: "lib-2",
		tag: "Lãng Mạn",
		title: "Mùa Thu Năm Ấy",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCukATnvUSGguuXRbRH6wLAeZ8YbPiw9QfuVEvCvY08sFBUIBczxfSOBdJpxCTDNy7YJqB8d2HaRF4z3J3i2l4oBQaJiOMd2wkizOfom69pRrzIpi3e_C8lQUIsotNybAODky-En5pO2caAB22gPdd37pL_RcVZQKiILvhPfZnly6sCsF5S6vFdb6MSnvI_pgWTStYyphh90LNwcTHOO2ZJ2n_KL_MKYgdQacG-FDZrQuBxIHXOrdiH6yXQTa7vacDH-_uvmUD293U",
	},
	{
		id: "lib-3",
		tag: "Trinh Thám",
		title: "Bí Mật Cửa Đông",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBjlzGrnEhZaTFI2s_gllkHtfhRoSSGzjbxOV6kyDl9e9SPXYrSd1Ksnnxqta_0vibcm7R8xwbnI-18A95Lx8HgYY_1m-ymCY4imc9nGIQ1P2cCQ3KKKEh1Nj3f04Q-_M4c8Z1MDELDkA7zKEmhWAcjWMICDqNVKFsT4DjwpTb40kBI0ZTxz4dM3hC8g36jgMBR6II3BKxMMa9FZv6j1HLhwHvgI5b9E1Ayej5lZ-yX7yDj8MiDCUQ6vxouFlDg-wV3vrMoDXqX_gQ",
	},
];

const managementItems = [
	{
		id: "m-1",
		title: "Thông tin cá nhân",
		subtitle: "Cập nhật tên, ảnh đại diện và tiểu sử",
		icon: "person",
	},
	{
		id: "m-2",
		title: "Bảo mật & Mật khẩu",
		subtitle: "Quản lý phiên đăng nhập và 2FA",
		icon: "security",
	},
	{
		id: "m-3",
		title: "Thông báo",
		subtitle: "Thông báo chương mới và bình luận",
		icon: "notifications",
	},
	{
		id: "m-4",
		title: "Cài đặt đọc truyện",
		subtitle: "Cỡ chữ, phông nền và chế độ đọc",
		icon: "palette",
	},
];

const ProfileScreen = () => {
	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.root}>
				<View style={styles.topBar}>
					<View style={styles.topBarLeft}>
						<MaterialIcons name="menu" size={22} color="#8c4f3b" />
						<Text style={styles.topBarTitle}>App Đọc Truyện Online</Text>
					</View>
					<MaterialIcons name="search" size={22} color="#8c4f3b" />
				</View>

				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.profileHeader}>
						<View style={styles.avatarWrap}>
							<Image
								source={{
									uri:
										"https://lh3.googleusercontent.com/aida-public/AB6AXuCZ8869qWy9nQKmjm2nd15yiyLA6AGe5xluCcknNDETI3u69xO53m5s26W5UQqCmU4zyzf11SgtOc3tECHsxH5V-yyIuo5G1XsRxwOdJkLJJ-E34EqbXhTuus-swwxehy7YNJQoWM_0n6aJfm53T0imvlYsBv985pHJm8YP0BjAl-wxnt_WbT9RiW0ec3PrbteyI9lmRFOmnestzuuwUHyeJYbXbouK6ldtyjvVTAByLLhucHQL4W1tFTwUwiw7lHEMjj4URDKWSpg",
								}}
								style={styles.avatar}
							/>
							<TouchableOpacity style={styles.editAvatarButton}>
								<MaterialIcons name="edit" size={14} color="#fff7f5" />
							</TouchableOpacity>
						</View>

						<View style={styles.profileInfo}>
							<Text style={styles.profileBadge}>Thành viên cao cấp</Text>
							<Text style={styles.profileName}>Lê Minh Anh</Text>
							<Text style={styles.profileQuote}>
								"Lạc giữa những chương hồi và những giấc mơ."
							</Text>
						</View>

						<View style={styles.statsRow}>
							<View style={styles.statCard}>
								<Text style={styles.statValue}>128</Text>
								<Text style={styles.statLabel}>Chương đã đọc</Text>
							</View>
							<View style={styles.statCard}>
								<Text style={styles.statValue}>12</Text>
								<Text style={styles.statLabel}>Theo dõi</Text>
							</View>
						</View>
					</View>

					<View style={styles.dashboardGrid}>
						<View style={styles.vipCard}>
							<View>
								<Text style={styles.vipLabel}>Mua Chương VIP</Text>
								<View style={styles.vipRow}>
									<MaterialCommunityIcons
										name="currency-usd"
										size={20}
										color="#8c4f3b"
									/>
									<Text style={styles.vipValue}>1,250</Text>
								</View>
								<Text style={styles.vipSubtitle}>
									Xu hiện có trong tài khoản của bạn
								</Text>
							</View>
							<TouchableOpacity style={styles.vipButton}>
								<Text style={styles.vipButtonText}>Nạp Xu Ngay</Text>
								<MaterialIcons name="arrow-forward" size={16} color="#fff7f5" />
							</TouchableOpacity>
							<View style={styles.vipGlow} />
						</View>

						<View style={styles.libraryCard}>
							<View style={styles.libraryHeader}>
								<Text style={styles.libraryTitle}>Thư Viện</Text>
								<Text style={styles.libraryAction}>Xem tất cả</Text>
							</View>
							<View style={styles.libraryGrid}>
								{libraryItems.map((item) => (
									<View key={item.id} style={styles.libraryItem}>
										<Image source={{ uri: item.image }} style={styles.libraryCover} />
										<Text style={styles.libraryTag}>{item.tag}</Text>
										<Text style={styles.libraryName}>{item.title}</Text>
									</View>
								))}
							</View>
						</View>

						<View style={styles.managementCard}>
							  <Text style={styles.managementTitle}>Quản Lý Hồ Sơ</Text>
							<View style={styles.managementGrid}>
								{managementItems.map((item) => (
									<TouchableOpacity key={item.id} style={styles.managementRow}>
										<View style={styles.managementLeft}>
											<View style={styles.managementIconWrap}>
												<MaterialIcons name={item.icon} size={18} color="#8c4f3b" />
											</View>
											<View>
												<Text style={styles.managementItemTitle}>{item.title}</Text>
												<Text style={styles.managementItemSubtitle}>{item.subtitle}</Text>
											</View>
										</View>
										<MaterialIcons name="chevron-right" size={20} color="#b3b2af" />
									</TouchableOpacity>
								))}
							</View>
						</View>

						<TouchableOpacity style={styles.logoutRow}>
							<MaterialIcons name="logout" size={18} color="#a83836" />
							  <Text style={styles.logoutText}>Đăng xuất khỏi tài khoản</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>

			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#fcf9f7",
	},
	root: {
		flex: 1,
		position: "relative",
	},
	topBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#fcf9f7",
		borderBottomWidth: 1,
		borderBottomColor: "rgba(179, 178, 175, 0.2)",
	},
	topBarLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	topBarTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#323331",
	},
	scrollContent: {
		padding: 16,
		paddingBottom: 140,
	},
	profileHeader: {
		gap: 16,
		marginBottom: 24,
	},
	avatarWrap: {
		alignSelf: "center",
		position: "relative",
	},
	avatar: {
		width: 120,
		height: 120,
		borderRadius: 60,
		borderWidth: 4,
		borderColor: "#f6f3f1",
	},
	editAvatarButton: {
		position: "absolute",
		right: 6,
		bottom: 6,
		backgroundColor: "#8c4f3b",
		padding: 8,
		borderRadius: 999,
	},
	profileInfo: {
		alignItems: "center",
		gap: 6,
	},
	profileBadge: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#8c4f3b",
	},
	profileName: {
		fontSize: 28,
		fontWeight: "700",
		color: "#323331",
	},
	profileQuote: {
		fontSize: 14,
		fontStyle: "italic",
		color: "#5f5f5d",
		textAlign: "center",
	},
	statsRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 12,
	},
	statCard: {
		backgroundColor: "#f6f3f1",
		borderRadius: 12,
		paddingVertical: 12,
		paddingHorizontal: 18,
		alignItems: "center",
	},
	statValue: {
		fontSize: 20,
		fontWeight: "700",
		color: "#8c4f3b",
	},
	statLabel: {
		fontSize: 9,
		fontWeight: "700",
		letterSpacing: 1.5,
		textTransform: "uppercase",
		color: "rgba(50, 51, 49, 0.6)",
		marginTop: 4,
	},
	dashboardGrid: {
		gap: 16,
	},
	vipCard: {
		backgroundColor: "#fdae95",
		borderRadius: 16,
		padding: 18,
		gap: 16,
		overflow: "hidden",
	},
	vipLabel: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#622d1c",
	},
	vipRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginTop: 8,
	},
	vipValue: {
		fontSize: 30,
		fontWeight: "800",
		color: "#622d1c",
	},
	vipSubtitle: {
		fontSize: 12,
		color: "rgba(98, 45, 28, 0.7)",
		marginTop: 6,
	},
	vipButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		backgroundColor: "#8c4f3b",
		paddingVertical: 12,
		borderRadius: 999,
	},
	vipButtonText: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#fff7f5",
	},
	vipGlow: {
		position: "absolute",
		right: -40,
		top: -40,
		width: 140,
		height: 140,
		borderRadius: 70,
		backgroundColor: "rgba(140, 79, 59, 0.1)",
	},
	libraryCard: {
		backgroundColor: "#f6f3f1",
		borderRadius: 16,
		padding: 16,
		gap: 12,
	},
	libraryHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	libraryTitle: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#5f5f5d",
	},
	libraryAction: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#8c4f3b",
	},
	libraryGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	libraryItem: {
		width: "48%",
	},
	libraryCover: {
		width: "100%",
		height: 160,
		borderRadius: 12,
		marginBottom: 8,
	},
	libraryTag: {
		fontSize: 9,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#8c4f3b",
	},
	libraryName: {
		fontSize: 12,
		fontWeight: "700",
		color: "#323331",
		marginTop: 4,
	},
	managementCard: {
		backgroundColor: "#e4e2df",
		borderRadius: 16,
		padding: 18,
		gap: 12,
	},
	managementTitle: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#5f5f5d",
	},
	managementGrid: {
		gap: 6,
	},
	managementRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(179, 178, 175, 0.2)",
	},
	managementLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flex: 1,
	},
	managementIconWrap: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#f6f3f1",
		alignItems: "center",
		justifyContent: "center",
	},
	managementItemTitle: {
		fontSize: 13,
		fontWeight: "700",
		color: "#323331",
	},
	managementItemSubtitle: {
		fontSize: 10,
		color: "#5f5f5d",
		marginTop: 2,
	},
	logoutRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 12,
	},
	logoutText: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#a83836",
	},
});

export default ProfileScreen;
