import axios from 'axios';
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

export interface Task {
  _id: string;
  title: string;
  description: string;
  pictures: string[];
  money: number;
  location: string;
  type: TaskType;
  points: number;
  status: TaskStatus;
  posterId: string;
  createdAt: string;
  updatedAt: string;
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

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to create task';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getTasks = async (status?: TaskStatus, type?: TaskType): Promise<GetTasksResponse['data']> => {
  try {
    const params: any = {};
    if (status) params.status = status;
    if (type) params.type = type;

    const response = await instance.get<GetTasksResponse>('/tasks', { params });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch tasks');
    }

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to fetch tasks';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

