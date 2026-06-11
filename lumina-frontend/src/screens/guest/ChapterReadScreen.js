import React, { useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchChapterContent, clearChapterContent } from "../../redux_thunk/StorySlice";

const API_URL = 'http://192.168.10.104:5555/api';

const ChapterReadScreen = ({ navigation, route }) => {
	const { chapterId, storyId } = route.params || {};
	const dispatch = useDispatch();
	const { currentChapterContent, currentStory, currentChapters, loading } = useSelector(state => state.story);
	const { user } = useSelector(state => state.auth);
	const scrollPositionRef = useRef(0);

	const saveBookmark = async (position) => {
		if (!user || !chapterId) return;
		try {
			await fetch(`${API_URL}/bookmarks`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: user.id, chapter_id: chapterId, scroll_position: Math.round(position) }),
			});
		} catch {}
	};

	useEffect(() => {
		if (chapterId) {
			dispatch(fetchChapterContent(chapterId));
		}
		return () => {
			saveBookmark(scrollPositionRef.current);
			dispatch(clearChapterContent());
		};
	}, [dispatch, chapterId]);

	if (loading || !currentChapterContent) {
		return (
			<SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
				<ActivityIndicator size="large" color="#8B4513" />
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
						<MaterialIcons name="arrow-back" size={20} color="#888888" />
					</TouchableOpacity>

					<View style={styles.toolbarGroup}>
						<TouchableOpacity style={styles.toolbarIcon}>
							<MaterialIcons name="format-size" size={18} color="#888888" />
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
					onScroll={e => { scrollPositionRef.current = e.nativeEvent.contentOffset.y; }}
					scrollEventThrottle={500}
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
											color="#8B4513"
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
							<MaterialIcons name="bookmark" size={20} color="#888888" />
						</TouchableOpacity>
						<TouchableOpacity>
							<MaterialIcons name="list-alt" size={20} color="#888888" />
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
		backgroundColor: "#FFFFFF",
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
		backgroundColor: "rgba(245, 245, 245, 0.95)",
		alignItems: "center",
		justifyContent: "center",
	},
	toolbarGroup: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "rgba(245, 245, 245, 0.95)",
	},
	toolbarIcon: {
		padding: 4,
	},
	toolbarDivider: {
		width: 1,
		height: 16,
		backgroundColor: "#EBEBEB",
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
		borderColor: "#EBEBEB",
	},
	paletteLight: {
		backgroundColor: "#F5F5F5",
	},
	paletteSepia: {
		backgroundColor: "#F5E6C8",
	},
	paletteDark: {
		backgroundColor: "#1A1A1A",
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
		color: "#8B4513",
		marginBottom: 12,
	},
	chapterTitle: {
		fontSize: 28,
		fontWeight: "700",
		fontStyle: "italic",
		textAlign: "center",
		color: "#1A1A1A",
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
		color: "#888888",
	},
	dot: {
		width: 4,
		height: 4,
		borderRadius: 2,
		backgroundColor: "#EBEBEB",
	},
	heroImageWrap: {
		borderRadius: 16,
		overflow: "hidden",
		marginBottom: 24,
		backgroundColor: "#F5F5F5",
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
		backgroundColor: "rgba(255, 255, 255, 0.05)",
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
		color: "#8B4513",
		lineHeight: 52,
	},
	paragraphFirst: {
		flex: 1,
		fontSize: 16,
		lineHeight: 26,
		color: "#1A1A1A",
	},
	paragraph: {
		fontSize: 16,
		lineHeight: 26,
		color: "#1A1A1A",
	},
	quoteBlock: {
		padding: 16,
		borderLeftWidth: 2,
		borderLeftColor: "rgba(139, 69, 19, 0.2)",
		backgroundColor: "#F5F5F5",
		borderRadius: 12,
	},
	quoteText: {
		fontSize: 18,
		fontStyle: "italic",
		color: "#888888",
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
		color: "#888888",
	},
	nextTitle: {
		fontSize: 20,
		fontWeight: "700",
		fontStyle: "italic",
		color: "#1A1A1A",
		textAlign: "center",
	},
	nextIconWrap: {
		width: 44,
		height: 44,
		borderRadius: 22,
		borderWidth: 1,
		borderColor: "#EBEBEB",
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
		backgroundColor: "rgba(255, 255, 255, 0.95)",
		borderRadius: 999,
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderWidth: 1,
		borderColor: "#EBEBEB",
	},
	progressLabel: {
		fontSize: 10,
		fontWeight: "700",
		color: "#888888",
		width: 36,
	},
	progressTrack: {
		flex: 1,
		height: 4,
		borderRadius: 999,
		backgroundColor: "#EBEBEB",
		overflow: "hidden",
	},
	progressFill: {
		width: "45%",
		height: "100%",
		backgroundColor: "#8B4513",
	},
	progressActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
});

export default ChapterReadScreen;
