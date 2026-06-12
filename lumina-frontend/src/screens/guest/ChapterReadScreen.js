import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Dimensions,
	Alert
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchChapterContent, clearChapterContent } from "../../redux_thunk/StorySlice";
import { API_URL } from '../../config/api';

const FONT_SIZES = [14, 16, 18, 20];
const THEMES = {
	light: { bg: '#FFFFFF', text: '#1A1A1A', sub: '#888888', progressBg: 'rgba(255,255,255,0.95)' },
	sepia: { bg: '#F5E6C8', text: '#3B2A1A', sub: '#7A5C3A', progressBg: 'rgba(245,230,200,0.95)' },
	dark:  { bg: '#1A1A1A', text: '#E8E0D5', sub: '#AAAAAA', progressBg: 'rgba(26,26,26,0.95)' },
};

const ChapterReadScreen = ({ navigation, route }) => {
	const { chapterId, storyId } = route.params || {};
	const dispatch = useDispatch();
	const { currentChapterContent, currentStory, currentChapters, loading, vipBlocked, vipBlockedMessage } = useSelector(state => state.story);
	const { user } = useSelector(state => state.auth);
	const scrollPositionRef = useRef(0);
	const [progress, setProgress] = useState(0);
	const contentHeightRef = useRef(0);
	const screenHeight = Dimensions.get('window').height;

	const [fontSize, setFontSize] = useState(16);
	const [bgMode, setBgMode] = useState('light');
	const theme = THEMES[bgMode];

	const cycleFontSize = () => {
		const idx = FONT_SIZES.indexOf(fontSize);
		setFontSize(FONT_SIZES[(idx + 1) % FONT_SIZES.length]);
	};

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
			dispatch(fetchChapterContent({ chapterId, userId: user?.id }));
		}
		return () => {
			saveBookmark(scrollPositionRef.current);
			dispatch(clearChapterContent());
		};
	}, [dispatch, chapterId]);

	useEffect(() => {
		if (vipBlocked) {
			Alert.alert(
				"Chương chưa mở khóa",
				vipBlockedMessage || "Chương này chưa mở khóa. Thành viên VIP có thể đọc ngay.",
				[{ text: "Quay lại", onPress: () => navigation.goBack() }]
			);
		}
	}, [vipBlocked, navigation]);

	if (loading || (!currentChapterContent && !vipBlocked)) {
		return (
			<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg, justifyContent: "center", alignItems: "center" }]}>
				<ActivityIndicator size="large" color="#8B4513" />
			</SafeAreaView>
		);
	}

	if (vipBlocked || !currentChapterContent) return null;

	const currentIndex = currentChapters?.findIndex(c => c.id === chapterId);
	const nextChapter = (currentIndex !== -1 && currentIndex < currentChapters.length - 1)
		? currentChapters[currentIndex + 1]
		: null;

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
			<View style={styles.root}>
				<View style={styles.topBar}>
					<TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
						<MaterialIcons name="arrow-back" size={20} color="#888888" />
					</TouchableOpacity>

					<View style={styles.toolbarGroup}>
						<TouchableOpacity style={styles.toolbarIcon} onPress={cycleFontSize}>
							<MaterialIcons name="format-size" size={18} color="#888888" />
							<Text style={styles.fontSizeLabel}>{fontSize}</Text>
						</TouchableOpacity>
						<View style={styles.toolbarDivider} />
						<View style={styles.paletteRow}>
							<TouchableOpacity
								style={[styles.paletteDot, styles.paletteLight, bgMode === 'light' && styles.paletteDotActive]}
								onPress={() => setBgMode('light')}
							/>
							<TouchableOpacity
								style={[styles.paletteDot, styles.paletteSepia, bgMode === 'sepia' && styles.paletteDotActive]}
								onPress={() => setBgMode('sepia')}
							/>
							<TouchableOpacity
								style={[styles.paletteDot, styles.paletteDark, bgMode === 'dark' && styles.paletteDotActive]}
								onPress={() => setBgMode('dark')}
							/>
						</View>
					</View>
				</View>

				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					onContentSizeChange={(_, h) => { contentHeightRef.current = h; }}
					onScroll={e => {
						const offset = e.nativeEvent.contentOffset.y;
						scrollPositionRef.current = offset;
						const scrollable = contentHeightRef.current - screenHeight;
						if (scrollable > 0) setProgress(Math.min(1, offset / scrollable));
					}}
					scrollEventThrottle={200}
				>
					<View style={styles.canvas}>
						<View style={styles.chapterHeader}>
							<Text style={[styles.chapterMeta, { color: '#8B4513' }]}>Chương {currentChapterContent.chapter_number}</Text>
							<Text style={[styles.chapterTitle, { color: theme.text, fontSize: fontSize + 12 }]}>
								{currentChapterContent.title}
							</Text>
							<View style={styles.chapterStats}>
								<Text style={[styles.chapterStat, { color: theme.sub }]}>{currentStory?.title || "Đang đọc"}</Text>
							</View>
						</View>

						<View style={styles.article}>
							{currentChapterContent.content ? (
								currentChapterContent.content.split('\n').filter(p => p.trim() !== '').map((para, index) => {
									if (index === 0) {
										return (
											<View key={index} style={styles.dropCapRow}>
												<Text style={[styles.dropCap, { fontSize: fontSize + 30, lineHeight: fontSize + 36 }]}>{para.charAt(0)}</Text>
												<Text style={[styles.paragraphFirst, { fontSize, color: theme.text }]}>
													{para.substring(1)}
												</Text>
											</View>
										);
									}
									return (
										<Text key={index} style={[styles.paragraph, { fontSize, color: theme.text, lineHeight: fontSize * 1.7 }]}>
											{para}
										</Text>
									);
								})
							) : (
								<Text style={[styles.paragraph, { fontSize, color: theme.text }]}>Chương này chưa có nội dung.</Text>
							)}
						</View>

						{nextChapter && (
							<View style={styles.chapterFooter}>
								<TouchableOpacity
									style={styles.nextChapterButton}
									onPress={() => navigation.push("ChapterRead", { chapterId: nextChapter.id, storyId })}
								>
									<Text style={[styles.nextLabel, { color: theme.sub }]}>Chương kế tiếp</Text>
									<Text style={[styles.nextTitle, { color: theme.text }]}>Chương {nextChapter.chapter_number}: {nextChapter.title}</Text>
									<View style={[styles.nextIconWrap, { borderColor: bgMode === 'dark' ? '#333333' : '#EBEBEB' }]}>
										<MaterialIcons name="keyboard-arrow-down" size={24} color="#8B4513" />
									</View>
								</TouchableOpacity>
							</View>
						)}
					</View>
				</ScrollView>

				<View style={[styles.progressBar, { backgroundColor: theme.progressBg }]}>
					<Text style={[styles.progressLabel, { color: theme.sub }]}>{Math.round(progress * 100)}%</Text>
					<View style={styles.progressTrack}>
						<View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
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
	safeArea: { flex: 1 },
	root: { flex: 1 },
	topBar: {
		position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
		flexDirection: "row", alignItems: "center", justifyContent: "space-between",
		paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
	},
	iconButton: {
		width: 40, height: 40, borderRadius: 20,
		backgroundColor: "rgba(245, 245, 245, 0.95)",
		alignItems: "center", justifyContent: "center",
	},
	toolbarGroup: {
		flexDirection: "row", alignItems: "center",
		paddingHorizontal: 12, paddingVertical: 6,
		borderRadius: 999, backgroundColor: "rgba(245, 245, 245, 0.95)",
	},
	toolbarIcon: { flexDirection: "row", alignItems: "center", gap: 3, padding: 4 },
	fontSizeLabel: { fontSize: 10, fontWeight: "700", color: "#888888" },
	toolbarDivider: { width: 1, height: 16, backgroundColor: "#EBEBEB", marginHorizontal: 8 },
	paletteRow: { flexDirection: "row", gap: 6 },
	paletteDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: "#EBEBEB" },
	paletteDotActive: { borderWidth: 2, borderColor: "#8B4513" },
	paletteLight: { backgroundColor: "#F5F5F5" },
	paletteSepia: { backgroundColor: "#F5E6C8" },
	paletteDark: { backgroundColor: "#1A1A1A" },
	scrollContent: { paddingTop: 72, paddingBottom: 120 },
	canvas: { width: "100%", maxWidth: 720, alignSelf: "center", paddingHorizontal: 20 },
	chapterHeader: { alignItems: "center", marginBottom: 24 },
	chapterMeta: { fontSize: 10, fontWeight: "700", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 },
	chapterTitle: { fontWeight: "700", fontStyle: "italic", textAlign: "center", marginBottom: 12 },
	chapterStats: { flexDirection: "row", alignItems: "center", gap: 10 },
	chapterStat: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
	article: { gap: 18 },
	dropCapRow: { flexDirection: "row", gap: 8 },
	dropCap: { fontWeight: "700", color: "#8B4513" },
	paragraphFirst: { flex: 1, lineHeight: 26 },
	paragraph: {},
	chapterFooter: { marginTop: 24, alignItems: "center" },
	nextChapterButton: { alignItems: "center", gap: 8 },
	nextLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
	nextTitle: { fontSize: 20, fontWeight: "700", fontStyle: "italic", textAlign: "center" },
	nextIconWrap: {
		width: 44, height: 44, borderRadius: 22, borderWidth: 1,
		alignItems: "center", justifyContent: "center", marginTop: 4,
	},
	progressBar: {
		position: "absolute", left: 16, right: 16, bottom: 16,
		flexDirection: "row", alignItems: "center", gap: 12,
		borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14,
		borderWidth: 1, borderColor: "#EBEBEB",
	},
	progressLabel: { fontSize: 10, fontWeight: "700", width: 36 },
	progressTrack: { flex: 1, height: 4, borderRadius: 999, backgroundColor: "#EBEBEB", overflow: "hidden" },
	progressFill: { height: "100%", backgroundColor: "#8B4513" },
	progressActions: { flexDirection: "row", alignItems: "center", gap: 10 },
});

export default ChapterReadScreen;
