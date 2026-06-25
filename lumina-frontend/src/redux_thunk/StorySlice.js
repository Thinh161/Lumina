import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../config/axiosInstance';

// ─── Data Fetching ────────────────────────────────────────────────────────────

export const fetchCategories = createAsyncThunk("story/fetchCategories",
	async (_, { rejectWithValue }) => {
		try {
			const { data } = await api.get('/categories');
			if (data.status === "success") return data.data;
			return rejectWithValue("Không lấy được danh sách thể loại.");
		} catch { return rejectWithValue("Lỗi kết nối server."); }
	}
);

export const fetchStories = createAsyncThunk("story/fetchStories",
	async (_, { rejectWithValue }) => {
		try {
			const { data } = await api.get('/stories');
			if (data.status === "success") return data.data;
			return rejectWithValue("Không lấy được danh sách truyện.");
		} catch { return rejectWithValue("Lỗi kết nối server."); }
	}
);

export const fetchLatestStories = createAsyncThunk("story/fetchLatestStories",
	async (_, { rejectWithValue }) => {
		try {
			const { data } = await api.get('/stories/latest');
			return data.data || [];
		} catch { return rejectWithValue("Lỗi kết nối server."); }
	}
);

export const fetchTopStories = createAsyncThunk("story/fetchTopStories",
	async (_, { rejectWithValue }) => {
		try {
			const { data } = await api.get('/stories/top');
			return data.data || [];
		} catch { return rejectWithValue("Lỗi kết nối server."); }
	}
);

export const fetchStoryDetails = createAsyncThunk("story/fetchStoryDetails",
	async (storyId, { rejectWithValue }) => {
		try {
			const { data } = await api.get(`/stories/${storyId}`);
			if (data.status === "success") return data.data;
			return rejectWithValue("Không lấy được chi tiết truyện.");
		} catch { return rejectWithValue("Lỗi kết nối server."); }
	}
);

export const fetchChapters = createAsyncThunk("story/fetchChapters",
	async (storyId, { rejectWithValue }) => {
		try {
			const { data } = await api.get(`/stories/${storyId}/chapters`);
			if (data.status === "success") return data.data;
			return [];
		} catch { return rejectWithValue("Lỗi kết nối server."); }
	}
);

export const fetchChapterContent = createAsyncThunk("story/fetchChapterContent",
	async ({ chapterId, userId }, { rejectWithValue }) => {
		try {
			const url = userId ? `/chapters/${chapterId}?user_id=${userId}` : `/chapters/${chapterId}`;
			const { data } = await api.get(url);
			if (data.status === "success") return data.data;
			return rejectWithValue({ message: "Không lấy được nội dung chương." });
		} catch (error) {
			const res = error.response;
			if (res?.status === 403) {
				if (res.data?.code === 'PURCHASE_REQUIRED')
					return rejectWithValue({ code: 'PURCHASE_REQUIRED', message: res.data.message, price_xu: res.data.price_xu, story_id: res.data.story_id });
				if (res.data?.code === 'VIP_REQUIRED')
					return rejectWithValue({ code: 'VIP_REQUIRED', message: res.data.message });
			}
			return rejectWithValue({ message: "Lỗi kết nối server." });
		}
	}
);

export const fetchStoryComments = createAsyncThunk("story/fetchStoryComments",
	async (storyId, { rejectWithValue }) => {
		try {
			const { data } = await api.get(`/stories/${storyId}/comments`);
			if (data.status === "success") return data.data;
			return [];
		} catch { return rejectWithValue("Lỗi kết nối server."); }
	}
);

export const fetchBookmark = createAsyncThunk("story/fetchBookmark",
	async ({ userId, storyId }) => {
		try {
			const { data } = await api.get(`/bookmarks/${userId}/${storyId}`);
			if (data.status === "success" && data.data) return data.data;
			return null;
		} catch { return null; }
	}
);

export const fetchPurchaseStatus = createAsyncThunk("story/fetchPurchaseStatus",
	async ({ storyId, userId }) => {
		try {
			const url = userId ? `/stories/${storyId}/purchase-status?user_id=${userId}` : `/stories/${storyId}/purchase-status`;
			const { data } = await api.get(url);
			if (data.status === 'success') return { priceXu: data.price_xu || 0, hasPurchased: data.has_purchased };
			return { priceXu: 0, hasPurchased: false };
		} catch { return { priceXu: 0, hasPurchased: false }; }
	}
);

export const searchStories = createAsyncThunk("story/searchStories",
	async ({ query, categoryId, sortBy }, { rejectWithValue }) => {
		try {
			let url = `/stories/search?q=${encodeURIComponent(query || '')}`;
			if (categoryId) url += `&category_id=${categoryId}`;
			if (sortBy) url += `&sort=${sortBy}`;
			const { data } = await api.get(url);
			if (data.status === "success") return data.data;
			return [];
		} catch { return rejectWithValue("Lỗi kết nối server."); }
	}
);

// ─── Mutations ────────────────────────────────────────────────────────────────

