export interface User {
    _id: string;
    email: string;
    name?: string;
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
