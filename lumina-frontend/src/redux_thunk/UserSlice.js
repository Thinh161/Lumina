import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../config/axiosInstance';

export const updateUserProfile = createAsyncThunk("user/updateUserProfile",
	async ({ userId, profileData }, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/users/${userId}`, profileData);
			if (data.status === "success") return data.user;
			return rejectWithValue(data.message || "Cập nhật hồ sơ thất bại.");
		} catch { return rejectWithValue("Không thể kết nối server."); }
	}
);

export const changePassword = createAsyncThunk("user/changePassword",
	async ({ userId, oldPassword, newPassword }, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/users/${userId}/password`, { old_password: oldPassword, new_password: newPassword });
			if (data.status === "success") return true;
			return rejectWithValue(data.message || "Đổi mật khẩu thất bại.");
		} catch { return rejectWithValue("Không thể kết nối server."); }
	}
);

export const fetchReadingHistory = createAsyncThunk("user/fetchReadingHistory",
	async (userId, { rejectWithValue }) => {
		try {
			const { data } = await api.get(`/history/${userId}`);
			return data.data || [];
		} catch { return rejectWithValue("Không thể kết nối server."); }
	}
);

export const fetchNotifications = createAsyncThunk("user/fetchNotifications",
	async (userId, { rejectWithValue }) => {
		try {
			const { data } = await api.get(`/notifications/${userId}`);
			return data.data || [];
		} catch { return rejectWithValue("Không thể kết nối server."); }
	}
);

export const requestTopup = createAsyncThunk("user/requestTopup",
	async ({ userId, amountVnd, amountXu }, { rejectWithValue }) => {
		try {
			const { data } = await api.post('/topup/request', { user_id: userId, amount_vnd: amountVnd, amount_xu: amountXu });
			if (data.status === 'success') return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Không thể kết nối server."); }
	}
);

export const buyVip = createAsyncThunk("user/buyVip",
	async ({ userId, xu, months }, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/users/${userId}/buy-vip`, { xu, months });
			if (data.status === 'success') return true;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Không thể kết nối server."); }
	}
);

export const requestWithdraw = createAsyncThunk("user/requestWithdraw",
	async ({ userId, amountXu, bankName, bankAccount, bankOwner }, { rejectWithValue }) => {
		try {
			const { data } = await api.post('/withdraw/request', { user_id: userId, amount_xu: amountXu, bank_name: bankName, bank_account: bankAccount, bank_owner: bankOwner });
			if (data.status === 'success') return data;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Không thể kết nối server."); }
	}
);

export const requestAuthorRole = createAsyncThunk("user/requestAuthorRole",
	async (userId, { rejectWithValue }) => {
		try {
			const { data } = await api.put(`/users/${userId}/request-author`);
			if (data.status === 'success') return data.message;
			return rejectWithValue(data.message);
		} catch { return rejectWithValue("Không thể kết nối server."); }
	}
);

const userSlice = createSlice({
	name: "user",
	initialState: {
		loading: false,
		error: null,
		history: [],
		historyLoading: false,
		notifications: [],
		notificationsLoading: false,
	},
	reducers: {
		clearUserError: (state) => { state.error = null; },
	},
	extraReducers: (builder) => {
		builder
			.addCase(updateUserProfile.pending, (state) => { state.loading = true; state.error = null; })
			.addCase(updateUserProfile.fulfilled, (state) => { state.loading = false; })
			.addCase(updateUserProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

			.addCase(changePassword.pending, (state) => { state.loading = true; state.error = null; })
			.addCase(changePassword.fulfilled, (state) => { state.loading = false; })
			.addCase(changePassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

			.addCase(fetchReadingHistory.pending, (state) => { state.historyLoading = true; })
			.addCase(fetchReadingHistory.fulfilled, (state, action) => { state.historyLoading = false; state.history = action.payload; })
			.addCase(fetchReadingHistory.rejected, (state) => { state.historyLoading = false; })

			.addCase(fetchNotifications.pending, (state) => { state.notificationsLoading = true; })
			.addCase(fetchNotifications.fulfilled, (state, action) => { state.notificationsLoading = false; state.notifications = action.payload; })
			.addCase(fetchNotifications.rejected, (state) => { state.notificationsLoading = false; })

			.addCase(requestTopup.pending, (state) => { state.loading = true; state.error = null; })
			.addCase(requestTopup.fulfilled, (state) => { state.loading = false; })
			.addCase(requestTopup.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
			.addCase(buyVip.pending, (state) => { state.loading = true; state.error = null; })
			.addCase(buyVip.fulfilled, (state) => { state.loading = false; })
			.addCase(buyVip.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
			.addCase(requestWithdraw.pending, (state) => { state.loading = true; state.error = null; })
			.addCase(requestWithdraw.fulfilled, (state) => { state.loading = false; })
			.addCase(requestWithdraw.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
			.addCase(requestAuthorRole.pending, (state) => { state.loading = true; state.error = null; })
			.addCase(requestAuthorRole.fulfilled, (state) => { state.loading = false; })
			.addCase(requestAuthorRole.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
	},
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
