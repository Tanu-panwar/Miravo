// src/lib/redux/ReduxStore.ts

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthSlice";
import PostsSlice from "./PostsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: PostsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
