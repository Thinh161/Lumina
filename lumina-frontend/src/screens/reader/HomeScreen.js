import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Image,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const featuredStories = [
	{
		id: "main",
		title: "Tiếng Gọi Từ Những Đồi Cát Trắng",
		subtitle:
			"Câu chuyện mở ra từ sa mạc trắng, nơi mỗi cơn gió mang theo một bí ẩn.",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuD00yC-OnoCjJ9ZHaMrK26WR4nYqz0nk2iS7pDgV0ssTgw8yFCTDNtMUsY1PrTvNBcw6wSxrSiSTkZTqnqAffNyZ0UIKtGPXkVOT77r7Y5TCsZMjHWTTyxy49Hp18b4ugO9E7i3qYa1gH-kS7MEW9AsnlKK7f4oUBV50yuyj9NieHkFkbdHT8t6AlHwcNHmlOj9Ne21nhGlD1SZYbDdfw3l59bzcFB8gpWyHi_X8AT90teA3r5Xw3F45xnRt2FS-wrNbF-Kja0tdXc",
	},
	{
		id: "side-1",
		title: "Vọng Âm Của Im Lặng",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuD_b2OHlFIHZaAO-8M9G42oTOgNbbuxZp4585qi5d0XqvPRim5em2cMhHG4aIg8osqb2v5u2tFgRTa7QEt6grZNwg1YvTH8gtew0V1jHEUboX-qdrzJI14U7t-8aWL7W-VaN6FVPg2V0T-FZPirtwXk6z606PcgoLG1U_trjNwgshl2Iff0bX7aTSLzrV5bCASRdRRmvc7OyYFJTbnij5Cx3NWyWgm3SJkgkUCbbNkG3CR18eDD7oApXN1DXPQyZJoN03zVv4Icyi4",
	},
	{
		id: "side-2",
		title: "Ngòi Bút Mạ Vàng",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDs1RziyboFAmX82z2XgqdamFXOj9_oFlxpnleqxkqAKpHTLMV1opuH1Nv1P5paTZB4JN3gxv3-zKITlE5Itta7FF2aDp47IM86O77F0jeSxNCPFq_MtB6sgBdZaC3105toIUlHJFrIvdpXcEZEkVjZ-LvsDjCU8GMkeDv95z9pwFwR9lVbl_zd8tVbzdJo5UVJdilf4bm6_5w9BdQqhMoa9VVzr_m9s8XU6tt-jmWwDZ-TKl0Amalyp3sn-rxDSAFcg9ataqylzpw",
	},
];

