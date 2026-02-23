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

    // If token expired and not retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint
        await api.post(
          `/auth/refresh`,
        );

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Optional: redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);