import axios from 'axios';
import { Platform } from 'react-native';
import instance from './axios';

export type TaskType = 'indoor' | 'outdoor';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface CreateTaskData {
  title: string;
  description: string;
  pictures?: string[];
  money: number;
  location: string;
  type: TaskType;
}

export interface TaskUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  rating?: number;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  pictures: string[];
  money: number;
  location: string;
  type: string;
  points: number;
  status: string;
  posterId: TaskUser | string;
  assignedWorkerId?: TaskUser | string;
  createdAt: string;
  updatedAt: string;
}

export interface Applicant {
  _id: string;
  applicantId: TaskUser;
  status: string;
  createdAt: string;
}

export interface GetTaskByIdResponse {
  success: boolean;
  data: {
    task: Task;
    applicants: Applicant[];
    hasRatedByPoster?: boolean;
    hasApplied?: boolean;
  };
}

export interface AssignWorkerResponse {
  success: boolean;
  data: {
    task: Task;
  };
}

export interface CreateTaskResponse {
  success: boolean;
  data: {
    task: Task;
  };
  error?: string;
}

export interface GetTasksResponse {
  success: boolean;
  data: {
    tasks: Task[];
  };
  error?: string;
}

export const createTask = async (data: CreateTaskData): Promise<CreateTaskResponse['data']> => {
  try {
    console.log('Creating task with data:', {
      title: data.title,
      description: data.description?.substring(0, 50) + '...',
      money: data.money,
      location: data.location,
      type: data.type,
      picturesCount: data.pictures?.length || 0,
    });

    const response = await instance.post<CreateTaskResponse>('/tasks', {
      title: data.title,
      description: data.description,
      pictures: data.pictures || [],
      money: data.money,
      location: data.location,
      type: data.type,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create task');
    }

    console.log('Task created successfully:', response.data.data?.task?._id);
    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Connection timeout. Please check if the server is running and try again.');
      }

      // Handle network errors
      if (error.code === 'ERR_NETWORK' || !error.response) {
        throw new Error('Network error. Please check your connection and ensure the server is running.');
      }

      // Handle specific HTTP status codes
      if (status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      if (status === 400) {
        const errorMessage = errorData?.error || 'Invalid task data. Please check all fields.';
        throw new Error(errorMessage);
      }
      if (status === 500) {
        throw new Error('Server error. Please try again later.');
      }

      const errorMessage =
        errorData?.error || error.message || 'Failed to create task';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getTasks = async (params?: {
  status?: string;
  type?: string;
  posterId?: string;
}): Promise<Task[]> => {
  const response = await instance.get<{ success: boolean; data: { tasks: Task[] } }>('/tasks', {
    params,
  });
  if (!response.data.success) throw new Error('Failed to fetch tasks');
  return response.data.data.tasks;
};

export const getTaskById = async (id: string): Promise<GetTaskByIdResponse['data']> => {
  const response = await instance.get<GetTaskByIdResponse>(`/tasks/${id}`);
  if (!response.data.success) {
    const err = response.data as { success: false; error?: string };
    throw new Error(err.error || 'Failed to fetch task');
  }
  return response.data.data;
};

export const assignWorker = async (
  taskId: string,
  applicantId: string
): Promise<AssignWorkerResponse['data']> => {
  const response = await instance.patch<AssignWorkerResponse>(`/tasks/${taskId}/assign`, {
    applicantId,
  });
  if (!response.data.success) throw new Error('Failed to assign worker');
  return response.data.data;
};

export const applyToTask = async (taskId: string): Promise<void> => {
  const response = await instance.post<{ success: boolean }>(`/tasks/${taskId}/apply`);
  if (!response.data.success) throw new Error('Failed to apply to task');
};

export const markCompleteByWorker = async (
  taskId: string
): Promise<AssignWorkerResponse['data']> => {
  const response = await instance.patch<AssignWorkerResponse>(
    `/tasks/${taskId}/mark-complete`
  );
  if (!response.data.success) {
    const err = response.data as { success: false; error?: string };
    throw new Error(err.error || 'Failed to mark task complete');
  }
  return response.data.data;
};

export const confirmCompletion = async (
  taskId: string
): Promise<AssignWorkerResponse['data']> => {
  const response = await instance.patch<AssignWorkerResponse>(`/tasks/${taskId}/complete`);
  if (!response.data.success) {
    const err = response.data as { success: false; error?: string };
    throw new Error(err.error || 'Failed to confirm completion');
  }
  return response.data.data;
};

export const submitRating = async (
  taskId: string,
  rating: number
): Promise<{ message: string; rating: number; workerRating: number | null }> => {
  const response = await instance.post<{
    success: boolean;
    data: { message: string; rating: number; workerRating: number | null };
  }>(`/tasks/${taskId}/rate`, { rating });
  if (!response.data.success) {
    const err = response.data as { success: false; error?: string };
    throw new Error(err.error || 'Failed to submit rating');
  }
  return response.data.data;
};

export interface UpdateTaskData {
  title?: string;
  description?: string;
  pictures?: string[];
  money?: number;
  location?: string;
  type?: TaskType;
}

export interface UpdateTaskResponse {
  success: boolean;
  data: {
    task: Task;
  };
  error?: string;
}

export const updateTask = async (
  taskId: string,
  data: UpdateTaskData
): Promise<UpdateTaskResponse['data']> => {
  try {
    const response = await instance.put<UpdateTaskResponse>(`/tasks/${taskId}`, data);
    if (!response.data.success) {
      console.log("test -----------", response)
      throw new Error(response.data.error || 'Failed to update task');
    }
    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to update task';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export interface DeleteTaskResponse {
  success: boolean;
  data: {
    message: string;
  };
  error?: string;
}

export const uploadImages = async (uris: string[]): Promise<string[]> => {
  const formData = new FormData();

  // Map file extensions to correct MIME types (matching backend expectations)
  const getMimeType = (uri: string): string => {
    // Extract extension from URI
    const filename = uri.split('/').pop() || uri.split('\\').pop() || 'photo.jpg';
    const ext = filename.toLowerCase().split('.').pop() || '';

    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',   // Backend expects 'image/jpeg', not 'image/jpg'
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };

    const mimeType = mimeMap[ext];
    if (!mimeType) {
      console.warn(`Unknown file extension: ${ext}, defaulting to image/jpeg`);
    }
    return mimeType || 'image/jpeg';
  };

  for (const uri of uris) {
    const filename = uri.split('/').pop() || uri.split('\\').pop() || 'photo.jpg';
    const type = getMimeType(uri);

    console.log(`Uploading image: ${filename}, MIME type: ${type}, URI: ${uri}`);

    // Android-specific FormData structure
    if (Platform.OS === 'android') {
      // For Android, ensure URI is properly formatted
      const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;
      formData.append('images', {
        uri: fileUri,
        name: filename,
        type,
      } as any);
    } else {
      // iOS/Web
      formData.append('images', {
        uri,
        name: filename,
        type,
      } as any);
    }
  }

  console.log(formData)

  try {
    // Don't set Content-Type - let axios handle it automatically with boundary
    // The interceptor will remove it if needed
    const response = await instance.post<{
      success: boolean;
      data?: { urls: string[] };
      error?: string;
    }>(
      '/uploads',
      formData
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to upload images');
    }

    if (!response.data.data?.urls) {

      throw new Error('No image URLs returned from server');
    }

    return response.data.data.urls;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Network errors don't have response.data
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        const baseURL = instance.defaults.baseURL;
        const errorMessage = `Network error on ${Platform.OS}: Cannot reach server at ${baseURL}/uploads. 
        
Possible causes:
1. Backend server not running (port 8000)
2. Phone and Mac not on same WiFi network
3. Mac's IP address changed
4. Firewall blocking connection
5. Android network security blocking HTTP

Error details: ${error.message || error.code}`;

        console.error('Network error details:', {
          platform: Platform.OS,
          message: error.message,
          code: error.code,
          baseURL,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });

        throw new Error(errorMessage);
      }

      const errorMessage =
        (error.response?.data as any)?.error ||
        error.message ||
        'Failed to upload images';
      console.error('Upload error:', errorMessage, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const response = await instance.delete<DeleteTaskResponse>(`/tasks/${taskId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete task');
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to delete task';
      throw new Error(errorMessage);
    }
    throw error;
  }
};
