import { UserInfo } from "./user.types";

export interface AuthState {
  userData: any | null;
  userToken: string | null;
  isAuth: boolean;
  isError: boolean;
  isLoading: boolean;
  userInfo: UserInfo; // ✅ use imported one
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
  gender: string;
}
