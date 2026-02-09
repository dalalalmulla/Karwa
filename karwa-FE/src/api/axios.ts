import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from '../utils/token';
import { emitForceLogout } from '../utils/authEvents';

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
    // Remove Content-Type header for FormData - axios will set it automatically with boundary
    if (config.data instanceof FormData) {
      // More aggressive deletion for Android compatibility
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
      // Also remove from common headers if they exist
      if ((config.headers as any)?.common) {
        delete (config.headers as any).common['Content-Type'];
      }
      // Ensure axios doesn't try to set it
      config.transformRequest = [(data) => data];
    }

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
      // Token expired or invalid - clear token and notify the app
      try {
        const { clearToken } = await import('../utils/token');
        await clearToken();
        // Notify the React auth context so it clears state and redirects to login
        emitForceLogout();
      } catch (e) {
        console.error('Error during forced logout:', e);
      }
    }
    return Promise.reject(error);
  }
);

export { getBaseURL };
export default instance;
