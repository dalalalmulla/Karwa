import { api } from "./client";

export type TaskStatus = "OPEN" | "IN_PROGRESS" | "DONE";
export type TaskType = "indoor" | "outdoor" | "home_service" | "car_service";

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
};

export const getTasksApi = async (params?: GetTasksParams) => {
  const res = await api.get<GetTasksResponse>("/tasks", { params });
  return res.data;
};
