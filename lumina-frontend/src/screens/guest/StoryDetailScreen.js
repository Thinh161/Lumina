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
	Share,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchStoryDetails, fetchChapters, clearCurrentStory } from "../../redux_thunk/StorySlice";
import { addToLibrary, removeFromLibrary, fetchLibrary } from "../../redux_thunk/LibrarySlice";

import { API_URL } from '../../config/api';
import { confirmAlert } from '../../utils/confirmAlert';
const DEFAULT_STORY_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuBvQzYRtYjISxgN15SaT96ZzRp0uhBsLi8dtlvBxtguAe6xQdLmGTT2DPmYgyXdBP9vHMV4o_Y-0WGc0cf6j7bsZDbN4nbabvlvhk20QmITP7ODv5EnXRTGOfvT6ng5cYr2q7IczdQCFVBcnqUent2OjsU41hp7ym-gHYBYq3eBKXIb7MKUQvkoAZctRNEzkIKwQl2okLEZv0nlLr7XzWyP7sNX8e_kGu814cdSoyr5V2dMljfbJGiav9so7PC7k4udoHlX6nakoD8";

const StoryDetailScreen = ({ navigation, route }) => {
	const { storyId } = route.params || {};
	const dispatch = useDispatch();
	const { currentStory, currentChapters, loading } = useSelector(state => state.story);
	const { user } = useSelector(state => state.auth);
	const { items: libraryItems } = useSelector(state => state.library);
	const [libraryLoading, setLibraryLoading] = useState(false);

	const isInLibrary = !!user && user.role_id !== 1 && libraryItems.some(item => item.id === storyId);

	const [comments, setComments] = useState([]);
	const [commentText, setCommentText] = useState('');
	const [rating, setRating] = useState(5);
	const [postingComment, setPostingComment] = useState(false);

	const [editingCommentId, setEditingCommentId] = useState(null);
	const [editingText, setEditingText] = useState('');

	const [bookmark, setBookmark] = useState(null);
	const [showAllChapters, setShowAllChapters] = useState(false);
	const CHAPTERS_PREVIEW = 5;

	const [priceXu, setPriceXu] = useState(0);
	const [hasPurchased, setHasPurchased] = useState(false);
	const [showPurchaseModal, setShowPurchaseModal] = useState(false);
	const [purchaseLoading, setPurchaseLoading] = useState(false);

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

	useEffect(() => {
		if (storyId) {
			dispatch(fetchStoryDetails(storyId));
			dispatch(fetchChapters(storyId));
			loadComments();
			loadBookmark();
			fetch(`${API_URL}/stories/${storyId}/view`, { method: 'PUT' }).catch(() => {});
			// Lấy trạng thái mua truyện
			const uid = user?.id ? `?user_id=${user.id}` : '';
			fetch(`${API_URL}/stories/${storyId}/purchase-status${uid}`)
				.then(r => r.json())
				.then(d => { if (d.status === 'success') { setPriceXu(d.price_xu || 0); setHasPurchased(d.has_purchased); } })
				.catch(() => {});
		}
		return () => { dispatch(clearCurrentStory()); };
	}, [dispatch, storyId, loadComments, loadBookmark, user?.id]);

	// Mở modal mua khi được redirect từ ChapterReadScreen
	useEffect(() => {
		if (route.params?.showPurchase && priceXu > 0 && !hasPurchased) {
			setShowPurchaseModal(true);
		}
	}, [route.params?.showPurchase, priceXu, hasPurchased]);

	const handlePurchaseStory = async () => {
		if (!user) { Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để mua truyện."); return; }
		setPurchaseLoading(true);
		try {
			const res = await fetch(`${API_URL}/stories/${storyId}/purchase`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: user.id }),
			}).then(r => r.json());
			if (res.status === 'success') {
				setHasPurchased(true);
				setShowPurchaseModal(false);
				Alert.alert("Thành công", res.message);
			} else {
				Alert.alert("Lỗi", res.message);
			}
		} catch { Alert.alert("Lỗi", "Không thể kết nối."); }
		finally { setPurchaseLoading(false); }
	};

	const canRead = !priceXu || hasPurchased || user?.is_vip || user?.role_id === 1 || user?.role_id === 2;

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
			if (res.status === "success") { setCommentText(''); loadComments(); }
		} finally { setPostingComment(false); }
	};

	const handleDeleteComment = (commentId) => {
		confirmAlert("Xóa bình luận", "Bạn muốn xóa bình luận này?", async () => {
			try {
				await fetch(`${API_URL}/comments/${commentId}/${user.id}`, { method: 'DELETE' });
				setComments(prev => prev.filter(c => c.id !== commentId));
			} catch {}
		}, true);
	};

	const handleEditComment = (comment) => {
		setEditingCommentId(comment.id);
		setEditingText(comment.content);
	};

	const handleSaveEditComment = async (commentId) => {
		if (!editingText.trim()) return;
		try {
			const res = await fetch(`${API_URL}/comments/${commentId}/${user.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: editingText.trim() }),
			}).then(r => r.json());
			if (res.status === 'success') {
				setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: editingText.trim() } : c));
				setEditingCommentId(null);
			} else {
				Alert.alert("Lỗi", res.message);
			}
		} catch { Alert.alert("Lỗi", "Không thể kết nối."); }
	};

	const handleShare = async () => {
		if (!currentStory) return;
		try {
			await Share.share({
				message: `Đọc "${currentStory.title}" của ${currentStory.author_name} trên ứng dụng Lumina!`,
			});
		} catch {}
	};

	if (loading || !currentStory) {
		return (
			<SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
				<ActivityIndicator size="large" color="#8B4513" />
			</SafeAreaView>
		);
	}

	const ratedComments = comments.filter(c => c.rating);
	const avgRating = ratedComments.length > 0
		? (ratedComments.reduce((s, c) => s + c.rating, 0) / ratedComments.length).toFixed(1)
		: '—';

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.root}>
				<View style={styles.topBar}>
					<TouchableOpacity style={styles.topBarButton} onPress={() => navigation.goBack()}>
						<MaterialIcons name="arrow-back" size={22} color="#8B4513" />
					</TouchableOpacity>
					<Text style={styles.topBarTitle}>App Đọc Truyện Online</Text>
					<TouchableOpacity style={styles.topBarButton} onPress={handleShare}>
						<MaterialIcons name="share" size={20} color="#8B4513" />
					</TouchableOpacity>
				</View>

				<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
					<View style={styles.hero}>
						<View style={styles.coverWrap}>
							<View style={styles.coverShadow} />
							<Image source={{ uri: currentStory.cover_image || DEFAULT_STORY_IMAGE }} style={styles.coverImage} />
							<View style={styles.badge}>
								<Text style={styles.badgeText}>{currentStory.status === 'published' ? 'ĐÃ PHÁT HÀNH' : currentStory.status.toUpperCase()}</Text>
							</View>
						</View>

						<View style={styles.metaSection}>
							<Text style={styles.genre}>{currentStory.category_names?.toUpperCase() || "THỂ LOẠI"}</Text>
							<Text style={styles.storyTitle}>{currentStory.title}</Text>
							<View style={styles.authorRow}>
								<View style={styles.authorIcon} />
								<Text style={styles.authorText}>Tác giả: {currentStory.author_name || "Đang cập nhật"}</Text>
							</View>
							<View style={styles.metaPills}>
								<View style={styles.metaPill}>
									<MaterialIcons name="star" size={16} color="#8B4513" />
									<Text style={styles.metaPillText}>{avgRating}</Text>
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
						{priceXu > 0 && !canRead ? (
							<TouchableOpacity
								style={[styles.actionButton, styles.actionPrimary, { backgroundColor: '#C0392B' }]}
								onPress={() => setShowPurchaseModal(true)}
							>
								<MaterialIcons name="lock" size={18} color="#FFFFFF" />
								<Text style={styles.actionPrimaryText}>Mua truyện — {priceXu} xu</Text>
							</TouchableOpacity>
						) : bookmark ? (
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
						{user?.role_id !== 1 && <TouchableOpacity
							style={[styles.actionButtonGhost, isInLibrary && styles.actionButtonSaved]}
							disabled={libraryLoading}
							onPress={async () => {
								if (!user) { Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để lưu truyện."); return; }
								setLibraryLoading(true);
								try {
									if (isInLibrary) {
										await dispatch(removeFromLibrary({ user_id: user.id, story_id: storyId })).unwrap();
									} else {
										await dispatch(addToLibrary({ user_id: user.id, story_id: storyId })).unwrap();
										dispatch(fetchLibrary(user.id));
									}
								} finally { setLibraryLoading(false); }
							}}
						>
							<MaterialIcons name={isInLibrary ? "bookmark" : "bookmark-border"} size={18} color={isInLibrary ? "#8B4513" : "#1A1A1A"} />
							<Text style={[styles.actionGhostText, isInLibrary && { color: "#8B4513" }]}>
								{libraryLoading ? "..." : isInLibrary ? "Đã Lưu" : "Lưu Truyện"}
							</Text>
						</TouchableOpacity>}
					</View>

					<View style={styles.contentRow}>
						<View style={styles.synopsisSection}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Tóm Tắt Nội Dung</Text>
								<MaterialCommunityIcons name="auto-fix" size={18} color="#eda189" />
							</View>
							<Text style={styles.synopsisText}>
								{currentStory.description || "Chưa có tóm tắt nội dung cho truyện này."}
							</Text>
							<View style={styles.tagRow}>
								{[`#${currentStory.category_names || "Novel"}`, "#Lumina"].map(tag => (
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
									(showAllChapters ? currentChapters : currentChapters.slice(0, CHAPTERS_PREVIEW)).map(chapter => {
										const isLocked = chapter.unlock_at && new Date(chapter.unlock_at) > new Date();
										const unlockLabel = isLocked
											? new Date(chapter.unlock_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
											: null;
										return (
											<TouchableOpacity
												key={chapter.id}
												style={[styles.chapterItem, !isLocked && styles.chapterItemOpen, isLocked && styles.chapterItemLocked]}
												onPress={() => navigation.navigate("ChapterRead", { chapterId: chapter.id, storyId: currentStory.id })}
											>
												<View style={{ flex: 1 }}>
													<Text style={[styles.chapterMeta, !isLocked && styles.chapterMetaOpen]}>Chương {chapter.chapter_number}</Text>
													<Text style={styles.chapterTitle}>{chapter.title}</Text>
													{isLocked && <Text style={styles.chapterUnlockDate}>Mở khóa {unlockLabel}</Text>}
												</View>
												{!isLocked
													? <MaterialIcons name="lock-open" size={18} color="#8B4513" />
													: <MaterialIcons name="lock" size={18} color={user?.is_vip ? "#8B4513" : "#BBBBBB"} />
												}
											</TouchableOpacity>
										);
									})
								) : (
									<Text style={{ textAlign: "center", color: "#888888", marginVertical: 10 }}>
										Truyện chưa cập nhật chương nào.
									</Text>
								)}
							</View>
							{currentChapters.length > CHAPTERS_PREVIEW && (
								<TouchableOpacity style={styles.viewAllButton} onPress={() => setShowAllChapters(!showAllChapters)}>
									<Text style={styles.viewAllText}>
										{showAllChapters ? "Thu gọn" : `Xem tất cả ${currentChapters.length} chương`}
									</Text>
									<MaterialIcons name={showAllChapters ? "expand-less" : "expand-more"} size={18} color="#8B4513" />
								</TouchableOpacity>
							)}
						</View>

						{/* BÌNH LUẬN */}
						<View style={styles.commentsSection}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Bình Luận</Text>
								<Text style={styles.chapterCount}>{comments.length}</Text>
							</View>

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
													{c.rating > 0 && (
														<View style={styles.commentRatingRow}>
															{Array.from({ length: c.rating }).map((_, i) => (
																<MaterialIcons key={i} name="star" size={11} color="#8B4513" />
															))}
														</View>
													)}
													{user?.id === c.user_id && editingCommentId !== c.id && (
														<TouchableOpacity onPress={() => handleEditComment(c)}>
															<MaterialIcons name="edit" size={15} color="#8B4513" />
														</TouchableOpacity>
													)}
													{user?.id === c.user_id && editingCommentId !== c.id && (
														<TouchableOpacity onPress={() => handleDeleteComment(c.id)}>
															<MaterialIcons name="delete-outline" size={15} color="#D32F2F" />
														</TouchableOpacity>
													)}
												</View>
											</View>

											{editingCommentId === c.id ? (
												<View style={styles.editWrap}>
													<TextInput
														style={styles.editInput}
														value={editingText}
														onChangeText={setEditingText}
														multiline
														autoFocus
													/>
													<View style={styles.editActions}>
														<TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveEditComment(c.id)}>
															<Text style={styles.saveBtnText}>Lưu</Text>
														</TouchableOpacity>
														<TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingCommentId(null)}>
															<Text style={styles.cancelBtnText}>Hủy</Text>
														</TouchableOpacity>
													</View>
												</View>
											) : (
												<Text style={styles.commentText}>{c.content}</Text>
											)}

											<Text style={styles.commentTime}>{new Date(c.created_at).toLocaleDateString("vi-VN")}</Text>
										</View>
									</View>
								))
							)}
						</View>
					</View>
				</ScrollView>

				{bookmark && (
					<TouchableOpacity
						style={styles.miniPlayer}
						onPress={() => navigation.navigate("ChapterRead", { chapterId: bookmark.chapter_id, storyId: currentStory.id })}
					>
						<Image source={{ uri: currentStory.cover_image || DEFAULT_STORY_IMAGE }} style={styles.miniCover} />
						<View style={styles.miniText}>
							<Text style={styles.miniMeta}>TIẾP TỤC ĐỌC</Text>
							<Text style={styles.miniTitle} numberOfLines={1}>
								Chương {bookmark.chapter_number}: {bookmark.chapter_title}
							</Text>
						</View>
						<View style={styles.miniPlay}>
							<MaterialIcons name="play-arrow" size={18} color="#FFFFFF" />
						</View>
					</TouchableOpacity>
				)}
			</View>

			{/* Modal mua truyện */}
			{showPurchaseModal && (
				<View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
					<View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '100%', gap: 14 }}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
							<Text style={{ fontSize: 17, fontWeight: '700', color: '#1A1A1A' }}>Mua truyện</Text>
							<TouchableOpacity onPress={() => setShowPurchaseModal(false)}>
								<MaterialIcons name="close" size={22} color="#888" />
							</TouchableOpacity>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF8E1', borderRadius: 10, padding: 12 }}>
							<MaterialIcons name="lock-open" size={24} color="#8B4513" />
							<Text style={{ fontSize: 13, color: '#5D2E0C', flex: 1 }}>Mua một lần để đọc toàn bộ nội dung truyện này vĩnh viễn</Text>
						</View>
						<View style={{ backgroundColor: '#F5F0EB', borderRadius: 10, padding: 12, gap: 8 }}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<Text style={{ color: '#666', fontSize: 14 }}>Giá</Text>
								<Text style={{ fontWeight: '700', color: '#8B4513', fontSize: 14 }}>{priceXu} xu</Text>
							</View>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<Text style={{ color: '#666', fontSize: 14 }}>Số dư</Text>
								<Text style={{ fontWeight: '700', fontSize: 14, color: (user?.balance || 0) >= priceXu ? '#2E7D32' : '#D32F2F' }}>
									{Math.floor(user?.balance || 0)} xu
								</Text>
							</View>
						</View>
						{(user?.balance || 0) < priceXu && (
							<Text style={{ color: '#D32F2F', fontSize: 13, textAlign: 'center' }}>Không đủ xu. Vui lòng nạp thêm.</Text>
						)}
						<TouchableOpacity
							style={{ backgroundColor: '#C0392B', borderRadius: 999, paddingVertical: 13, alignItems: 'center', opacity: (purchaseLoading || !user || (user?.balance || 0) < priceXu) ? 0.5 : 1 }}
							onPress={handlePurchaseStory}
							disabled={purchaseLoading || !user || (user?.balance || 0) < priceXu}
						>
							{purchaseLoading
								? <ActivityIndicator color="#fff" size="small" />
								: <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Xác nhận mua — {priceXu} xu</Text>
							}
						</TouchableOpacity>
					</View>
				</View>
			)}
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
	chapterUnlockDate: { fontSize: 10, color: "#E65100", marginTop: 2 },
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
	commentTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	commentName: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
	commentRatingRow: { flexDirection: "row" },
	commentText: { fontSize: 13, color: "#555555", lineHeight: 18 },
	commentTime: { fontSize: 10, color: "#BBBBBB" },
	editWrap: { gap: 6 },
	editInput: { backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1, borderColor: "#8B4513", paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, color: "#1A1A1A" },
	editActions: { flexDirection: "row", gap: 8 },
	saveBtn: { backgroundColor: "#8B4513", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
	saveBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
	cancelBtn: { backgroundColor: "#F5F5F5", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
	cancelBtnText: { color: "#888888", fontWeight: "700", fontSize: 12 },
	miniPlayer: { position: "absolute", right: 16, bottom: 80, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#EBEBEB", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, maxWidth: 260 },
	miniCover: { width: 40, height: 40, borderRadius: 8 },
	miniText: { flex: 1 },
	miniMeta: { fontSize: 10, color: "#8B4513", fontWeight: "700" },
	miniTitle: { fontSize: 12, fontWeight: "600", color: "#1A1A1A" },
	miniPlay: { backgroundColor: "#8B4513", padding: 8, borderRadius: 8 },
});

export default StoryDetailScreen;
