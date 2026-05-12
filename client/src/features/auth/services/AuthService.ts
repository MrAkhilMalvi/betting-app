import axios from "@/providers/axios";
import { API_ENDPOINTS } from "@/providers/api-config";

export const signupApi = async (data: {
  username: string;
  email?: string;
  password: string;
}) => {
  try {
    const res = await axios.post(API_ENDPOINTS.AUTH.SIGNUP, data);

    return res.data;
  } catch (error: any) {
    console.error("Signup error:", error);

    throw new Error(error?.response?.data?.message || "Signup failed");
  }
};

export const loginApi = async (data: {
  identifier: string;
  password: string;
}) => {
  try {
    const res = await axios.post(API_ENDPOINTS.AUTH.LOGIN, data);

    return res.data;
  } catch (error: any) {
    console.error("Login error:", error);

    throw new Error(error?.response?.data?.message || "Login failed");
  }
};

export const googleLoginApi = async (token: string) => {
  try {
    const res = await axios.post(API_ENDPOINTS.AUTH.GOOGLE, { token });

    return res.data;
  } catch (error: any) {
    console.error("Google login error:", error);

    throw new Error(error?.response?.data?.message || "Google login failed");
  }
};

export const logoutApi = async () => {
  try {
    const res = await axios.post(API_ENDPOINTS.AUTH.LOGOUT);

    return res.data;
  } catch (error: any) {
    console.error("Logout error:", error);

    throw new Error(error?.response?.data?.message || "Logout failed");
  }
};

export const getMeApi = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.AUTH.ME);

    return res.data;
  } catch (error: any) {
    console.error("Get user error:", error);

    throw new Error(error?.response?.data?.message || "Failed to fetch user");
  }
};

export const getWalletApi = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.WALLET.GET);

    return res.data;
  } catch (error: any) {
    console.error("Get wallet error:", error);

    throw new Error(error?.response?.data?.message || "Failed to fetch wallet");
  }
};
