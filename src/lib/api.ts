import axios from "axios";
import config from "../config";

// const baseUrl =
//       config.VITE_ENV === "production"
//         ? config.API_URL
//         : "http://localhost:3000/v1";

// export const api = axios.create({
//   baseURL: baseUrl,
//   withCredentials: true,
//   headers: {
//     Authorization: `Bearer ${config.APIKEY}`, // remove if using only httpOnly cookies
//     "Cache-Control": "no-cache",
//   },
// });

const baseUrl = "/v1";

export const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// 🔐 Refresh state management
let isRefreshing = false;
let refreshSubscribers: any[] = [];

const subscribeTokenRefresh = (callback: any) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// Global navigation function for auth redirects
let navigateFunction: ((to: string) => void) | null = null;
let authRefreshCallback: (() => void) | null = null;

export const setAuthNavigate = (navigate: (to: string) => void) => {
  navigateFunction = navigate;
};

export const setAuthRefreshCallback = (callback: () => void) => {
  authRefreshCallback = callback;
};

api.interceptors.response.use(
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
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/profile") ||
      originalRequest?.url?.includes("/account/login")
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
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        await api.get("/auth/refresh");

        isRefreshing = false;
        onRefreshed();

        // Notify UserProvider that auth was refreshed
        if (authRefreshCallback) {
          authRefreshCallback();
        }

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        // 🔐 Redirect to login if refresh fails
        if (navigateFunction) {
          navigateFunction("/login");
        } else {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);