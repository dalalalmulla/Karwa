import { createContext, useContext } from "react";
import type { User } from "../types/userTypes";

export interface AuthContextValue {
    token: string | null;
    user: User | null;
    setToken: (token: string | null) => void;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthContext.Provider");
    }
    return ctx;
}
