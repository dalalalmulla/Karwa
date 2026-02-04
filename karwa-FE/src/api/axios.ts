import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Get base URL based on platform
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    // return 'http://10.0.2.2:8000/api'; // Android emulator
    return 'http://192.168.8.109:8000/api'; // Android emulator
  }
  return 'http://192.168.8.109:8000/api'; // iOS simulator / web
};

// Create axios instance with base URL
const instance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
instance.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear token
      try {
        await SecureStore.deleteItemAsync('token');
      } catch (e) {
        console.error('Error deleting token:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
