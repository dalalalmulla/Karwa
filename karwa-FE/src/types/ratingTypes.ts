export interface Rating {
  _id: string;
  raterId: string;
  ratedUserId: string;
  taskId: string;
  rating: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingData {
  taskId: string;
  ratedUserId: string;
  rating: number; // 1-5
}

export interface CreateRatingResponse {
  success: boolean;
  data: {
    rating: Rating;
  };
  error?: string;
}

export interface GetRatingResponse {
  success: boolean;
  data: {
    rating: Rating | null;
  };
  error?: string;
}

