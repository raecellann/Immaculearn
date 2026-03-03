import { createContext } from "react";
import { Admin, AdminStats, AnnouncementData, AnnouncementCreateData } from "../../types/admin";

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
    // Announcement functions
    createAnnouncement: (announcementData: AnnouncementCreateData) => Promise<{ success: boolean; message?: string; data?: AnnouncementData }>;
    getAllAnnouncements: () => Promise<{ success: boolean; message?: string; data?: AnnouncementData[] }>;
    updateAnnouncement: (announcement_id: number, announcementData: Partial<AnnouncementCreateData>) => Promise<{ success: boolean; message?: string; data?: AnnouncementData }>;
    deleteAnnouncement: (announcement_id: number) => Promise<{ success: boolean; message?: string }>;
    refreshAnnouncements: () => Promise<{ success: boolean; message?: string; data?: AnnouncementData[] }>;
}

export const AdminContext = createContext<AdminContextType | undefined>(
    undefined
);