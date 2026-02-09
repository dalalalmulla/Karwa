import axios from 'axios';
import instance from './axios';
import * as SecureStore from 'expo-secure-store';
import { saveToken } from '../utils/token';

export type UserRole = 'poster' | 'worker' | 'both';

export interface RegisterData {
  name?: string;
  email: string;
  civilId?: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole; // User role: 'poster' (task creator), 'worker' (task doer), or 'both'
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      civilId?: string;
      role?: UserRole;
    };
    token: string;
  };
  error?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role?: UserRole;
    };
    token: string;
  };
  error?: string;
}

export const register = async (data: RegisterData): Promise<RegisterResponse['data']> => {
  try {
    const response = await instance.post<RegisterResponse>('/auth/register', {
      name: data.name,
      email: data.email,
      civilId: data.civilId,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'both', // Default to 'both' if not provided
    });

    if (response.data.success && response.data.data.token) {
      // Store token in SecureStore using consistent key
      await saveToken(response.data.data.token);
    }

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage =
        errorData?.error || error.message || 'Registration failed';

      // Log detailed error for debugging
      console.error('Registration error:', {
        status,
        message: errorMessage,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        errorData,
      });

      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const loginUser = async (data: LoginData): Promise<LoginResponse['data']> => {
  try {
    const response = await instance.post<LoginResponse>('/auth/login', {
      email: data.email,
      password: data.password,
    });

    if (response.data.success && response.data.data.token) {
      // Store token in SecureStore
      await saveToken(response.data.data.token);
    }

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage =
        errorData?.error || error.message || 'Login failed';

      // Log detailed error for debugging
      console.error('Login error:', {
        status,
        message: errorMessage,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        errorData,
      });

      throw new Error(errorMessage);
    }
    throw error;
  }
};

export interface GetCurrentUserResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      ratingAverage?: number;
      completedTasksCount?: number;
      earnedPoints?: number;
      notificationCount?: number;
      createdAt: string;
      updatedAt: string;
    };
  };
  error?: string;
}

export const getCurrentUser = async (): Promise<GetCurrentUserResponse['data']> => {
  try {
    const response = await instance.get<GetCurrentUserResponse>('/auth/me');

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch user profile');
    }

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to fetch user profile';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export interface UpdateUserRoleResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role?: UserRole;
    };
  };
  error?: string;
}

export const updateUserRole = async (role: UserRole): Promise<UpdateUserRoleResponse['data']> => {
  try {
    const response = await instance.patch<UpdateUserRoleResponse>('/auth/role', { role });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update user role');
    }

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to update user role';
      throw new Error(errorMessage);
    }
    throw error;
  }
};
