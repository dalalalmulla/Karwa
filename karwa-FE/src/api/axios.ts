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
  if (__DEV__) {
    // IMPORTANT: Update this IP address to match your Mac's current IP
    // To find your Mac's IP address, run in terminal: ipconfig getifaddr en0
    // Or check System Preferences > Network > Wi-Fi > Advanced > TCP/IP
    // For Android Emulator, use: '10.0.2.2'
    // For iOS Simulator, you can use: 'localhost' or your Mac's IP
    // For Physical Devices, use your Mac's IP address (both devices must be on same WiFi)
    const macIP = '192.168.13.180'; // ⚠️ UPDATE THIS with your current Mac IP address

    // Alternative: Use environment variable if set
    const envIP = process.env.EXPO_PUBLIC_API_IP;
    const ipToUse = envIP || macIP;

    return `http://${ipToUse}:8000/api`;
  }
  // Production URL - update this for production deployment
  return process.env.EXPO_PUBLIC_API_URL || 'http://192.168.13.180:8000/api';
};

const instance = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // Increased to 60 seconds for slow networks
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
        if (__DEV__) {
          console.log('Token added to request:', token.substring(0, 20) + '...');
        }
      }
      // No token is expected for public routes, so we don't warn
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
    const baseURL = error.config?.baseURL || getBaseURL();

    // Handle network errors (no response received)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
      const platform = Platform.OS;
      const isAndroid = platform === 'android';
      const isEmulator = isAndroid && baseURL.includes('10.0.2.2');

      let errorMessage = `Network Error: Cannot reach server at ${baseURL}\n\n`;

      if (isEmulator) {
        errorMessage += `You're using Android Emulator.\n`;
        errorMessage += `Make sure:\n`;
        errorMessage += `1. Backend server is running on port 8000\n`;
        errorMessage += `2. Using 10.0.2.2 for emulator (current: ${baseURL})\n`;
      } else {
        errorMessage += `Platform: ${platform}\n`;
        errorMessage += `Server URL: ${baseURL}\n\n`;
        errorMessage += `Possible solutions:\n`;
        errorMessage += `1. Check if backend server is running (port 8000)\n`;
        errorMessage += `2. Verify your Mac's IP address hasn't changed\n`;
        errorMessage += `3. Ensure device/emulator is on the same WiFi network\n`;
        errorMessage += `4. Check firewall settings\n`;
        if (isAndroid) {
          errorMessage += `5. Android: Add network security config for HTTP (if using HTTP)\n`;
        }
      }

      console.error('Network error details:', {
        platform,
        code: error.code,
        message: error.message,
        baseURL,
        url: error.config?.url,
        fullURL: `${baseURL}${error.config?.url}`,
      });

      error.message = errorMessage;
      return Promise.reject(error);
    }

    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('Request timeout:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout,
      });
      error.message = `Connection timeout after ${error.config?.timeout || 60000}ms.\n\nPlease check:\n1. Server is running at ${baseURL}\n2. Your network connection\n3. Server is not overloaded`;
    }

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
