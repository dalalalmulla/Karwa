import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from '../utils/token';

// Get base URL based on platform
// const getBaseURL = () => {
//   if (Platform.OS === 'android') {
//     // return 'http://10.0.2.2:8000/api'; // Android emulator
//     return 'http://192.168.13.238:8000/api'; // Android emulator
//   }
//   return 'http://192.168.13.238:8000/api'; // iOS simulator / web
// };

// Create axios instance with base URL
// For iOS Simulator: use your Mac's IP address (run: ipconfig getifaddr en0)
// For Android Emulator: use 10.0.2.2
// For Physical Device: use your Mac's IP address on the same network
// For localhost: use localhost (only works for web)
const getBaseURL = () => {
  // Check if running on iOS Simulator or Android Emulator
  if (__DEV__) {
    // For iOS Simulator, use Mac's IP address
    // Replace with your Mac's IP: run 'ipconfig getifaddr en0' in terminal
    // For Android Emulator, use '10.0.2.2'
    // For Physical Device, use your Mac's IP address
    return 'http://192.168.14.239:8000/api'; // Replace with your Mac's IP
  }
  // Production URL
  return 'http://192.168.14.239:8000/api';
};

const instance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // Increased to 30 seconds for mobile devices
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
instance.interceptors.request.use(
  async (config) => {
    // console.log("first")
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token added to request:', token.substring(0, 20) + '...');
      } else {
        console.warn('No token found in SecureStore');
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
        const { clearToken } = await import('../utils/token');
        await clearToken();
      } catch (e) {
        console.error('Error deleting token:', e);
      }
    }
    return Promise.reject(error);
  }
);

export { getBaseURL };
export default instance;
