import { api } from "./client";

export type TaskStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TaskType = "indoor" | "outdoor";

export type Poster =
  | string
  | {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };

export type Task = {
  _id: string;
  title: string;
  description: string;
  pictures: string[];
  money: number;
  location: string;
  type: TaskType;
  points: number;
  status: TaskStatus;
  posterId: Poster;
  assignedWorkerId?: string | Poster; // User assigned to work on this task
  createdAt?: string;
  updatedAt?: string;
};

export type GetTasksResponse = {
  success: boolean;
  data?: {
    tasks: Task[];
  };
  error?: string;
};

export type GetTasksParams = {
  status?: TaskStatus;
  type?: TaskType;
  location?: string;
  minMoney?: number;
  maxMoney?: number;
  posterId?: string; // Use "me" to get current user's tasks as poster
};

export const getTasksApi = async (params?: GetTasksParams) => {
  const res = await api.get<GetTasksResponse>("/tasks", { params });
  return res.data;
};

export type CreateTaskData = {
  title: string;
  description: string;
  pictures?: string[];
  money: number;
  location: string;
  type: TaskType;
};

export type CreateTaskResponse = {
  success: boolean;
  data?: {
    task: Task;
  };
  error?: string;
};

export const createTask = async (data: CreateTaskData): Promise<CreateTaskResponse> => {
  const res = await api.post<CreateTaskResponse>("/tasks", data);
  return res.data;
};

// Update task status
export type UpdateTaskStatusData = {
  status: TaskStatus;
};

export type UpdateTaskStatusResponse = {
  success: boolean;
  data?: {
    task: Task;
  };
  error?: string;
};

export const updateTaskStatus = async (
  taskId: string,
  data: UpdateTaskStatusData
): Promise<UpdateTaskStatusResponse> => {
  const res = await api.patch<UpdateTaskStatusResponse>(`/tasks/${taskId}/status`, data);
  return res.data;
};