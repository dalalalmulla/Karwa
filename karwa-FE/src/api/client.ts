import axios from "axios";
import { getToken } from "../utils/token";

const BASE_URL = "http://localhost:8000/api"; // إذا بتشغلين من موبايل/Expo Go راح نغيره لاحقاً

export const api = axios.create({
  baseURL: BASE_URL,
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