const newReleases = [
	{
		id: "nr-1",
		author: "Lê Minh",
		title: "Bóng Tối Của Quá Khứ",
		rating: "4.9",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDLuzYxg9x0WgKBtE11SlG06awQ5c64JxKNCVQNZw9UdS6wzd446WKp1vQftNuRmnGqRKNEseEu_RUqM3f5Q_wHhGZVPCbwSPZPz92PH9qPM0pkwCP5O2xH3qfUlqa8xqwD157djsLUuDotZWE7Jk9T3uZwuzthK6T_2kslIBdCj-luKzzKUPZttkPslv2UduQqkYuJqeFPZIVUXsMnNFGItZ66wpqJwLqN1tMyXKTwMUOIn8yUp_k9bs9f5Z4XT7gea0L1yzdMYRQ",
	},
	{
		id: "nr-2",
		author: "Ngọc Lan",
		title: "Thư Viện Nửa Đêm",
		rating: "4.8",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDXb21VKFl33tGL326NZGLOsmaS1o5dRdcFr0GeTN7rhjTmKpF7cKGkq_cVHZOgDtIZRwwUYCsX4oqABnTzm7460xddGJ9Tns7okR6OBWm4uADDpOawKch9dU_JiIFTjl6YeM1ITsQT3R_lwGUNs5EKOaO3A2Lt02_OdXWcSbx_LXinbKCgjlN1jc3d6AliTBhsnRTaSD-DbpzK--ERC4PG7XHZe7TUDk0a36qaWo6IMWQbSYlT2_HJXhAm3petW429ZV72CoWwzuk",
	},
	{
		id: "nr-3",
		author: "Hải Anh",
		title: "Vượt Qua Chân Trời",
		rating: "4.7",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuA4KtWM2DR4gRdVyjKaYOKGd6i6-1druhaIAXMECoJgrBidAa9adKy52Dzfyroey-WUj1PcjFJLJDLx1pkefT3yRRSWuU6PXv84Fc3V5HQRq4d8Bw43k7mLPGGxrhNyoBk9UsmPEoPv9pcX-_pJXrHI8hiGCtPmS85NTMvXsZRIzybY59URuUhe6qcEx2eYOnVc5dr-fAsFOXY8sN6DZemf_H8lgR_0kVC77fcpdkFZSGd3WffyM3tq82hmotFPJkWgV_z_Va0-J2I",
	},
	{
		id: "nr-4",
		author: "Trần Khoa",
		title: "Người Vẽ Bản Đồ Thất Lạc",
		rating: "5.0",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuC0bALptL0sMHAhLxW8aLwUrmSOKpIGBTwI3Jt0lU5ReZnoV2FWvury65GCYlHsTVOtlpvYE3aYWA574TCCcfcD4c6n6thIgDT9obkxWuZDD-Fba-LsZa4Wvs35tHwBMtW5gO17056w-xidtkQJoDmeJ80fCWbo6rdOtu8BtvfV-T60nv6mkU0Xz6Q99OXF7Qxo1I9M89KXG28mshCnYZ7fVFu7yFUCxZWyRpnSWxliepNEH98XcNBAoISzYTaF82HIHRmjlVu94Lw",
	},
];

const categories = [
	{ id: "cat-1", label: "Lãng Mạn", icon: "auto-stories" },
	{ id: "cat-2", label: "Kỳ Ảo", icon: "sword-cross" },
	{ id: "cat-3", label: "Bí Ẩn", icon: "mystery" },
	{ id: "cat-4", label: "Lịch Sử", icon: "history-edu" },
];

