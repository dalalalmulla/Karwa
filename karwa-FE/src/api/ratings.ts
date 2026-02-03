import instance from './axios';
import type {
  CreateRatingData,
  CreateRatingResponse,
  GetRatingResponse,
} from '../types/ratingTypes';

export const createOrUpdateRating = async (
  data: CreateRatingData
): Promise<CreateRatingResponse['data']> => {
  try {
    const response = await instance.post<CreateRatingResponse>('/ratings', data);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to save rating');
    }

    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to save rating');
  }
};

export const getRating = async (taskId: string): Promise<GetRatingResponse['data']> => {
  try {
    const response = await instance.get<GetRatingResponse>(`/ratings/task/${taskId}`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch rating');
    }

    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch rating');
  }
};

