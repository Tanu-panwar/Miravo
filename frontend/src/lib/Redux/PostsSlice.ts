import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios"; // uses baseURL + auto-token
import {
  Comment,
  CommentRequest,
  CommentResponse,
  Post as PostType,
  PostResponse,
} from "@/app/types/post.types";
import { UserInfo } from "@/app/types/user.types";
import { RootState } from "./ReduxStore";

interface InitialState {
  allPosts: PostType[] | null;
  myPosts: PostType[] | null;
  isLoading: boolean;
  isError: boolean;
  postComments: Comment[] | null;
  singlePost: PostType | null;
  myInfo: UserInfo | null;
  myId: string | null;
}

const initialState: InitialState = {
  allPosts: null,
  myPosts: null,
  isLoading: false,
  isError: false,
  postComments: null,
  singlePost: null,
  myInfo: null,
  myId: null,
};

interface getMyPostsArgs {
  id: string;
  limit?: number;
}

// ✅ Get single post by ID
export const getSinglePost = createAsyncThunk<PostResponse, string>(
  "posts/getSinglePost",
  async (id) => {
    const response = await axiosInstance.get(`/posts/${id}`);
    return response.data;
  }
);

// ✅ Get authenticated user's profile
export const getMyData = createAsyncThunk<UserInfo>(
  "posts/getMyData",
  async () => {
    const response = await axiosInstance.get("/user/profile");
    return response.data;
  }
);

// ✅ Get my own posts
export const getMyPosts = createAsyncThunk<PostType[], getMyPostsArgs>(
  "posts/getMyPosts",
  async ({ id, limit = 25 }) => {
    const response = await axiosInstance.get(`/users/${id}/posts?limit=${limit}`);
    return response.data.posts.reverse();
  }
);

// ✅ Get timeline posts or all posts
export const getPosts = createAsyncThunk<PostType[], number | undefined>(
  "posts/getPosts",
  async (limit = 25) => {
    const response = await axiosInstance.get(`/posts?limit=${limit}`);
    return response.data.posts.reverse();
  }
);

// ✅ Add a comment to a post
export const addComment = createAsyncThunk<CommentResponse, CommentRequest>(
  "posts/addComment",
  async (data) => {
    const response = await axiosInstance.post("/comments", data);
    return response.data;
  }
);
// SLICE
const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    resetSinglePost: (state) => {
      state.singlePost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPosts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.allPosts = action.payload;
        state.isLoading = false;
      })
      .addCase(getPosts.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });

    builder
      .addCase(addComment.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(addComment.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
      })
      .addCase(addComment.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });

    builder
      .addCase(getSinglePost.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getSinglePost.fulfilled, (state, action) => {
        state.singlePost = action.payload.post;
        state.isLoading = false;
      })
      .addCase(getSinglePost.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });

    builder
      .addCase(getMyPosts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getMyPosts.fulfilled, (state, action) => {
        state.myPosts = action.payload;
        state.isLoading = false;
      })
      .addCase(getMyPosts.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });

    builder
      .addCase(getMyData.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getMyData.fulfilled, (state, action) => {
        console.log("💾 Setting myId to:", action.payload.user._id);
        state.myInfo = action.payload;
        state.myId = action.payload.user._id;
      })
      .addCase(getMyData.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const { resetSinglePost } = postsSlice.actions;
export default postsSlice.reducer;
