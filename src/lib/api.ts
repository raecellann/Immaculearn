import axios from "axios";
import config from "../config";

export const api = axios.create({
  // baseURL: "https://immaculearnapi-template-production.up.railway.app/v1",
  baseURL: "http://localhost:3000/v1",
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${config.APIKEY}`,
    "Cache-Control": "no-cache",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🚨 Don't try to refresh if refresh endpoint itself fails
    if (
      originalRequest.url.includes("/auth/refresh") ||
      originalRequest.url.includes("/auth/profile")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.get("/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);