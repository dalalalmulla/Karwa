import axios from "axios";
import { Platform } from "react-native";
import { getToken } from "../utils/token";

// Get base URL based on platform - same as axios.ts
const getBaseURL = () => {
  if (__DEV__) {
    // For iOS Simulator, use Mac's IP address
    // For Android Emulator, use '10.0.2.2'
    // For Physical Device, use your Mac's IP address
    return 'http://192.168.3.170:8000/api'; // Replace with your Mac's IP
  }
  // Production URL
  return 'http://192.168.3.170:8000/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // Increased to 30 seconds for mobile devices
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically before every request
api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
