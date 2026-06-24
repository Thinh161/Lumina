import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../config/axiosInstance';

export const fetchAdminStats = createAsyncThunk("admin/fetchAdminStats",
	async (_, { rejectWithValue }) => {
		try {
			const { data } = await api.get('/admin/stats');
			if (data.status === "success") return data.data;
			return rejectWithValue("Không lấy được thống kê.");
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const fetchAdminStories = createAsyncThunk("admin/fetchAdminStories",
	async (status, { rejectWithValue }) => {
		try {
			const url = status === 'pending' ? '/admin/stories/pending' : `/admin/stories?status=${status}`;
			const { data } = await api.get(url);
			if (data.status === "success") return { status, data: data.data };
			return rejectWithValue("Lỗi lấy danh sách truyện.");
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const updateStoryStatus = createAsyncThunk("admin/updateStoryStatus",
	async ({ storyId, payload }, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/admin/stories/${storyId}/status`, payload);
			if (data.status === "success") return { storyId, status: payload.status };
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const fetchAdminTransactions = createAsyncThunk("admin/fetchAdminTransactions",
	async ({ type, status }, { rejectWithValue }) => {
		try {
			const { data } = await api.get(`/admin/${type}?status=${status}`);
			if (data.status === "success") return { type, status, data: data.data };
			return rejectWithValue("Lỗi lấy dữ liệu giao dịch.");
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const fetchAdminUsersOrAuthors = createAsyncThunk("admin/fetchAdminUsersOrAuthors",
	async (type, { rejectWithValue }) => {
		try {
			const { data } = await api.get(`/admin/${type}`);
			if (data.status === "success") return { type, data: data.data };
			return rejectWithValue("Lỗi lấy dữ liệu user.");
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

// ─── Mutations ────────────────────────────────────────────────────────────────

export const adminSetUserStatus = createAsyncThunk("admin/adminSetUserStatus",
	async ({ userId, status }, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/admin/users/${userId}/status`, { status });
			if (data.status === 'success') return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const adminGrantVip = createAsyncThunk("admin/adminGrantVip",
	async (userId, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/admin/users/${userId}/vip`);
			if (data.status === 'success') return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const adminRevokeVip = createAsyncThunk("admin/adminRevokeVip",
	async (userId, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/admin/users/${userId}/revoke-vip`);
			if (data.status === 'success') return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const adminApproveAuthor = createAsyncThunk("admin/adminApproveAuthor",
	async (userId, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/admin/users/${userId}/approve-author`);
			if (data.status === 'success') return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const adminRejectAuthor = createAsyncThunk("admin/adminRejectAuthor",
	async (userId, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/admin/users/${userId}/reject-author`);
			if (data.status === 'success') return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const adminApproveTopup = createAsyncThunk("admin/adminApproveTopup",
	async (id, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/admin/topup/${id}/approve`);
			if (data.status === 'success') return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const adminRejectTopup = createAsyncThunk("admin/adminRejectTopup",
	async (id, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/admin/topup/${id}/reject`);
			if (data.status === 'success') return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const adminApproveVip = createAsyncThunk("admin/adminApproveVip",
	async (id, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/admin/vip/${id}/approve`);
			if (data.status === 'success') return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const adminRejectVip = createAsyncThunk("admin/adminRejectVip",
	async (id, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/admin/vip/${id}/reject`);
			if (data.status === 'success') return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const adminApproveWithdraw = createAsyncThunk("admin/adminApproveWithdraw",
	async (id, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/admin/withdraw/${id}/approve`);
			if (data.status === 'success') return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

export const adminRejectWithdraw = createAsyncThunk("admin/adminRejectWithdraw",
	async (id, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/admin/withdraw/${id}/reject`);
			if (data.status === 'success') return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Lỗi kết nối."); }
	}
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
	name: "admin",
	initialState: {
		stats: null,
		stories: { pending: [], published: [], rejected: [] },
		transactions: { topup: [], vip: [], withdraw: [] },
		usersList: [],
		authorRequests: [],
		loading: false,
		error: null,
	},
	reducers: {
		clearAdminError: (state) => { state.error = null; }
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAdminStats.pending, (state) => { state.loading = true; })
			.addCase(fetchAdminStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
			.addCase(fetchAdminStats.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

			.addCase(fetchAdminStories.pending, (state) => { state.loading = true; })
			.addCase(fetchAdminStories.fulfilled, (state, action) => {
				state.loading = false;
				state.stories[action.payload.status] = action.payload.data || [];
			})
			.addCase(fetchAdminStories.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

			.addCase(updateStoryStatus.fulfilled, (state, action) => {
				state.stories.pending = state.stories.pending.filter(s => s.id !== action.payload.storyId);
			})

			.addCase(fetchAdminTransactions.pending, (state) => { state.loading = true; })
			.addCase(fetchAdminTransactions.fulfilled, (state, action) => {
				state.loading = false;
				const { type, data } = action.payload;
				if (type === 'topup') state.transactions.topup = data || [];
				if (type === 'vip-requests') state.transactions.vip = data || [];
				if (type === 'withdrawals') state.transactions.withdraw = data || [];
			})

			.addCase(fetchAdminUsersOrAuthors.pending, (state) => { state.loading = true; })
			.addCase(fetchAdminUsersOrAuthors.fulfilled, (state, action) => {
				state.loading = false;
				if (action.payload.type === 'users') {
					state.usersList = (action.payload.data || []).filter(u => u.role_id !== 1);
				} else {
					state.authorRequests = action.payload.data || [];
				}
			});
	},
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
