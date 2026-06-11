import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Image,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	TextInput,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchStoryDetails, fetchChapters, clearCurrentStory } from "../../redux_thunk/StorySlice";
import { addToLibrary, removeFromLibrary, fetchLibrary } from "../../redux_thunk/LibrarySlice";

const API_URL = 'http://10.106.42.58:5555/api';
const DEFAULT_STORY_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuBvQzYRtYjISxgN15SaT96ZzRp0uhBsLi8dtlvBxtguAe6xQdLmGTT2DPmYgyXdBP9vHMV4o_Y-0WGc0cf6j7bsZDbN4nbabvlvhk20QmITP7ODv5EnXRTGOfvT6ng5cYr2q7IczdQCFVBcnqUent2OjsU41hp7ym-gHYBYq3eBKXIb7MKUQvkoAZctRNEzkIKwQl2okLEZv0nlLr7XzWyP7sNX8e_kGu814cdSoyr5V2dMljfbJGiav9so7PC7k4udoHlX6nakoD8";

const StoryDetailScreen = ({ navigation, route }) => {
	const { storyId } = route.params || {};
	const dispatch = useDispatch();
	const { currentStory, currentChapters, loading } = useSelector(state => state.story);
	const { user } = useSelector(state => state.auth);
	const { items: libraryItems } = useSelector(state => state.library);
	const [libraryLoading, setLibraryLoading] = useState(false);

	const isInLibrary = libraryItems.some(item => item.id === storyId);

	// Comments
	const [comments, setComments] = useState([]);
	const [commentText, setCommentText] = useState('');
	const [rating, setRating] = useState(5);
	const [postingComment, setPostingComment] = useState(false);

	const loadComments = useCallback(async () => {
		if (!storyId) return;
		try {
			const data = await fetch(`${API_URL}/stories/${storyId}/comments`).then(r => r.json());
			if (data.status === "success") setComments(data.data);
		} catch {}
	}, [storyId]);

	const handlePostComment = async () => {
		if (!user) { Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để bình luận."); return; }
		if (!commentText.trim()) return;
		setPostingComment(true);
		try {
			const res = await fetch(`${API_URL}/comments`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: user.id, story_id: storyId, content: commentText.trim(), rating }),
			}).then(r => r.json());
			if (res.status === "success") {
				setCommentText('');
				loadComments();
			}
		} finally { setPostingComment(false); }
	};

	useEffect(() => {
		if (storyId) {
			dispatch(fetchStoryDetails(storyId));
			dispatch(fetchChapters(storyId));
			loadComments();
		}
		
		// Clean up khi rời khỏi trang màn hình
		return () => {
			dispatch(clearCurrentStory());
		};
	}, [dispatch, storyId, loadComments]);

	if (loading || !currentStory) {
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
					<TouchableOpacity
						style={styles.topBarButton}
						onPress={() => navigation.goBack()}
					>
						<MaterialIcons name="arrow-back" size={22} color="#8c4f3b" />
					</TouchableOpacity>
					<Text style={styles.topBarTitle}>App Đọc Truyện Online</Text>
					<TouchableOpacity style={styles.topBarButton}>
						<MaterialIcons name="share" size={20} color="#8c4f3b" />
					</TouchableOpacity>
				</View>

				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.hero}>
						<View style={styles.coverWrap}>
							<View style={styles.coverShadow} />
							<Image
								source={{
									uri: currentStory.cover_image || DEFAULT_STORY_IMAGE,
								}}
								style={styles.coverImage}
							/>
							<View style={styles.badge}>
								<Text style={styles.badgeText}>{currentStory.status === 'published' ? 'ĐÃ PHÁT HÀNH' : currentStory.status.toUpperCase()}</Text>
							</View>
						</View>

						<View style={styles.metaSection}>
							<Text style={styles.genre}>{currentStory.category_name?.toUpperCase() || "THỂ LOẠI"}</Text>
							<Text style={styles.storyTitle}>{currentStory.title}</Text>
							<View style={styles.authorRow}>
								<View style={styles.authorIcon}>
									<MaterialIcons name="person" size={14} color="#5f5f5d" />
								</View>
								<Text style={styles.authorText}>Tác giả: {currentStory.author_name || "Đang cập nhật"}</Text>
							</View>

							<View style={styles.metaPills}>
								<View style={styles.metaPill}>
									<MaterialIcons name="star" size={16} color="#8c4f3b" />
									<Text style={styles.metaPillText}>4.9</Text>
								</View>
								<View style={styles.metaPill}>
									<MaterialIcons name="schedule" size={16} color="#8c4f3b" />
									<Text style={styles.metaPillText}>Đang ra</Text>
								</View>
								<View style={styles.metaPill}>
									<MaterialIcons name="visibility" size={16} color="#8c4f3b" />
									<Text style={styles.metaPillText}>{currentStory.views || 0} lượt xem</Text>
								</View>
							</View>
						</View>
					</View>

					<View style={styles.actionsRow}>
						<TouchableOpacity 
							style={[styles.actionButton, styles.actionPrimary]}
							onPress={() => currentChapters.length > 0 && navigation.navigate("ChapterRead", { chapterId: currentChapters[0].id, storyId: currentStory.id })}
						>
							<MaterialIcons name="menu-book" size={18} color="#fff7f5" />
							<Text style={styles.actionPrimaryText}>Đọc Ngay</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.actionButtonGhost, isInLibrary && styles.actionButtonSaved]}
							disabled={libraryLoading}
							onPress={async () => {
								if (!user) {
									Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để lưu truyện vào thư viện.");
									return;
								}
								setLibraryLoading(true);
								try {
									if (isInLibrary) {
										await dispatch(removeFromLibrary({ user_id: user.id, story_id: storyId })).unwrap();
									} else {
										await dispatch(addToLibrary({ user_id: user.id, story_id: storyId })).unwrap();
										dispatch(fetchLibrary(user.id));
									}
								} finally {
									setLibraryLoading(false);
								}
							}}
						>
							<MaterialIcons
								name={isInLibrary ? "bookmark" : "bookmark-border"}
								size={18}
								color={isInLibrary ? "#8c4f3b" : "#323331"}
							/>
							<Text style={[styles.actionGhostText, isInLibrary && { color: "#8c4f3b" }]}>
								{libraryLoading ? "..." : isInLibrary ? "Đã Lưu" : "Lưu Truyện"}
							</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.contentRow}>
						<View style={styles.synopsisSection}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Tóm Tắt Nội Dung</Text>
								<MaterialCommunityIcons
									name="auto-fix"
									size={18}
									color="#eda189"
								/>
							</View>
							<Text style={styles.synopsisText}>
								{currentStory.description || "Chưa có tóm tắt nội dung cho truyện này."}
							</Text>

							<View style={styles.tagRow}>
								{[
									`#${currentStory.category_name || "Novel"}`,
									"#Lumina"
								].map((tag) => (
									<View key={tag} style={styles.tagChip}>
										<Text style={styles.tagText}>{tag}</Text>
									</View>
								))}
							</View>
						</View>

						<View style={styles.chapterSection}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Danh Sách Chương</Text>
								<Text style={styles.chapterCount}>{currentChapters.length} CHƯƠNG</Text>
							</View>
							<View style={styles.chapterList}>
								{currentChapters.length > 0 ? (
									currentChapters.map((chapter) => (
										<TouchableOpacity
											key={chapter.id}
											style={[
												styles.chapterItem,
												!chapter.is_vip && styles.chapterItemOpen,
												chapter.is_vip && styles.chapterItemLocked,
											]}
											onPress={() => navigation.navigate("ChapterRead", { chapterId: chapter.id, storyId: currentStory.id })}
										>
											<View>
												<Text
													style={[
														styles.chapterMeta,
														!chapter.is_vip && styles.chapterMetaOpen,
													]}
												>
													Chương {chapter.chapter_number}
												</Text>
												<Text style={styles.chapterTitle}>{chapter.title}</Text>
											</View>
											{!chapter.is_vip ? (
												<MaterialIcons name="lock-open" size={18} color="#8c4f3b" />
											) : (
												<MaterialIcons name="lock" size={18} color="#b3b2af" />
											)}
										</TouchableOpacity>
									))
								) : (
									<Text style={{ textAlign: "center", color: "#8c4f3b", marginVertical: 10 }}>
										Truyện chưa cập nhật chương nào.
									</Text>
								)}
							</View>

							<TouchableOpacity style={styles.viewAllButton}>
								<Text style={styles.viewAllText}>Xem Tất Cả Chương</Text>
							</TouchableOpacity>
						</View>

						{/* === BÌNH LUẬN === */}
						<View style={styles.commentsSection}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Bình Luận</Text>
								<Text style={styles.chapterCount}>{comments.length}</Text>
							</View>

							{/* Nhập bình luận */}
							<View style={styles.commentInputWrap}>
								<View style={styles.starRow}>
									{[1,2,3,4,5].map(n => (
										<TouchableOpacity key={n} onPress={() => setRating(n)}>
											<MaterialIcons name={n <= rating ? "star" : "star-border"} size={22} color="#dca77c" />
										</TouchableOpacity>
									))}
									<Text style={styles.ratingLabel}>{rating}/5</Text>
								</View>
								<View style={styles.commentRow}>
									<TextInput
										style={styles.commentInput}
										placeholder={user ? "Viết bình luận..." : "Đăng nhập để bình luận"}
										placeholderTextColor="#b3b2af"
										value={commentText}
										onChangeText={setCommentText}
										editable={!!user}
										multiline
									/>
									<TouchableOpacity
										style={[styles.sendBtn, (!commentText.trim() || postingComment) && styles.sendBtnDisabled]}
										onPress={handlePostComment}
										disabled={!commentText.trim() || postingComment}
									>
										{postingComment
											? <ActivityIndicator size="small" color="#fff" />
											: <MaterialIcons name="send" size={18} color="#fff" />
										}
									</TouchableOpacity>
								</View>
							</View>

							{/* Danh sách bình luận */}
							{comments.length === 0 ? (
								<Text style={styles.noComments}>Chưa có bình luận nào. Hãy là người đầu tiên!</Text>
							) : (
								comments.map(c => (
									<View key={c.id} style={styles.commentItem}>
										<Image source={{ uri: c.avatar || "https://i.pravatar.cc/150?img=5" }} style={styles.commentAvatar} />
										<View style={styles.commentBody}>
											<View style={styles.commentTop}>
												<Text style={styles.commentName}>{c.full_name || c.username}</Text>
												{c.rating && (
													<View style={styles.commentRatingRow}>
														{Array.from({ length: c.rating }).map((_, i) => (
															<MaterialIcons key={i} name="star" size={11} color="#dca77c" />
														))}
													</View>
												)}
											</View>
											<Text style={styles.commentText}>{c.content}</Text>
											<Text style={styles.commentTime}>{new Date(c.created_at).toLocaleDateString("vi-VN")}</Text>
										</View>
									</View>
								))
							)}
						</View>
					</View>
				</ScrollView>


				<View style={styles.miniPlayer}>
					<Image
						source={{
							uri:
								"https://lh3.googleusercontent.com/aida-public/AB6AXuCeeyg722x5RHj-DcYj8XGkvzSA40ucCQHiZje0wgaWLqnBkyfizrlzb4a9GXszfEV4QJ6pTaTVDH97whWXwikxQegPGjJSEvRm5-oN6oyWtEVP_alY_JJOG3ESkuDuHPAh9u5eyMJG3te6uEjn2F1gItpWsV4na7-nTm7R7o8uuepd34ZfS7A67QoczTafPRWiKQ9zlz40-QrWQKVWpePjUUugWEQqEemASXODSlTPucUqO_ernK8SeF0pUMdX-FaT9iaA-V6uiz0",
						}}
						style={styles.miniCover}
					/>
					<View style={styles.miniText}>
						<Text style={styles.miniMeta}>TIẾP TỤC ĐỌC</Text>
						<Text style={styles.miniTitle}>Chương 02: Lời Nguyền...</Text>
					</View>
					<TouchableOpacity style={styles.miniPlay}>
						<MaterialIcons name="play-arrow" size={18} color="#fff7f5" />
					</TouchableOpacity>
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
		position: "relative",
	},
	topBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(179, 178, 175, 0.2)",
		backgroundColor: "#fcf9f7",
	},
	topBarButton: {
		padding: 6,
	},
	topBarTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#323331",
	},
	scrollContent: {
		paddingBottom: 200,
	},
	hero: {
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 24,
		gap: 20,
	},
	coverWrap: {
		position: "relative",
		width: "60%",
	},
	coverShadow: {
		position: "absolute",
		top: -8,
		left: -8,
		width: "100%",
		height: "100%",
		backgroundColor: "#f6f3f1",
		borderRadius: 16,
		transform: [{ rotate: "3deg" }],
	},
	coverImage: {
		width: "100%",
		aspectRatio: 2 / 3,
		borderRadius: 16,
	},
	badge: {
		position: "absolute",
		top: 12,
		right: 12,
		backgroundColor: "rgba(255, 255, 255, 0.8)",
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	badgeText: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 1,
		color: "#8c4f3b",
	},
	metaSection: {
		gap: 12,
	},
	genre: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 2.5,
		color: "#8c4f3b",
	},
	storyTitle: {
		fontSize: 30,
		fontWeight: "700",
		color: "#323331",
	},
	authorRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	authorIcon: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "#e4e2df",
		alignItems: "center",
		justifyContent: "center",
	},
	authorText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#5f5f5d",
	},
	metaPills: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	metaPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: "#f6f3f1",
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	metaPillText: {
		fontSize: 11,
		fontWeight: "700",
		color: "#323331",
	},
	actionsRow: {
		paddingHorizontal: 16,
		gap: 12,
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		borderRadius: 999,
		paddingVertical: 14,
	},
	actionPrimary: {
		backgroundColor: "#8c4f3b",
	},
	actionPrimaryText: {
		color: "#fff7f5",
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
	},
	actionButtonGhost: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		borderRadius: 999,
		paddingVertical: 14,
		borderWidth: 1,
		borderColor: "rgba(179, 178, 175, 0.3)",
		backgroundColor: "#e4e2df",
	},
	actionButtonSaved: {
		borderColor: "rgba(140,79,59,0.4)",
		backgroundColor: "rgba(140,79,59,0.08)",
	},
	actionGhostText: {
		color: "#323331",
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 1.5,
		textTransform: "uppercase",
	},
	contentRow: {
		paddingHorizontal: 16,
		paddingTop: 24,
		gap: 24,
	},
	synopsisSection: {
		gap: 16,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(179, 178, 175, 0.2)",
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#323331",
	},
	synopsisText: {
		fontSize: 14,
		color: "#5f5f5d",
		lineHeight: 22,
	},
	tagRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	tagChip: {
		backgroundColor: "#f6f3f1",
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	tagText: {
		fontSize: 11,
		fontWeight: "600",
		color: "#5f5f5d",
	},
	chapterSection: {
		gap: 16,
	},
	chapterCount: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 2,
		color: "#8c4f3b",
	},
	chapterList: {
		gap: 8,
	},
	chapterItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 14,
		borderRadius: 12,
		backgroundColor: "#fcf9f7",
	},
	chapterItemOpen: {
		borderLeftWidth: 2,
		borderLeftColor: "#8c4f3b",
		backgroundColor: "#f6f3f1",
	},
	chapterItemLocked: {
		opacity: 0.65,
	},
	chapterMeta: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#7b7b78",
	},
	chapterMetaOpen: {
		color: "#8c4f3b",
	},
	chapterTitle: {
		fontSize: 14,
		fontWeight: "700",
		color: "#323331",
		marginTop: 4,
	},
	viewAllButton: {
		paddingVertical: 12,
	},
	viewAllText: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#8c4f3b",
		textAlign: "center",
	},
	commentsSection: {
		marginTop: 8,
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 16,
		gap: 12,
	},
	commentInputWrap: { gap: 8 },
	starRow: { flexDirection: "row", alignItems: "center", gap: 4 },
	ratingLabel: { fontSize: 12, color: "#8c4f3b", marginLeft: 4, fontWeight: "700" },
	commentRow: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
	commentInput: {
		flex: 1, backgroundColor: "#f6f3f1", borderRadius: 10,
		paddingHorizontal: 12, paddingVertical: 8, fontSize: 13,
		color: "#323331", maxHeight: 80,
	},
	sendBtn: {
		backgroundColor: "#8c4f3b", borderRadius: 999,
		width: 38, height: 38, alignItems: "center", justifyContent: "center",
	},
	sendBtnDisabled: { opacity: 0.4 },
	noComments: { fontSize: 13, color: "#b3b2af", textAlign: "center", paddingVertical: 12 },
	commentItem: { flexDirection: "row", gap: 10 },
	commentAvatar: { width: 36, height: 36, borderRadius: 18, marginTop: 2 },
	commentBody: { flex: 1, gap: 3 },
	commentTop: { flexDirection: "row", alignItems: "center", gap: 6 },
	commentName: { fontSize: 13, fontWeight: "700", color: "#323331" },
	commentRatingRow: { flexDirection: "row" },
	commentText: { fontSize: 13, color: "#5f5f5d", lineHeight: 18 },
	commentTime: { fontSize: 10, color: "#b3b2af" },
	miniPlayer: {
		position: "absolute",
		right: 16,
		bottom: 96,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		backgroundColor: "rgba(255, 255, 255, 0.7)",
		borderRadius: 16,
		padding: 12,
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.6)",
	},
	miniCover: {
		width: 44,
		height: 44,
		borderRadius: 8,
	},
	miniText: {
		flex: 1,
	},
	miniMeta: {
		fontSize: 9,
		fontWeight: "700",
		letterSpacing: 2,
		color: "#8c4f3b",
	},
	miniTitle: {
		fontSize: 12,
		fontWeight: "700",
		color: "#323331",
	},
	miniPlay: {
		backgroundColor: "#8c4f3b",
		padding: 8,
		borderRadius: 999,
	},
});

export default StoryDetailScreen;
