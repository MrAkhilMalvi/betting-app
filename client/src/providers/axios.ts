import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // 🍪 REQUIRED for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 RESPONSE INTERCEPTOR (clean)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Unauthorized - session expired");

    }

    return Promise.reject(error);
  }
);

export default axiosInstance;