import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../config/axiosInstance';

// ─── Data Fetching ────────────────────────────────────────────────────────────

export const fetchAuthorStories = createAsyncThunk("actor/fetchAuthorStories",
	async (authorId, { rejectWithValue }) => {
		try {
			const { data } = await api.get(`/author/stories/${authorId}`);
			if (data.status === "success") return data.data;
			return rejectWithValue(data.message || "Lỗi tải danh sách truyện.");
		} catch { return rejectWithValue("Không thể kết nối đến máy chủ."); }
	}
);

export const fetchAuthorStats = createAsyncThunk("actor/fetchAuthorStats",
	async (authorId, { rejectWithValue }) => {
		try {
			const { data } = await api.get(`/author/${authorId}/stats`);
			if (data.status === "success") return data.data;
			return rejectWithValue(data.message || "Lỗi tải thống kê.");
		} catch { return rejectWithValue("Không thể kết nối đến máy chủ."); }
	}
);

export const fetchStoryChapters = createAsyncThunk("actor/fetchStoryChapters",
	async (storyId, { rejectWithValue }) => {
		try {
			const { data } = await api.get(`/stories/${storyId}/chapters`);
			return data.data || [];
		} catch { return rejectWithValue("Không thể kết nối đến máy chủ."); }
	}
);

export const fetchChapterForEdit = createAsyncThunk("actor/fetchChapterForEdit",
	async ({ chapterId, userId }, { rejectWithValue }) => {
		try {
			const { data } = await api.get(`/chapters/${chapterId}?user_id=${userId}`);
			if (data.status === 'success') return data.data.content || '';
			return rejectWithValue("Không lấy được nội dung chương.");
		} catch { return rejectWithValue("Không thể kết nối đến máy chủ."); }
	}
);

export const fetchUnreadCount = createAsyncThunk("actor/fetchUnreadCount",
	async (userId) => {
		try {
			const { data } = await api.get(`/notifications/${userId}/unread-count`);
			return data.count || 0;
		} catch { return 0; }
	}
);

// ─── Mutations ────────────────────────────────────────────────────────────────

export const createStory = createAsyncThunk("actor/createStory",
	async (storyData, { rejectWithValue }) => {
		try {
			const { data } = await api.post('/stories', storyData);
			if (data.status === "success") return data;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Không thể kết nối đến máy chủ."); }
	}
);

export const updateStory = createAsyncThunk("actor/updateStory",
	async ({ storyId, storyData }, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/stories/${storyId}`, storyData);
			if (data.status === "success") return data;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Không thể kết nối đến máy chủ."); }
	}
);

export const addChapter = createAsyncThunk("actor/addChapter",
	async ({ storyId, chapData }, { rejectWithValue }) => {
		try {
			const { data } = await api.post(`/stories/${storyId}/chapters`, chapData);
			if (data.status === "success") return data;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Không thể kết nối đến máy chủ."); }
	}
);

export const updateChapter = createAsyncThunk("actor/updateChapter",
	async ({ chapterId, chapData }, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/chapters/${chapterId}`, chapData);
			if (data.status === "success") return { chapterId, ...chapData };
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Không thể kết nối đến máy chủ."); }
	}
);

export const deleteChapter = createAsyncThunk("actor/deleteChapter",
	async (chapterId, { rejectWithValue }) => {
		try {
			await api.delete(`/chapters/${chapterId}`);
			return chapterId;
		} catch { return rejectWithValue("Không thể kết nối đến máy chủ."); }
	}
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const actorSlice = createSlice({
	name: "actor",
	initialState: {
		stories: [],
		stats: null,
		loading: false,
		statsLoading: false,
		error: null,
		storyChapters: [],
		chapLoading: false,
		chapterEditContent: '',
		chapContentLoading: false,
		submitting: false,
		savingChap: false,
		unreadCount: 0,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAuthorStories.pending, (state) => { state.loading = true; state.error = null; })
			.addCase(fetchAuthorStories.fulfilled, (state, action) => { state.loading = false; state.stories = action.payload; })
			.addCase(fetchAuthorStories.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

			.addCase(fetchAuthorStats.pending, (state) => { state.statsLoading = true; state.error = null; })
			.addCase(fetchAuthorStats.fulfilled, (state, action) => { state.statsLoading = false; state.stats = action.payload; })
			.addCase(fetchAuthorStats.rejected, (state, action) => { state.statsLoading = false; state.error = action.payload; })

			.addCase(fetchStoryChapters.pending, (state) => { state.chapLoading = true; })
			.addCase(fetchStoryChapters.fulfilled, (state, action) => { state.chapLoading = false; state.storyChapters = action.payload; })
			.addCase(fetchStoryChapters.rejected, (state) => { state.chapLoading = false; })

			.addCase(fetchChapterForEdit.pending, (state) => { state.chapContentLoading = true; state.chapterEditContent = ''; })
			.addCase(fetchChapterForEdit.fulfilled, (state, action) => { state.chapContentLoading = false; state.chapterEditContent = action.payload; })
			.addCase(fetchChapterForEdit.rejected, (state) => { state.chapContentLoading = false; })

			.addCase(fetchUnreadCount.fulfilled, (state, action) => { state.unreadCount = action.payload; })

			.addCase(createStory.pending, (state) => { state.submitting = true; })
			.addCase(createStory.fulfilled, (state) => { state.submitting = false; })
			.addCase(createStory.rejected, (state) => { state.submitting = false; })
			.addCase(updateStory.pending, (state) => { state.submitting = true; })
			.addCase(updateStory.fulfilled, (state) => { state.submitting = false; })
			.addCase(updateStory.rejected, (state) => { state.submitting = false; })

			.addCase(addChapter.pending, (state) => { state.savingChap = true; })
			.addCase(addChapter.fulfilled, (state) => { state.savingChap = false; })
			.addCase(addChapter.rejected, (state) => { state.savingChap = false; })
			.addCase(updateChapter.pending, (state) => { state.savingChap = true; })
			.addCase(updateChapter.fulfilled, (state, action) => {
				state.savingChap = false;
				const { chapterId, title, unlock_at } = action.payload;
				state.storyChapters = state.storyChapters.map(c =>
					c.id === chapterId ? { ...c, title, unlock_at: unlock_at ?? null } : c
				);
			})
			.addCase(updateChapter.rejected, (state) => { state.savingChap = false; })
			.addCase(deleteChapter.fulfilled, (state, action) => {
				state.storyChapters = state.storyChapters.filter(c => c.id !== action.payload);
			});
	},
});

export default actorSlice.reducer;
