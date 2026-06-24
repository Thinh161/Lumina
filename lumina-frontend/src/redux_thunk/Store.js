import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthSlice";
import storyReducer from "./StorySlice";
import libraryReducer from "./LibrarySlice";
import userReducer from "./UserSlice";
import actorReducer from "./ActorSlice";
import adminReducer from "./AdminSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		story: storyReducer,
		library: libraryReducer,
		user: userReducer,
		actor: actorReducer,
		admin: adminReducer,
	},
});
