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
  timeout: 10000,
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
