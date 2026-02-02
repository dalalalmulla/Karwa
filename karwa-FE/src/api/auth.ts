import axios from 'axios';
import instance from './axios';
import * as SecureStore from 'expo-secure-store';

export interface RegisterData {
  name?: string;
  email: string;
  civilId?: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
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
      name?: string;
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
    });

    if (response.data.success && response.data.data.token) {
      // Store token in SecureStore
      await SecureStore.setItemAsync('token', response.data.data.token);
    }

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Registration failed';
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
      await SecureStore.setItemAsync('token', response.data.data.token);
    }

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
    throw error;
  }
};
