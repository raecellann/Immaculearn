import { createContext } from "react";

export interface User {
    id: string;
    email: string;
    username?: string;
    role?: string;
    [key: string]: any;
}

export interface UserContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: (account_id: number) => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
    createAccount: (payload: any) => Promise<boolean>;
}

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);
