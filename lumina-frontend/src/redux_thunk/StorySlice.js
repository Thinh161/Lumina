import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { API_URL } from '../config/api';

// 1. Thunk: Lấy danh sách thể loại
export const fetchCategories = createAsyncThunk("story/fetchCategories",
	async (_, { rejectWithValue }) => {
		try {
			const data = await fetch(`${API_URL}/categories`).then(res => res.json());
			if (data.status === "success") return data.data;
			return rejectWithValue("Không lấy được danh sách thể loại.");
		} catch (error) {
			return rejectWithValue("Lỗi kết nối server.");
		}
	}
);

// 2. Thunk: Lấy danh sách truyện
export const fetchStories = createAsyncThunk("story/fetchStories",
	async (_, { rejectWithValue }) => {
		try {
			const data = await fetch(`${API_URL}/stories`).then(res => res.json());
			if (data.status === "success") return data.data;
			return rejectWithValue("Không lấy được danh sách truyện.");
		} catch (error) {
			return rejectWithValue("Lỗi kết nối server.");
		}
	}
);

// 3. Thunk: Lấy chi tiết truyện
export const fetchStoryDetails = createAsyncThunk("story/fetchStoryDetails",
	async (storyId, { rejectWithValue }) => {
		try {
			const data = await fetch(`${API_URL}/stories/${storyId}`).then(res => res.json());
			if (data.status === "success") return data.data;
			return rejectWithValue("Không lấy được chi tiết truyện.");
		} catch (error) {
			return rejectWithValue("Lỗi kết nối server.");
		}
	}
);

// 4. Thunk: Lấy danh sách chương của truyện
export const fetchChapters = createAsyncThunk("story/fetchChapters",
	async (storyId, { rejectWithValue }) => {
		try {
			const data = await fetch(`${API_URL}/stories/${storyId}/chapters`).then(res => res.json());
			if (data.status === "success") return data.data;
			// Nếu không lấy được mảng chapters, trả về [] tạm thời
			return [];
		} catch (error) {
			return rejectWithValue("Lỗi kết nối server.");
		}
	}
);

// 5. Thunk: Lấy nội dung chương (có VIP enforcement)
export const fetchChapterContent = createAsyncThunk("story/fetchChapterContent",
	async ({ chapterId, userId }, { rejectWithValue }) => {
		try {
			let url = `${API_URL}/chapters/${chapterId}`;
			if (userId) url += `?user_id=${userId}`;
			const response = await fetch(url);
			const data = await response.json();
			if (response.status === 403 || data.code === 'VIP_REQUIRED')
				return rejectWithValue({ code: 'VIP_REQUIRED', message: data.message });
			if (data.status === "success") return data.data;
			return rejectWithValue({ message: "Không lấy được nội dung chương." });
		} catch (error) {
			return rejectWithValue({ message: "Lỗi kết nối server." });
		}
	}
);

const storySlice = createSlice({
	name: "story",
	initialState: {
		categories: [],
		stories: [],
		currentStory: null,
		currentChapters: [],
		currentChapterContent: null,
		loading: false,
		error: null,
		vipBlocked: false,
	},
	reducers: {
		clearCurrentStory: (state) => {
			state.currentStory = null;
			state.currentChapters = [];
		},
		clearChapterContent: (state) => {
			state.currentChapterContent = null;
			state.vipBlocked = false;
		}
	},
	extraReducers: (builder) => {
		builder
			// Xử lý Categories
			.addCase(fetchCategories.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchCategories.fulfilled, (state, action) => {
				state.loading = false;
				state.categories = action.payload;
			})
			.addCase(fetchCategories.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Xử lý Stories
			.addCase(fetchStories.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchStories.fulfilled, (state, action) => {
				state.loading = false;
				state.stories = action.payload;
			})
			.addCase(fetchStories.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Xử lý Chi tiết truyện
			.addCase(fetchStoryDetails.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchStoryDetails.fulfilled, (state, action) => {
				state.loading = false;
				state.currentStory = action.payload;
			})
			.addCase(fetchStoryDetails.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Xử lý Danh sách chương
			.addCase(fetchChapters.fulfilled, (state, action) => {
				state.currentChapters = action.payload;
			})
			// Xử lý Nội dung chương
			.addCase(fetchChapterContent.pending, (state) => {
				state.loading = true;
				state.vipBlocked = false;
			})
			.addCase(fetchChapterContent.fulfilled, (state, action) => {
				state.loading = false;
				state.currentChapterContent = action.payload;
			})
			.addCase(fetchChapterContent.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || action.payload;
				if (action.payload?.code === 'VIP_REQUIRED') state.vipBlocked = true;
			});
	}
});

export const { clearCurrentStory, clearChapterContent } = storySlice.actions;
export default storySlice.reducer;
