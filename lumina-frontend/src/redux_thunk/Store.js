import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthSlice";
import storyReducer from "./StorySlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		story: storyReducer,
		// Sau này bạn có thể thêm userReducer, adminReducer... vào đây
	},
});
