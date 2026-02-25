import { createContext } from "react";
import { Admin, AdminStats } from "../../types/admin";

export interface AdminContextType {
    admin: Admin | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshAdmin: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
    createAdmin: (payload: any) => Promise<boolean>;
    getAdminStats: () => Promise<{ success: boolean; data?: AdminStats; message?: string }>;
    updateAdmin: (adminId: string, payload: any) => Promise<boolean>;
    deleteAdmin: (adminId: string) => Promise<boolean>;
}

export const AdminContext = createContext<AdminContextType | undefined>(
    undefined
);