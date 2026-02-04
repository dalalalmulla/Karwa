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
