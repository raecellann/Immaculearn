import axios from "axios";
import config from "../config";

export const api = axios.create({
    // baseURL: "https://immaculearn.up.railway.app/v1",
    baseURL: "http://localhost:3000/v1",
    withCredentials: true,
    headers: {
        Authorization: `Bearer ${config.APIKEY || "immaculearn_apikey"}`,
        "Cache-Control": "no-cache",
    },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: any[] = [];

// Process queued requests after refresh
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

// Response interceptor for automatic token refresh
api.interceptors.response.use(
    (response) => response, // Any status code that lie within the range of 2xx cause this function to trigger
    async (error) => {
        const originalRequest = error.config;

        // If error is not 401 or request has already been retried, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // If already refreshing, queue the request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                return api(originalRequest);
            }).catch((err) => {
                return Promise.reject(err);
            });
        }

        // Mark as refreshing
        isRefreshing = true;
        originalRequest._retry = true;

        try {
            // Attempt to refresh the token
            const refreshResponse = await api.post("/auth/refresh");
            
            if (refreshResponse.data?.success) {
                // Token refreshed successfully
                processQueue(null, refreshResponse.data.token);
                
                // Retry the original request
                return api(originalRequest);
            } else {
                // Refresh failed
                processQueue(error, null);
                return Promise.reject(error);
            }
        } catch (refreshError) {
            // Refresh request failed
            processQueue(refreshError, null);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);
