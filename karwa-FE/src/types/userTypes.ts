export type UserRole = 'poster' | 'worker' | 'both';

export interface User {
    _id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    civilId?: string;
    role?: UserRole; // User role: 'poster' (task creator), 'worker' (task doer), or 'both'
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: true;
    data: {
        token: string;
        user: User;
    };
}

export interface ApiErrorResponse {
    success: false;
    error: string;
}
