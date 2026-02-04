import { Request, Response } from "express";

export interface user {
    _id: string;
    email: string;
    [key: string]: unknown;
}

export interface CustomeRequest extends Request {
    user?: user;
}