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

import { API_URL } from '../../config/api';
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
	// Bookmark / tiếp tục đọc
	const [bookmark, setBookmark] = useState(null);
	// Xem tất cả chương
	const [showAllChapters, setShowAllChapters] = useState(false);
	const CHAPTERS_PREVIEW = 5;

	const loadComments = useCallback(async () => {
		if (!storyId) return;
		try {
			const data = await fetch(`${API_URL}/stories/${storyId}/comments`).then(r => r.json());
			if (data.status === "success") setComments(data.data);
		} catch {}
	}, [storyId]);

	const loadBookmark = useCallback(async () => {
		if (!user || !storyId) return;
		try {
			const data = await fetch(`${API_URL}/bookmarks/${user.id}/${storyId}`).then(r => r.json());
			if (data.status === "success" && data.data) setBookmark(data.data);
		} catch {}
	}, [user, storyId]);

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

	const handleDeleteComment = (commentId) => {
		Alert.alert("Xóa bình luận", "Bạn muốn xóa bình luận này?", [
			{ text: "Hủy", style: "cancel" },
			{
				text: "Xóa", style: "destructive",
				onPress: async () => {
					try {
						await fetch(`${API_URL}/comments/${commentId}/${user.id}`, { method: 'DELETE' });
						setComments(prev => prev.filter(c => c.id !== commentId));
					} catch {}
				}
			}
		]);
	};

	useEffect(() => {
		if (storyId) {
			dispatch(fetchStoryDetails(storyId));
			dispatch(fetchChapters(storyId));
			loadComments();
			loadBookmark();
			fetch(`${API_URL}/stories/${storyId}/view`, { method: 'PUT' }).catch(() => {});
		}
		return () => {
			dispatch(clearCurrentStory());
		};
	}, [dispatch, storyId, loadComments, loadBookmark]);

	if (loading || !currentStory) {
		return (
			<SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
				<ActivityIndicator size="large" color="#8B4513" />
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
						<MaterialIcons name="arrow-back" size={22} color="#8B4513" />
					</TouchableOpacity>
					<Text style={styles.topBarTitle}>App Đọc Truyện Online</Text>
					<TouchableOpacity style={styles.topBarButton}>
						<MaterialIcons name="share" size={20} color="#8B4513" />
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
									<MaterialIcons name="person" size={14} color="#888888" />
								</View>
								<Text style={styles.authorText}>Tác giả: {currentStory.author_name || "Đang cập nhật"}</Text>
							</View>

							<View style={styles.metaPills}>
								<View style={styles.metaPill}>
									<MaterialIcons name="star" size={16} color="#8B4513" />
									<Text style={styles.metaPillText}>
									{comments.length > 0 ? (comments.reduce((s, c) => s + (c.rating || 0), 0) / comments.filter(c => c.rating).length || 0).toFixed(1) : "—"}
								</Text>
								</View>
								<View style={styles.metaPill}>
									<MaterialIcons name="schedule" size={16} color="#8B4513" />
									<Text style={styles.metaPillText}>Đang ra</Text>
								</View>
								<View style={styles.metaPill}>
									<MaterialIcons name="visibility" size={16} color="#8B4513" />
									<Text style={styles.metaPillText}>{currentStory.views || 0} lượt xem</Text>
								</View>
							</View>
						</View>
					</View>

					<View style={styles.actionsRow}>
						{bookmark ? (
							<TouchableOpacity
								style={[styles.actionButton, styles.actionPrimary]}
								onPress={() => navigation.navigate("ChapterRead", { chapterId: bookmark.chapter_id, storyId: currentStory.id })}
							>
								<MaterialIcons name="bookmark" size={18} color="#FFFFFF" />
								<Text style={styles.actionPrimaryText}>Tiếp tục Chương {bookmark.chapter_number}</Text>
							</TouchableOpacity>
						) : (
							<TouchableOpacity
								style={[styles.actionButton, styles.actionPrimary]}
								onPress={() => currentChapters.length > 0 && navigation.navigate("ChapterRead", { chapterId: currentChapters[0].id, storyId: currentStory.id })}
							>
								<MaterialIcons name="menu-book" size={18} color="#FFFFFF" />
								<Text style={styles.actionPrimaryText}>Đọc Ngay</Text>
							</TouchableOpacity>
						)}
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
								color={isInLibrary ? "#8B4513" : "#1A1A1A"}
							/>
							<Text style={[styles.actionGhostText, isInLibrary && { color: "#8B4513" }]}>
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
									(showAllChapters ? currentChapters : currentChapters.slice(0, CHAPTERS_PREVIEW)).map((chapter) => (
										<TouchableOpacity
											key={chapter.id}
											style={[
												styles.chapterItem,
												!chapter.is_vip && styles.chapterItemOpen,
												chapter.is_vip && styles.chapterItemLocked,
											]}
											onPress={() => {
											if (chapter.is_vip && !user?.is_vip) {
												Alert.alert("Nội dung VIP", "Chương này dành riêng cho thành viên VIP. Hãy nâng cấp tài khoản để đọc.");
												return;
											}
											navigation.navigate("ChapterRead", { chapterId: chapter.id, storyId: currentStory.id });
										}}
										>
											<View style={{ flex: 1 }}>
												<Text style={[styles.chapterMeta, !chapter.is_vip && styles.chapterMetaOpen]}>
													Chương {chapter.chapter_number}
												</Text>
												<Text style={styles.chapterTitle}>{chapter.title}</Text>
											</View>
											{!chapter.is_vip ? (
												<MaterialIcons name="lock-open" size={18} color="#8B4513" />
											) : (
												<MaterialIcons name="lock" size={18} color={user?.is_vip ? "#8B4513" : "#BBBBBB"} />
											)}
										</TouchableOpacity>
									))
								) : (
									<Text style={{ textAlign: "center", color: "#888888", marginVertical: 10 }}>
										Truyện chưa cập nhật chương nào.
									</Text>
								)}
							</View>

							{currentChapters.length > CHAPTERS_PREVIEW && (
								<TouchableOpacity style={styles.viewAllButton} onPress={() => setShowAllChapters(!showAllChapters)}>
									<Text style={styles.viewAllText}>
										{showAllChapters ? `Thu gọn` : `Xem tất cả ${currentChapters.length} chương`}
									</Text>
									<MaterialIcons name={showAllChapters ? "expand-less" : "expand-more"} size={18} color="#8B4513" />
								</TouchableOpacity>
							)}
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
											<MaterialIcons name={n <= rating ? "star" : "star-border"} size={22} color="#8B4513" />
										</TouchableOpacity>
									))}
									<Text style={styles.ratingLabel}>{rating}/5</Text>
								</View>
								<View style={styles.commentRow}>
									<TextInput
										style={styles.commentInput}
										placeholder={user ? "Viết bình luận..." : "Đăng nhập để bình luận"}
										placeholderTextColor="#BBBBBB"
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
												<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
													{c.rating && (
														<View style={styles.commentRatingRow}>
															{Array.from({ length: c.rating }).map((_, i) => (
																<MaterialIcons key={i} name="star" size={11} color="#8B4513" />
															))}
														</View>
													)}
													{user?.id === c.user_id && (
														<TouchableOpacity onPress={() => handleDeleteComment(c.id)}>
															<MaterialIcons name="delete-outline" size={16} color="#D32F2F" />
														</TouchableOpacity>
													)}
												</View>
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
						<MaterialIcons name="play-arrow" size={18} color="#FFFFFF" />
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
	root: { flex: 1 },
	topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0", backgroundColor: "#FFFFFF" },
	topBarButton: { padding: 6 },
	topBarTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
	scrollContent: { paddingBottom: 200 },
	hero: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, gap: 16 },
	coverWrap: { position: "relative", width: "50%", alignSelf: "center" },
	coverShadow: { display: "none" },
	coverImage: { width: "100%", aspectRatio: 2 / 3, borderRadius: 12 },
	badge: { position: "absolute", top: 8, right: 8, backgroundColor: "#F2E8E3", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
	badgeText: { fontSize: 10, fontWeight: "700", color: "#8B4513" },
	metaSection: { gap: 8, alignItems: "center" },
	genre: { fontSize: 11, fontWeight: "700", color: "#8B4513", backgroundColor: "#F2E8E3", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
	storyTitle: { fontSize: 22, fontWeight: "800", color: "#1A1A1A", textAlign: "center" },
	authorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
	authorIcon: { display: "none" },
	authorText: { fontSize: 13, color: "#888888" },
	metaPills: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
	metaPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F5F5F5", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
	metaPillText: { fontSize: 12, color: "#1A1A1A" },
	actionsRow: { paddingHorizontal: 16, gap: 10 },
	actionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, paddingVertical: 13 },
	actionPrimary: { backgroundColor: "#8B4513" },
	actionPrimaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
	actionButtonGhost: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, paddingVertical: 13, borderWidth: 1, borderColor: "#EBEBEB", backgroundColor: "#F5F5F5" },
	actionButtonSaved: { borderColor: "#8B4513", backgroundColor: "#F2E8E3" },
	actionGhostText: { color: "#1A1A1A", fontSize: 14, fontWeight: "600" },
	contentRow: { paddingHorizontal: 16, paddingTop: 20, gap: 20 },
	synopsisSection: { gap: 10 },
	sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
	sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
	synopsisText: { fontSize: 14, color: "#555555", lineHeight: 22 },
	tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
	tagChip: { backgroundColor: "#F5F5F5", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
	tagText: { fontSize: 11, color: "#888888" },
	chapterSection: { gap: 10 },
	chapterCount: { fontSize: 12, color: "#8B4513", fontWeight: "700" },
	chapterList: { gap: 6 },
	chapterItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 10, backgroundColor: "#FAFAFA", borderWidth: 1, borderColor: "#F0F0F0" },
	chapterItemOpen: { borderLeftWidth: 3, borderLeftColor: "#8B4513" },
	chapterItemLocked: { opacity: 0.5 },
	chapterMeta: { fontSize: 11, color: "#AAAAAA" },
	chapterMetaOpen: { color: "#8B4513" },
	chapterTitle: { fontSize: 13, fontWeight: "600", color: "#1A1A1A", marginTop: 2 },
	viewAllButton: { paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
	viewAllText: { fontSize: 13, fontWeight: "700", color: "#8B4513" },
	commentsSection: { marginTop: 0, backgroundColor: "#FAFAFA", borderRadius: 12, padding: 14, gap: 12, borderWidth: 1, borderColor: "#F0F0F0" },
	commentInputWrap: { gap: 8 },
	starRow: { flexDirection: "row", alignItems: "center", gap: 4 },
	ratingLabel: { fontSize: 12, color: "#8B4513", marginLeft: 4, fontWeight: "700" },
	commentRow: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
	commentInput: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1, borderColor: "#EBEBEB", paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: "#1A1A1A", maxHeight: 80 },
	sendBtn: { backgroundColor: "#8B4513", borderRadius: 10, width: 38, height: 38, alignItems: "center", justifyContent: "center" },
	sendBtnDisabled: { opacity: 0.4 },
	noComments: { fontSize: 13, color: "#BBBBBB", textAlign: "center", paddingVertical: 12 },
	commentItem: { flexDirection: "row", gap: 10 },
	commentAvatar: { width: 36, height: 36, borderRadius: 18, marginTop: 2 },
	commentBody: { flex: 1, gap: 3 },
	commentTop: { flexDirection: "row", alignItems: "center", gap: 6 },
	commentName: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
	commentRatingRow: { flexDirection: "row" },
	commentText: { fontSize: 13, color: "#555555", lineHeight: 18 },
	commentTime: { fontSize: 10, color: "#BBBBBB" },
	miniPlayer: { position: "absolute", right: 16, bottom: 80, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#EBEBEB", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
	miniCover: { width: 40, height: 40, borderRadius: 8 },
	miniText: { flex: 1 },
	miniMeta: { fontSize: 10, color: "#8B4513", fontWeight: "700" },
	miniTitle: { fontSize: 12, fontWeight: "600", color: "#1A1A1A" },
	miniPlay: { backgroundColor: "#8B4513", padding: 8, borderRadius: 8 },
});

export default StoryDetailScreen;
