import axios from "axios";
import config from "../config";

export const adminApi = axios.create({
  baseURL: "http://localhost:3000/v1",
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${config.APIKEY}`, // remove if using only httpOnly cookies
    "Cache-Control": "no-cache",
  },
});

// 🔐 Refresh state management
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🛑 If no response (network/server down)
    if (!error.response) {
      console.error("Network error or server unreachable");
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 🚨 Do NOT retry refresh or profile endpoints
    if (
      originalRequest?.url?.includes("/admin/refresh") ||
      originalRequest?.url?.includes("/admin/profile")
    ) {
      return Promise.reject(error);
    }

    // 🔁 Handle 401 Unauthorized
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing → queue request
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(adminApi(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        await adminApi.get("/admin/refresh");

        isRefreshing = false;
        onRefreshed();

        return adminApi(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        // 🔐 Redirect to login if refresh fails
        window.location.href = "/admin/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);