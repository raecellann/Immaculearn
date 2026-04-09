import axios from "axios";
import config from "../config";

// const baseUrl =
//       config.VITE_ENV === "production"
//         ? config.API_URL
//         : "http://localhost:3000/v1";


// export const adminApi = axios.create({
//   baseURL: baseUrl,
//   withCredentials: true,
//   headers: {
//     Authorization: `Bearer ${config.APIKEY}`,
//     "Cache-Control": "no-cache",
//   },
// });


const baseUrl = "/v1";

export const adminApi = axios.create({
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

adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    

    const originalRequest = error.config;

    // 🛑 If no response (network/server down)
    if (!error.response) {
      console.error("Network error or server unreachable");
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 🚨 Do NOT retry refresh, profile, or login endpoints
    if (
      originalRequest?.url?.includes("/admin/refresh") ||
      originalRequest?.url?.includes("/admin/profile") ||
      originalRequest?.url?.includes("/admin/login")
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