const HomeScreen = ({ navigation }) => {
	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.root}>
				<View style={styles.topBar}>
					<View style={styles.topBarLeft}>
						<TouchableOpacity style={styles.topBarButton}>
							<MaterialIcons name="menu" size={22} color="#8c4f3b" />
						</TouchableOpacity>
						<Text style={styles.topBarTitle}>App Đọc Truyện Online</Text>
					</View>
					<TouchableOpacity style={styles.topBarButton}>
						<MaterialIcons name="search" size={22} color="#8c4f3b" />
					</TouchableOpacity>
				</View>

				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.sectionHeaderRow}>
						<Text style={styles.sectionTitle}>Truyện Nổi Bật</Text>
						<Text style={styles.sectionAction}>Xem tất cả</Text>
					</View>

					<View style={styles.featuredGrid}>
						<TouchableOpacity
							style={styles.featuredMain}
							activeOpacity={0.9}
							onPress={() => navigation.navigate("StoryDetail")}
						>
							<Image
								source={{ uri: featuredStories[0].image }}
								style={styles.featuredMainImage}
							/>
							<View style={styles.featuredMainOverlay} />
							<View style={styles.featuredMainContent}>
								<Text style={styles.featuredBadge}>LỰA CHỌN BIÊN TẬP</Text>
								<Text style={styles.featuredTitle}>{featuredStories[0].title}</Text>
								<Text style={styles.featuredSubtitle}>
									{featuredStories[0].subtitle}
								</Text>
								<TouchableOpacity
									style={styles.readNowButton}
									onPress={() => navigation.navigate("ChapterRead")}
								>
									<Text style={styles.readNowText}>Đọc ngay</Text>
								</TouchableOpacity>
							</View>
						</TouchableOpacity>

						<View style={styles.featuredSideColumn}>
							{featuredStories.slice(1).map((story) => (
								<TouchableOpacity
									key={story.id}
									style={styles.featuredSideCard}
									activeOpacity={0.9}
									onPress={() => navigation.navigate("StoryDetail")}
								>
									<Image
										source={{ uri: story.image }}
										style={styles.featuredSideImage}
									/>
									<View style={styles.featuredSideOverlay} />
									<Text style={styles.featuredSideTitle}>{story.title}</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>

					<View style={styles.sectionHeaderRow}>
						<Text style={styles.sectionTitle}>Mới Phát Hành</Text>
						<View style={styles.releaseNav}>
							<View style={styles.releaseNavButton}>
								<MaterialIcons name="west" size={14} color="#5f5f5d" />
							</View>
							<View style={styles.releaseNavButton}>
								<MaterialIcons name="east" size={14} color="#5f5f5d" />
							</View>
						</View>
					</View>

					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.releaseRow}
					>
						{newReleases.map((release) => (
							<View key={release.id} style={styles.releaseCard}>
								<TouchableOpacity
									style={styles.releaseCoverWrap}
									activeOpacity={0.9}
									onPress={() => navigation.navigate("StoryDetail")}
								>
									<Image
										source={{ uri: release.image }}
										style={styles.releaseCover}
									/>
								</TouchableOpacity>
								<Text style={styles.releaseAuthor}>{release.author}</Text>
								<Text style={styles.releaseTitle}>{release.title}</Text>
								<View style={styles.releaseRating}>
									<MaterialIcons name="star" size={14} color="#8c4f3b" />
									<Text style={styles.releaseRatingText}>
										{release.rating}
									</Text>
								</View>
							</View>
						))}
					</ScrollView>

					<Text style={styles.sectionTitle}>Thể Loại Phổ Biến</Text>
					<View style={styles.categoryGrid}>
						{categories.map((category) => (
							<View key={category.id} style={styles.categoryTile}>
								{category.icon === "sword-cross" ? (
									<MaterialCommunityIcons
										name="sword-cross"
										size={20}
										color="#8c4f3b"
									/>
								) : (
									<MaterialIcons
										name={category.icon}
										size={20}
										color="#8c4f3b"
									/>
								)}
								<Text style={styles.categoryText}>{category.label}</Text>
							</View>
						))}
					</View>

					<View style={styles.resumeBar}>
						<Image
							source={{
								uri:
									"https://lh3.googleusercontent.com/aida-public/AB6AXuAfASRF5qPV1Tuj9XFQ2ox3qx2epPmufUQGnFNyFFpcyzc0-vF43RWr32aj43A_SAfrle500PNvr-vCXuWtQxVTj__SS1Py9Kz1LlazlJNDSyAsddqAAMxxMhxBVunNb5ajZpYx7OJ5vMjjwmxSCRPr9XQsl4gxTKNRSBYiyykDiW-U0jsPADTAIwuNvQeB6MUtvperr7aRjzUdDZajTWgsezGzsXydY2Gtj8vSC5zIQHeoPPZa9O4fcRH0cVdtLNxL72BCM2qvd7I",
							}}
							style={styles.resumeCover}
						/>
						<View style={styles.resumeText}>
							<Text style={styles.resumeMeta}>Tiếp tục đọc</Text>
							<Text style={styles.resumeTitle}>Bóng Tối Của Quá Khứ</Text>
						</View>
						<View style={styles.resumeControls}>
							<View style={styles.resumeProgressTrack}>
								<View style={styles.resumeProgressFill} />
							</View>
							<MaterialIcons name="play-arrow" size={18} color="#8c4f3b" />
						</View>
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
	topBarButton: {
		padding: 6,
	},
	topBarTitle: {
		fontSize: 18,
		fontWeight: "700",
		fontStyle: "italic",
		color: "#323331",
	},
	scrollContent: {
		paddingBottom: 120,
	},
	sectionHeaderRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		marginTop: 16,
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: "600",
		color: "#323331",
		paddingHorizontal: 16,
		marginTop: 16,
		marginBottom: 12,
	},
	sectionAction: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#8c4f3b",
	},
	featuredGrid: {
		paddingHorizontal: 16,
		gap: 16,
	},
	featuredMain: {
		height: 260,
		borderRadius: 16,
		overflow: "hidden",
		backgroundColor: "#f6f3f1",
	},
	featuredMainImage: {
		width: "100%",
		height: "100%",
	},
	featuredMainOverlay: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		top: 0,
		backgroundColor: "rgba(50, 51, 49, 0.55)",
	},
	featuredMainContent: {
		position: "absolute",
		left: 16,
		right: 16,
		bottom: 16,
		gap: 8,
	},
	featuredBadge: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#fdae95",
	},
	featuredTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: "#ffffff",
	},
	featuredSubtitle: {
		fontSize: 12,
		color: "rgba(255, 255, 255, 0.85)",
	},
	readNowButton: {
		alignSelf: "flex-start",
		backgroundColor: "#8c4f3b",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 999,
	},
	readNowText: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 1.5,
		textTransform: "uppercase",
		color: "#fff7f5",
	},
	featuredSideColumn: {
		gap: 12,
	},
	featuredSideCard: {
		height: 140,
		borderRadius: 16,
		overflow: "hidden",
		backgroundColor: "#f6f3f1",
	},
	featuredSideImage: {
		width: "100%",
		height: "100%",
	},
	featuredSideOverlay: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		top: 0,
		backgroundColor: "rgba(50, 51, 49, 0.4)",
	},
	featuredSideTitle: {
		position: "absolute",
		left: 12,
		bottom: 12,
		fontSize: 16,
		fontWeight: "700",
		color: "#ffffff",
		fontStyle: "italic",
	},
	releaseNav: {
		flexDirection: "row",
		gap: 8,
	},
	releaseNavButton: {
		width: 28,
		height: 28,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: "rgba(179, 178, 175, 0.3)",
		alignItems: "center",
		justifyContent: "center",
	},
	releaseRow: {
		paddingHorizontal: 16,
		paddingBottom: 12,
		gap: 16,
	},
	releaseCard: {
		width: 180,
		backgroundColor: "#f6f3f1",
		borderRadius: 16,
		padding: 12,
		gap: 6,
	},
	releaseCoverWrap: {
		marginTop: -20,
		borderRadius: 12,
		overflow: "hidden",
	},
	releaseCover: {
		width: "100%",
		height: 200,
	},
	releaseAuthor: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#5f5f5d",
	},
	releaseTitle: {
		fontSize: 14,
		fontWeight: "700",
		color: "#323331",
	},
	releaseRating: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	releaseRatingText: {
		fontSize: 12,
		fontWeight: "700",
		color: "#323331",
	},
	categoryGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		paddingHorizontal: 16,
		marginBottom: 16,
	},
	categoryTile: {
		flexBasis: "47%",
		backgroundColor: "#e4e2df",
		borderRadius: 16,
		paddingVertical: 18,
		alignItems: "center",
		gap: 6,
	},
	categoryText: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#323331",
	},
	resumeBar: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginHorizontal: 16,
		padding: 10,
		borderRadius: 999,
		backgroundColor: "rgba(255, 255, 255, 0.85)",
		borderWidth: 1,
		borderColor: "rgba(179, 178, 175, 0.2)",
		marginBottom: 24,
	},
	resumeCover: {
		width: 44,
		height: 44,
		borderRadius: 22,
	},
	resumeText: {
		flex: 1,
	},
	resumeMeta: {
		fontSize: 9,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#5f5f5d",
	},
	resumeTitle: {
		fontSize: 12,
		fontWeight: "700",
		color: "#323331",
		marginTop: 2,
	},
	resumeControls: {
		alignItems: "center",
		gap: 6,
	},
	resumeProgressTrack: {
		width: 60,
		height: 4,
		borderRadius: 999,
		backgroundColor: "#e4e2df",
		overflow: "hidden",
	},
	resumeProgressFill: {
		width: "65%",
		height: "100%",
		backgroundColor: "#8c4f3b",
	},
});

export default HomeScreen;
