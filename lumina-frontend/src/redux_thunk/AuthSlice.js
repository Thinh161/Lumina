import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = 'http://10.106.42.73:5555/api';

// 1. Thunk: Gọi API Đăng nhập
export const loginUser = createAsyncThunk("auth/loginUser",
	async (credentials, { rejectWithValue }) => {
		try {
			const data = await fetch(`${API_URL}/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(credentials)
			}).then(res => res.json());
			
			console.log('Login API:', data); // debug
			
			if (data.status === "success") return data.user;
			return rejectWithValue(data.message || "Tài khoản hoặc mật khẩu không đúng.");
		} catch (error) {
			return rejectWithValue("Không thể kết nối đến server.");
		}
	}
);

// 2. Thunk: Gọi API Đăng ký
export const registerUser = createAsyncThunk("auth/registerUser",
	async (userInfo, { rejectWithValue }) => {
		try {
			const data = await fetch(`${API_URL}/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(userInfo)
			}).then(res => res.json());

			console.log('Register API:', data); // debug
			
			if (data.status === "success") return data.message;
			return rejectWithValue(data.message || "Đăng ký thất bại.");
		} catch (error) {
			return rejectWithValue("Không thể kết nối đến server.");
		}
	}
);

// 3. Thunk: Lấy thông tin người dùng theo ID
export const fetchUserProfile = createAsyncThunk("auth/fetchUserProfile",
	async (userId, { rejectWithValue }) => {
		try {
			const data = await fetch(`${API_URL}/users/${userId}`).then(res => res.json());
			if (data.status === "success") return data.user;
			return rejectWithValue(data.message || "Không lấy được thông tin người dùng.");
		} catch (error) {
			return rejectWithValue("Không thể kết nối đến server.");
		}
	}
);

const authSlice = createSlice({
	name: "auth",
	initialState: {
		user: null,         // Lưu thông tin người dùng sau khi login
		loading: false,     // Trạng thái đang gọi API
		error: null,        // Lưu câu báo lỗi
	},
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		logout: (state) => {
			state.user = null;
		}
	},
	extraReducers: (builder) => {
		builder
			// Xử lý Login
			.addCase(loginUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload; // Có user data
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Xử lý Register
			.addCase(registerUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(registerUser.fulfilled, (state) => {
				state.loading = false;
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Xử lý lấy thông tin người dùng
			.addCase(fetchUserProfile.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUserProfile.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload;
			})
			.addCase(fetchUserProfile.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	}
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;
