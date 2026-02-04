export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Worker {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
}

export interface Application {
    _id: string;
    workerId: Worker;
    taskId: string;
    status: ApplicationStatus;
    createdAt: string;
    updatedAt: string;
}

export interface ApplicationWithTask extends Application {
    task: {
        _id: string;
        title: string;
        description: string;
        money: number;
        location: string;
        type: string;
        status: string;
        posterId: string;
        createdAt: string;
        updatedAt: string;
    };
}

export interface ApplyToTaskData {
    taskId: string;
}

export interface ApplyToTaskResponse {
    success: boolean;
    data: {
        application: Application;
    };
    error?: string;
}

export interface GetApplicationsResponse {
    success: boolean;
    data: {
        applications: Application[];
    };
    error?: string;
}

export interface GetMyApplicationsResponse {
    success: boolean;
    data: {
        applications: ApplicationWithTask[];
    };
    error?: string;
}

