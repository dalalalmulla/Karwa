import instance from './axios';
import type {
    ApplyToTaskData,
    ApplyToTaskResponse,
    GetApplicationsResponse,
    GetMyApplicationsResponse,
    ApplicationStatus,
} from '../types/applicationTypes';

export const applyToTask = async (data: ApplyToTaskData): Promise<ApplyToTaskResponse['data']> => {
    try {
        const response = await instance.post<ApplyToTaskResponse>('/applications', data);

        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to apply to task');
        }

        return response.data.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to apply to task');
    }
};

export const getMyApplications = async (
    status?: ApplicationStatus
): Promise<GetMyApplicationsResponse['data']> => {
    try {
        const params: Record<string, string> = {};
        if (status) params.status = status;

        const response = await instance.get<GetMyApplicationsResponse>('/applications/me', { params });

        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch applications');
        }

        return response.data.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to fetch applications');
    }
};

export const getTaskApplications = async (taskId: string): Promise<GetApplicationsResponse['data']> => {
    try {
        const response = await instance.get<GetApplicationsResponse>(`/tasks/${taskId}/applications`);

        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch applications');
        }

        return response.data.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to fetch applications');
    }
};