export const postComment = createAsyncThunk("story/postComment",
	async ({ userId, storyId, content, rating }, { rejectWithValue }) => {
		try {
			const { data } = await api.post('/comments', { user_id: userId, story_id: storyId, content, rating });
			if (data.status === "success") return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối server."); }
	}
);

export const deleteComment = createAsyncThunk("story/deleteComment",
	async ({ commentId, userId }, { rejectWithValue }) => {
		try {
			await api.delete(`/comments/${commentId}/${userId}`);
			return commentId;
		} catch { return rejectWithValue("Lỗi kết nối server."); }
	}
);

export const editComment = createAsyncThunk("story/editComment",
	async ({ commentId, userId, content }, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/comments/${commentId}/${userId}`, { content });
			if (data.status === 'success') return { commentId, content };
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối server."); }
	}
);

export const purchaseStory = createAsyncThunk("story/purchaseStory",
	async ({ storyId, userId }, { rejectWithValue }) => {
		try {
			const { data } = await api.post(`/stories/${storyId}/purchase`, { user_id: userId });
			if (data.status === 'success') return data.message;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối server."); }
	}
);

export const saveBookmark = createAsyncThunk("story/saveBookmark",
	async ({ userId, chapterId, scrollPosition }) => {
		try {
			await api.post('/bookmarks', { user_id: userId, chapter_id: chapterId, scroll_position: Math.round(scrollPosition) });
		} catch {}
	}
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const storySlice = createSlice({
	name: "story",
	initialState: {
		categories: [],
		stories: [],
		latestStories: [],
		topStories: [],
		searchResults: [],
		searchLoading: false,
		currentStory: null,
		currentChapters: [],
		currentChapterContent: null,
		comments: [],
		commentsLoading: false,
		bookmark: null,
		priceXu: 0,
		hasPurchased: false,
		purchaseStatusLoading: false,
		purchaseLoading: false,
		loading: false,
		error: null,
		vipBlocked: false,
		vipBlockedMessage: '',
		purchaseBlocked: false,
		purchaseBlockedData: null,
	},
	reducers: {
		clearCurrentStory: (state) => {
			state.currentStory = null;
			state.currentChapters = [];
			state.comments = [];
			state.bookmark = null;
			state.priceXu = 0;
			state.hasPurchased = false;
		},
		clearChapterContent: (state) => {
			state.currentChapterContent = null;
			state.vipBlocked = false;
			state.vipBlockedMessage = '';
			state.purchaseBlocked = false;
			state.purchaseBlockedData = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCategories.pending, (state) => { state.loading = true; })
			.addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.categories = action.payload; })
			.addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

			.addCase(fetchStories.pending, (state) => { state.loading = true; })
			.addCase(fetchStories.fulfilled, (state, action) => { state.loading = false; state.stories = action.payload; })
			.addCase(fetchStories.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

			.addCase(fetchLatestStories.fulfilled, (state, action) => { state.latestStories = action.payload; })
			.addCase(fetchTopStories.fulfilled, (state, action) => { state.topStories = action.payload; })

			.addCase(fetchStoryDetails.pending, (state) => { state.loading = true; })
			.addCase(fetchStoryDetails.fulfilled, (state, action) => { state.loading = false; state.currentStory = action.payload; })
			.addCase(fetchStoryDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

			.addCase(fetchChapters.fulfilled, (state, action) => { state.currentChapters = action.payload; })

			.addCase(fetchChapterContent.pending, (state) => {
				state.loading = true;
				state.vipBlocked = false;
				state.vipBlockedMessage = '';
				state.purchaseBlocked = false;
				state.purchaseBlockedData = null;
			})
			.addCase(fetchChapterContent.fulfilled, (state, action) => { state.loading = false; state.currentChapterContent = action.payload; })
			.addCase(fetchChapterContent.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || action.payload;
				if (action.payload?.code === 'VIP_REQUIRED') {
					state.vipBlocked = true;
					state.vipBlockedMessage = action.payload?.message || '';
				} else if (action.payload?.code === 'PURCHASE_REQUIRED') {
					state.purchaseBlocked = true;
					state.purchaseBlockedData = { price_xu: action.payload.price_xu, story_id: action.payload.story_id };
				}
			})

			.addCase(fetchStoryComments.pending, (state) => { state.commentsLoading = true; })
			.addCase(fetchStoryComments.fulfilled, (state, action) => { state.commentsLoading = false; state.comments = action.payload; })
			.addCase(fetchStoryComments.rejected, (state) => { state.commentsLoading = false; })
			.addCase(deleteComment.fulfilled, (state, action) => {
				state.comments = state.comments.filter(c => c.id !== action.payload);
			})
			.addCase(editComment.fulfilled, (state, action) => {
				const { commentId, content } = action.payload;
				state.comments = state.comments.map(c => c.id === commentId ? { ...c, content } : c);
			})

			.addCase(fetchBookmark.fulfilled, (state, action) => { state.bookmark = action.payload; })

			.addCase(fetchPurchaseStatus.pending, (state) => { state.purchaseStatusLoading = true; })
			.addCase(fetchPurchaseStatus.fulfilled, (state, action) => {
				state.purchaseStatusLoading = false;
				state.priceXu = action.payload.priceXu;
				state.hasPurchased = action.payload.hasPurchased;
			})
			.addCase(fetchPurchaseStatus.rejected, (state) => { state.purchaseStatusLoading = false; })

			.addCase(purchaseStory.pending, (state) => { state.purchaseLoading = true; })
			.addCase(purchaseStory.fulfilled, (state) => { state.purchaseLoading = false; state.hasPurchased = true; })
			.addCase(purchaseStory.rejected, (state) => { state.purchaseLoading = false; })

			.addCase(searchStories.pending, (state) => { state.searchLoading = true; })
			.addCase(searchStories.fulfilled, (state, action) => { state.searchLoading = false; state.searchResults = action.payload; })
			.addCase(searchStories.rejected, (state) => { state.searchLoading = false; state.searchResults = []; });
	}
});

export const { clearCurrentStory, clearChapterContent } = storySlice.actions;
export default storySlice.reducer;
