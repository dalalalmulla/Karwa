import axios from "axios";
import { getBaseURL } from "./axios";
import { Platform } from "react-native";
import { getToken } from "../utils/token";

// Get base URL based on platform
// const getBaseURL = () => {
//   if (Platform.OS === "android") {
//     // Android emulator uses 10.0.2.2 for localhost, physical device uses actual IP
//     return "http://192.168.6.120:8000/api";
//   }
//   // iOS simulator can use localhost, physical device needs actual IP
//   return "http://1192.168.6.120:8000/api";
// };




export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // Increased to 60 seconds for slow networks
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically before every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      // If no token, request proceeds without Authorization header (for public endpoints)
    } catch (error) {
      console.error("Error getting token:", error);
      // Continue without token for public endpoints
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle network errors
    if (error.code === "ERR_NETWORK" || error.message === "Network Error" || !error.response) {
      console.error("Network error:", {
        platform: Platform.OS,
        code: error.code,
        message: error.message,
        baseURL: error.config?.baseURL,
      });
      // Return a more user-friendly error
      error.message = `Network error: ${error.message || "Cannot reach server"}`;
      return Promise.reject(error);
    }

    // Handle 401 errors - but don't force logout for public endpoints
    if (error.response?.status === 401) {
      // Only clear token if we had one (user was logged in)
      try {
        const token = await getToken();
        if (token) {
          // User was logged in but token expired
          const { clearToken } = await import("../utils/token");
          await clearToken();
          const { emitForceLogout } = await import("../utils/authEvents");
          emitForceLogout();
        }
        // If no token, this is a public endpoint that requires auth - let the component handle it
      } catch (e) {
        console.error("Error during forced logout:", e);
      }
    }

    return Promise.reject(error);
  }
);
