import { api } from "./client";
import { saveToken } from "../utils/token";


export type RegisterPayload = {
    email: string;
    password: string;
    civilId?: string;
    name?: string; 
    firstName?: string;
    lastName?: string;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type AuthResponse = {
    success: boolean;
    data?: {
        user: {
            _id: string;
            email: string;
            firstName?: string;
            lastName?: string;
            civilId?: string;
            createdAt?: string;
            updatedAt?: string;
        };
        token: string;
    };
    error?: string;
};

export const registerApi = async (payload: RegisterPayload) => {
    const res = await api.post<AuthResponse>("/auth/register", payload);

    if (res.data.success && res.data.data?.token) {
        await saveToken(res.data.data.token);
    }

    return res.data;
};

export const loginApi = async (payload: LoginPayload) => {
    const res = await api.post<AuthResponse>("/auth/login", payload);

    if (res.data.success && res.data.data?.token) {
        await saveToken(res.data.data.token);
    }

    return res.data;
};


export const meApi = async (token: string) => {
    const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
