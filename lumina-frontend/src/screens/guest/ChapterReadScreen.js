import React, { useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Image,
	TouchableOpacity,
	ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchChapterContent, clearChapterContent } from "../../redux_thunk/StorySlice";

const ChapterReadScreen = ({ navigation, route }) => {
	const { chapterId, storyId } = route.params || {};
	const dispatch = useDispatch();
	const { currentChapterContent, currentStory, currentChapters, loading } = useSelector(state => state.story);

	useEffect(() => {
		if (chapterId) {
			dispatch(fetchChapterContent(chapterId));
		}
		
		return () => {
			dispatch(clearChapterContent());
		};
	}, [dispatch, chapterId]);

	if (loading || !currentChapterContent) {
		return (
			<SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
				<ActivityIndicator size="large" color="#dca77c" />
			</SafeAreaView>
		);
	}

	// Tìm chương kế tiếp
	const currentIndex = currentChapters?.findIndex(c => c.id === chapterId);
	const nextChapter = (currentIndex !== -1 && currentIndex < currentChapters.length - 1) 
		? currentChapters[currentIndex + 1] 
		: null;

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.root}>
				<View style={styles.topBar}>
					<TouchableOpacity
						style={styles.iconButton}
						onPress={() => navigation.goBack()}
					>
						<MaterialIcons name="arrow-back" size={20} color="#5f5f5d" />
					</TouchableOpacity>

					<View style={styles.toolbarGroup}>
						<TouchableOpacity style={styles.toolbarIcon}>
							<MaterialIcons name="format-size" size={18} color="#5f5f5d" />
						</TouchableOpacity>
						<View style={styles.toolbarDivider} />
						<View style={styles.paletteRow}>
							<View style={[styles.paletteDot, styles.paletteLight]} />
							<View style={[styles.paletteDot, styles.paletteSepia]} />
							<View style={[styles.paletteDot, styles.paletteDark]} />
						</View>
					</View>
				</View>

				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.canvas}>
						<View style={styles.chapterHeader}>
							<Text style={styles.chapterMeta}>Chương {currentChapterContent.chapter_number}</Text>
							<Text style={styles.chapterTitle}>
								{currentChapterContent.title}
							</Text>
							<View style={styles.chapterStats}>
								<Text style={styles.chapterStat}>{currentStory?.title || "Đang đọc"}</Text>
							</View>
						</View>

						<View style={styles.article}>
							{/* Tách nội dung chương theo từng đoạn */}
							{currentChapterContent.content ? (
								currentChapterContent.content.split('\n').filter(p => p.trim() !== '').map((para, index) => {
									if (index === 0) {
										return (
											<View key={index} style={styles.dropCapRow}>
												<Text style={styles.dropCap}>{para.charAt(0)}</Text>
												<Text style={styles.paragraphFirst}>
													{para.substring(1)}
												</Text>
											</View>
										);
									}
									return (
										<Text key={index} style={styles.paragraph}>
											{para}
										</Text>
									);
								})
							) : (
								<Text style={styles.paragraph}>Chương này chưa có nội dung.</Text>
							)}
						</View>

						{nextChapter && (
							<View style={styles.chapterFooter}>
								<TouchableOpacity 
									style={styles.nextChapterButton}
									onPress={() => navigation.replace("ChapterRead", { chapterId: nextChapter.id, storyId })}
								>
									<Text style={styles.nextLabel}>Chương kế tiếp</Text>
									<Text style={styles.nextTitle}>Chương {nextChapter.chapter_number}: {nextChapter.title}</Text>
									<View style={styles.nextIconWrap}>
										<MaterialIcons
											name="keyboard-arrow-down"
											size={24}
											color="#8c4f3b"
										/>
									</View>
								</TouchableOpacity>
							</View>
						)}
					</View>
				</ScrollView>

				<View style={styles.progressBar}>
					<Text style={styles.progressLabel}>45%</Text>
					<View style={styles.progressTrack}>
						<View style={styles.progressFill} />
					</View>
					<View style={styles.progressActions}>
						<TouchableOpacity>
							<MaterialIcons name="bookmark" size={20} color="#5f5f5d" />
						</TouchableOpacity>
						<TouchableOpacity>
							<MaterialIcons name="list-alt" size={20} color="#5f5f5d" />
						</TouchableOpacity>
					</View>
				</View>
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
	},
	topBar: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 8,
	},
	iconButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(246, 243, 241, 0.85)",
		alignItems: "center",
		justifyContent: "center",
	},
	toolbarGroup: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "rgba(246, 243, 241, 0.85)",
	},
	toolbarIcon: {
		padding: 4,
	},
	toolbarDivider: {
		width: 1,
		height: 16,
		backgroundColor: "rgba(179, 178, 175, 0.4)",
		marginHorizontal: 8,
	},
	paletteRow: {
		flexDirection: "row",
		gap: 6,
	},
	paletteDot: {
		width: 18,
		height: 18,
		borderRadius: 9,
		borderWidth: 1,
		borderColor: "rgba(179, 178, 175, 0.4)",
	},
	paletteLight: {
		backgroundColor: "#fcf9f7",
	},
	paletteSepia: {
		backgroundColor: "#f4ebd0",
	},
	paletteDark: {
		backgroundColor: "#323331",
	},
	scrollContent: {
		paddingTop: 72,
		paddingBottom: 120,
	},
	canvas: {
		width: "100%",
		maxWidth: 720,
		alignSelf: "center",
		paddingHorizontal: 20,
	},
	chapterHeader: {
		alignItems: "center",
		marginBottom: 24,
	},
	chapterMeta: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 3,
		textTransform: "uppercase",
		color: "#8c4f3b",
		marginBottom: 12,
	},
	chapterTitle: {
		fontSize: 28,
		fontWeight: "700",
		fontStyle: "italic",
		textAlign: "center",
		color: "#323331",
		marginBottom: 12,
	},
	chapterStats: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	chapterStat: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#5f5f5d",
	},
	dot: {
		width: 4,
		height: 4,
		borderRadius: 2,
		backgroundColor: "#b3b2af",
	},
	heroImageWrap: {
		borderRadius: 16,
		overflow: "hidden",
		marginBottom: 24,
		backgroundColor: "#f6f3f1",
	},
	heroImage: {
		width: "100%",
		height: 200,
	},
	heroOverlay: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		backgroundColor: "rgba(252, 249, 247, 0.12)",
	},
	article: {
		gap: 18,
	},
	dropCapRow: {
		flexDirection: "row",
		gap: 8,
	},
	dropCap: {
		fontSize: 46,
		fontWeight: "700",
		color: "#8c4f3b",
		lineHeight: 52,
	},
	paragraphFirst: {
		flex: 1,
		fontSize: 16,
		lineHeight: 26,
		color: "#3f403e",
	},
	paragraph: {
		fontSize: 16,
		lineHeight: 26,
		color: "#3f403e",
	},
	quoteBlock: {
		padding: 16,
		borderLeftWidth: 2,
		borderLeftColor: "rgba(140, 79, 59, 0.3)",
		backgroundColor: "rgba(246, 243, 241, 0.6)",
		borderRadius: 12,
	},
	quoteText: {
		fontSize: 18,
		fontStyle: "italic",
		color: "#5f5f5d",
		lineHeight: 26,
	},
	splitRow: {
		gap: 16,
	},
	splitText: {
		flex: 1,
	},
	splitImageWrap: {
		alignSelf: "center",
		width: "70%",
		borderRadius: 16,
		overflow: "hidden",
	},
	splitImage: {
		width: "100%",
		height: 220,
	},
	chapterFooter: {
		marginTop: 24,
		alignItems: "center",
	},
	nextChapterButton: {
		alignItems: "center",
		gap: 8,
	},
	nextLabel: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#5f5f5d",
	},
	nextTitle: {
		fontSize: 20,
		fontWeight: "700",
		fontStyle: "italic",
		color: "#323331",
		textAlign: "center",
	},
	nextIconWrap: {
		width: 44,
		height: 44,
		borderRadius: 22,
		borderWidth: 1,
		borderColor: "rgba(179, 178, 175, 0.4)",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 4,
	},
	progressBar: {
		position: "absolute",
		left: 16,
		right: 16,
		bottom: 16,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		backgroundColor: "rgba(246, 243, 241, 0.9)",
		borderRadius: 999,
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderWidth: 1,
		borderColor: "rgba(179, 178, 175, 0.2)",
	},
	progressLabel: {
		fontSize: 10,
		fontWeight: "700",
		color: "#5f5f5d",
		width: 36,
	},
	progressTrack: {
		flex: 1,
		height: 4,
		borderRadius: 999,
		backgroundColor: "rgba(179, 178, 175, 0.3)",
		overflow: "hidden",
	},
	progressFill: {
		width: "45%",
		height: "100%",
		backgroundColor: "#8c4f3b",
	},
	progressActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
});

export default ChapterReadScreen;
