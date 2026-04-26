import axios from "./axios";
import { API_ENDPOINTS } from "./api-config";

// 🔵 Signup
export const signupApi = (data: {
  username: string;
  email?: string;
  password: string;
}) => {
  return axios.post(API_ENDPOINTS.AUTH.SIGNUP, data);
};

// 🔵 Login (username OR email)
export const loginApi = (data: {
  identifier: string;
  password: string;
}) => {
  return axios.post(API_ENDPOINTS.AUTH.LOGIN, data);
};

// 🔵 Google Login
export const googleLoginApi = (token: string) => {
  return axios.post(API_ENDPOINTS.AUTH.GOOGLE, { token });
};

// 🔴 Logout
export const logoutApi = () => {
  return axios.post(API_ENDPOINTS.AUTH.LOGOUT);
};

// 🔐 Get current user
export const getMeApi = () => {
  return axios.get(API_ENDPOINTS.AUTH.ME);
};