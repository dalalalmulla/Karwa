import instance from './axios';
import type {
  CreateTaskData,
  CreateTaskResponse,
  GetTasksResponse,
  GetTaskByIdResponse,
  TaskType,
  TaskStatus,
} from '../types/taskTypes';

export const createTask = async (data: CreateTaskData): Promise<CreateTaskResponse['data']> => {
  try {
    const response = await instance.post<CreateTaskResponse>('/tasks', data);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create task');
    }

    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create task');
  }
};

export const getTasks = async (status?: TaskStatus, type?: TaskType): Promise<GetTasksResponse['data']> => {
  try {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (type) params.type = type;

    const response = await instance.get<GetTasksResponse>('/tasks', { params });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch tasks');
    }

    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch tasks');
  }
};

export const getTaskById = async (taskId: string): Promise<GetTaskByIdResponse['data']> => {
  try {
    const response = await instance.get<GetTaskByIdResponse>(`/tasks/${taskId}`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch task details');
    }

    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch task details');
  }
};

