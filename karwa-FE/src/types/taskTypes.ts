export type TaskType = 'indoor' | 'outdoor' | 'home_service' | 'car_service';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

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
  posterId: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  pictures?: string[];
  money: number;
  location: string;
  type: TaskType;
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

export interface Poster {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  rating: number;
}

export interface TaskApplication {
  _id: string;
  workerId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  status: string;
  createdAt: string;
}

export interface TaskDetails {
  _id: string;
  title: string;
  description: string;
  pictures: string[];
  money: number;
  location: string;
  type: TaskType;
  points: number;
  status: TaskStatus;
  poster: Poster;
  createdAt: string;
  updatedAt: string;
  hasApplied: boolean;
  applications?: TaskApplication[];
}

export interface GetTaskByIdResponse {
  success: boolean;
  data: {
    task: TaskDetails;
  };
  error?: string;
}

