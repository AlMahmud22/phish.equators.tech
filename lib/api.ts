import axios from "axios";

/// setup base axios instance for REST communication with PhishGuard backend
/// this instance is configured to communicate with the API at phish.equators.site/api
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  /// timeout after 10 seconds
  timeout: 10000,
});

/// request interceptor to add authentication token to headers
api.interceptors.request.use(
  (config) => {
    /// retrieve token from localStorage if available
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/// response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    /// handle 401 unauthorized errors by clearing token and redirecting to login
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

/// API helper functions for dashboard endpoints

/// fetch user scan history from backend
export const fetchScanHistory = async () => {
  const response = await api.get("/url/history");
  return response.data;
};

/// fetch user statistics for analytics dashboard
export const fetchUserStats = async () => {
  const response = await api.get("/user/stats");
  return response.data;
};

/// fetch user settings and preferences
export const fetchUserSettings = async () => {
  const response = await api.get("/user/settings");
  return response.data;
};

/// update user settings and preferences
export const updateUserSettings = async (settings: any) => {
  const response = await api.put("/user/settings", settings);
  return response.data;
};

export default api;
