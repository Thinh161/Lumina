import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthSlice";
import storyReducer from "./StorySlice";
import libraryReducer from "./LibrarySlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		story: storyReducer,
		library: libraryReducer,
	},
});
