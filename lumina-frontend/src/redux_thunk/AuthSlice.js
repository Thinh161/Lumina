import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateUserProfile } from "./UserSlice";
import api from '../config/axiosInstance';

export const loginUser = createAsyncThunk("auth/loginUser",
	async (credentials, { rejectWithValue }) => {
		try {
			const { data } = await api.post('/login', credentials);
			if (data.status === "success") return data.user;
			return rejectWithValue(data.message || "Tài khoản hoặc mật khẩu không đúng.");
		} catch {
			return rejectWithValue("Không thể kết nối đến server.");
		}
	}
);

export const registerUser = createAsyncThunk("auth/registerUser",
	async (userInfo, { rejectWithValue }) => {
		try {
			const { data } = await api.post('/register', userInfo);
			if (data.status === "success") return data.message;
			return rejectWithValue(data.message || "Đăng ký thất bại.");
		} catch {
			return rejectWithValue("Không thể kết nối đến server.");
		}
	}
);

export const resetPassword = createAsyncThunk("auth/resetPassword",
	async ({ username, email, newPassword }, { rejectWithValue }) => {
		try {
			const { data } = await api.post('/reset-password', { username, email, new_password: newPassword });
			if (data.status === 'success') return data.message;
			return rejectWithValue(data.message || "Xác minh thất bại.");
		} catch { return rejectWithValue("Không thể kết nối server."); }
	}
);

export const fetchUserProfile = createAsyncThunk("auth/fetchUserProfile",
	async (userId, { rejectWithValue }) => {
		try {
			const { data } = await api.get(`/users/${userId}`);
			if (data.status === "success") return data.user;
			return rejectWithValue(data.message || "Không lấy được thông tin người dùng.");
		} catch {
			return rejectWithValue("Không thể kết nối đến server.");
		}
	}
);

const authSlice = createSlice({
	name: "auth",
	initialState: {
		user: null,
		loading: false,
		error: null,
	},
	reducers: {
		clearError: (state) => { state.error = null; },
		logout: (state) => { state.user = null; },
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
			.addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
			.addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

			.addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
			.addCase(registerUser.fulfilled, (state) => { state.loading = false; })
			.addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

			.addCase(fetchUserProfile.pending, (state) => { state.loading = true; state.error = null; })
			.addCase(fetchUserProfile.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
			.addCase(fetchUserProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

			.addCase(updateUserProfile.fulfilled, (state, action) => { state.user = action.payload; });
	}
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;
