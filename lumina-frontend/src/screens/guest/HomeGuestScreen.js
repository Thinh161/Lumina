import React, { useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Image,
	ActivityIndicator
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchStories, fetchCategories } from "../../redux_thunk/StorySlice";

const DEFAULT_STORY_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuD00yC-OnoCjJ9ZHaMrK26WR4nYqz0nk2iS7pDgV0ssTgw8yFCTDNtMUsY1PrTvNBcw6wSxrSiSTkZTqnqAffNyZ0UIKtGPXkVOT77r7Y5TCsZMjHWTTyxy49Hp18b4ugO9E7i3qYa1gH-kS7MEW9AsnlKK7f4oUBV50yuyj9NieHkFkbdHT8t6AlHwcNHmlOj9Ne21nhGlD1SZYbDdfw3l59bzcFB8gpWyHi_X8AT90teA3r5Xw3F45xnRt2FS-wrNbF-Kja0tdXc";

const HomeGuestScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { stories, categories, loading } = useSelector((state) => state.story);

	useEffect(() => {
		dispatch(fetchStories());
		dispatch(fetchCategories());
	}, [dispatch]);

	// Phân loại truyện ra các mục (làm logic giả định tạm: lấy 3 truyện đầu làm Mới nổi bật)
	const featuredStories = stories.slice(0, 3);
	const newReleases = stories.slice(3); // Các truyện còn lại làm Mới phát hành

	if (loading && stories.length === 0) {
		return (
			<SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
				<ActivityIndicator size="large" color="#dca77c" />
			</SafeAreaView>
		);
	}

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

					{featuredStories.length > 0 ? (
						<View style={styles.featuredGrid}>
							<TouchableOpacity
								style={styles.featuredMain}
								activeOpacity={0.9}
								onPress={() => navigation.navigate("StoryDetail", { storyId: featuredStories[0]?.id })}
							>
								<Image
									source={{ uri: featuredStories[0]?.cover_image || DEFAULT_STORY_IMAGE }}
									style={styles.featuredMainImage}
								/>
								<View style={styles.featuredMainOverlay} />
								<View style={styles.featuredMainContent}>
									<Text style={styles.featuredBadge}>LỰA CHỌN BIÊN TẬP</Text>
									<Text style={styles.featuredTitle}>
										{featuredStories[0]?.title || "Đang cập nhật"}
									</Text>
									<Text style={styles.featuredSubtitle} numberOfLines={2}>
										{featuredStories[0]?.description || "Không có đoạn trích dẫn cụ thể nào cho tác phẩm này."}
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
										onPress={() => navigation.navigate("StoryDetail", { storyId: story.id })}
									>
										<Image
											source={{ uri: story?.cover_image || DEFAULT_STORY_IMAGE }}
											style={styles.featuredSideImage}
										/>
										<View style={styles.featuredSideOverlay} />
										<Text style={styles.featuredSideTitle} numberOfLines={2}>{story.title}</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					) : (
						<Text style={{ textAlign: "center", color: "#8c4f3b", marginVertical: 20 }}>
							Chưa có truyện nào
						</Text>
					)}

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
						{newReleases.length > 0 ? (
							newReleases.map((release, index) => (
								<View key={release.id || index} style={styles.releaseCard}>
									<TouchableOpacity
										style={styles.releaseCoverWrap}
										activeOpacity={0.9}
										onPress={() => navigation.navigate("StoryDetail", { storyId: release.id })}
									>
										<Image
											source={{ uri: release?.cover_image || DEFAULT_STORY_IMAGE }}
											style={styles.releaseCover}
										/>
									</TouchableOpacity>
									<Text style={styles.releaseAuthor}>{release?.author || "Đang cập nhật"}</Text>
									<Text style={styles.releaseTitle} numberOfLines={1}>{release.title}</Text>
									<View style={styles.releaseRating}>
										<MaterialIcons name="star" size={14} color="#8c4f3b" />
										<Text style={styles.releaseRatingText}>
											{release?.rating || "5.0"}
										</Text>
									</View>
								</View>
							))
						) : (
							<Text style={{ textAlign: "center", color: "#8c4f3b", marginVertical: 20 }}>
								Chưa có truyện nào
							</Text>
						)}
					</ScrollView>

					<Text style={styles.sectionTitle}>Thể Loại Phổ Biến</Text>
					<View style={styles.categoryGrid}>
						{categories.length > 0 ? (
							categories.map((category, index) => (
								<View key={category.id || index} style={styles.categoryTile}>
									<MaterialCommunityIcons
										name="book-open-page-variant"
										size={20}
										color="#8c4f3b"
									/>
									<Text style={styles.categoryText}>{category.name || category.label || "Thể loại"}</Text>
								</View>
							))
						) : (
							<Text style={{ textAlign: "center", color: "#8c4f3b", marginVertical: 20 }}>
								Chưa có thể loại nào
							</Text>
						)}
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

export default HomeGuestScreen;
