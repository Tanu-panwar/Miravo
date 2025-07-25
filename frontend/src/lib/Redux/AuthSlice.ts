import { AuthState, LoginData, SignupData } from "@/app/types/auth.types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@/lib/axios";

// Helpers
const getInitialToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("token") || null : null;

const getInitialAuth = (): boolean =>
  typeof window !== "undefined" && !!localStorage.getItem("token");

const saveToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

// Initial state
const initialState: AuthState = {
  userData: null,
  userToken: getInitialToken(),
  isAuth: getInitialAuth(),
  isError: false,
  isLoading: false,
  userInfo: {
    message: "",
    user: {
      _id: "",
      name: "",
      email: "",
      photo: "",
      gender: "",
      dateOfBirth: "",
      createdAt: "",
    },
  },
};

// Thunks
export const login = createAsyncThunk(
  "auth/login",
  async (data: LoginData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/auth/login", data);
      saveToken(res.data.token);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (data: SignupData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/auth/register", data);
      saveToken(res.data.token);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Signup failed");
    }
  }
);

export const getMyInfo = createAsyncThunk(
  "auth/getMyInfo",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearUserData: (state) => {
      state.userToken = null;
      state.isAuth = false;
      state.userInfo = {
        message: "",
        user: {
          _id: "",
          name: "",
          email: "",
          photo: "",
          gender: "",
          dateOfBirth: "",
          createdAt: "",
        },
      };
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userToken = action.payload.token;
        state.isAuth = true;
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })

      // Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userToken = action.payload.token;
        state.isAuth = true;
      })
      .addCase(signup.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })

      // GetMyInfo
      .addCase(getMyInfo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyInfo.fulfilled, (state, action) => {
        const { username, ...rest } = action.payload;
        state.userInfo.user = {
          _id: rest._id || "",
          name: username || "",
          email: rest.email || "",
          photo: rest.photo || "",
          gender: rest.gender || "",
          dateOfBirth: rest.dateOfBirth || "",
          createdAt: rest.createdAt || "",
        };
        state.isAuth = true;
        state.isLoading = false;
      })
      .addCase(getMyInfo.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const { clearUserData } = authSlice.actions;
export default authSlice.reducer;
