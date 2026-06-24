import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../config/axiosInstance';

export const fetchLibrary = createAsyncThunk("library/fetchLibrary",
	async (userId, { rejectWithValue }) => {
		try {
			const { data } = await api.get(`/library/${userId}`);
			if (data.status === "success") return data.data;
			return rejectWithValue("Không lấy được thư viện.");
		} catch {
			return rejectWithValue("Lỗi kết nối server.");
		}
	}
);

export const addToLibrary = createAsyncThunk("library/addToLibrary",
	async ({ user_id, story_id }, { rejectWithValue }) => {
		try {
			const { data } = await api.post('/library', { user_id, story_id });
			if (data.status === "success") return story_id;
			return rejectWithValue("Không thêm được vào thư viện.");
		} catch {
			return rejectWithValue("Lỗi kết nối server.");
		}
	}
);

export const removeFromLibrary = createAsyncThunk("library/removeFromLibrary",
	async ({ user_id, story_id }, { rejectWithValue }) => {
		try {
			const { data } = await api.delete(`/library/${user_id}/${story_id}`);
			if (data.status === "success") return story_id;
			return rejectWithValue("Không xóa được khỏi thư viện.");
		} catch {
			return rejectWithValue("Lỗi kết nối server.");
		}
	}
);

const librarySlice = createSlice({
	name: "library",
	initialState: {
		items: [],
		loading: false,
		error: null,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchLibrary.pending, (state) => { state.loading = true; })
			.addCase(fetchLibrary.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
			.addCase(fetchLibrary.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
			.addCase(removeFromLibrary.fulfilled, (state, action) => {
				state.items = state.items.filter(item => String(item.id) !== String(action.payload));
			});
	}
});

export default librarySlice.reducer;
