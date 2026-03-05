import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { adminApi } from "../../lib/api.admin";
import { AdminContext, AdminContextType } from "./adminContext";
import { Admin, AdminStats, AnnouncementData, AnnouncementCreateData } from "../../types/admin";
import { adminService } from "../../services/adminService";

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await adminApi.get("/admin/profile");

      if (response.data?.success && response.data?.admin) {
        setAdmin(response.data.admin);
        setIsAuthenticated(true);
        return true;
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error: any) {
      console.log("Admin auth failed:", error.response?.status);
      
      // Try refresh if unauthorized
      if (error.response?.status === 401) {
        try {
          const refreshRes = await adminApi.get("/admin/refresh");
          if (refreshRes.data?.success) {
            const retryProfile = await adminApi.get("/admin/profile");
            if (retryProfile.data?.success && retryProfile.data?.admin) {
              setAdmin(retryProfile.data.admin);
              setIsAuthenticated(true);
              return true;
            }
          }
        } catch (refreshError) {
          console.log("Admin refresh failed:", refreshError);
        }
      }

      setAdmin(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await adminApi.post("/admin/login", { email, password });

      if (response.data?.success) {
        console.log("Admin login successful, cookies after login:", document.cookie);
        // Set authenticated state immediately after successful login
        setIsAuthenticated(true);
        // Set basic admin info from login response (skip profile fetch to avoid 401)
        setAdmin({
          id: response.data.admin?.id,
          email: email,
          fullname: response.data.admin?.fullname || email.split("@")[0],
          role: response.data.admin?.role,
        });

        return true;
      }

      return false;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await adminApi.post("/auth/logout"); // API should clear refresh token cookie
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  // Create new admin
  const createAdmin = async (payload: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await adminApi.post("/admin/create", payload);
      return response.data?.success || false;
    } catch (err) {
      console.error("Create admin error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get admin statistics
  const getAdminStats = async (): Promise<{ success: boolean; data?: AdminStats | undefined; message?: string }> => {
    try {
      const response = await adminApi.get("/admin/stats");
      return {
        success: true,
        data: response.data?.data
      };
    } catch (err) {
      console.error("Get admin stats error:", err);
      return {
        success: false,
        message: "Failed to get admin stats"
      };
    }
  };

  // Announcement functions
  const createAnnouncement = async (announcementData: AnnouncementCreateData): Promise<{ success: boolean; message?: string; data?: AnnouncementData }> => {
    try {
      setIsLoading(true);
      const result = await adminService.create_announcement(
        announcementData.title,
        announcementData.content,
        announcementData.target_audience,
        announcementData.scheduled_at,
        announcementData.publish_option
      );
      return result;
    } catch (err) {
      console.error("Create announcement error:", err);
      return {
        success: false,
        message: "Failed to create announcement"
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getAllAnnouncements = async (): Promise<{ success: boolean; message?: string; data?: AnnouncementData[] }> => {
    try {
      const result = await adminService.getAllAnnouncements();
      return result;
    } catch (err) {
      console.error("Get all announcements error:", err);
      return {
        success: false,
        message: "Failed to fetch announcements"
      };
    }
  };

  const updateAnnouncement = async (
    announcement_id: number,
    announcementData: Partial<AnnouncementCreateData>
  ): Promise<{ success: boolean; message?: string; data?: AnnouncementData }> => {
    try {
      setIsLoading(true);
      const result = await adminService.updateAnnouncement(
        announcement_id,
        announcementData.title,
        announcementData.content,
        announcementData.target_audience,
        announcementData.publish_option
      );
      return result;
    } catch (err) {
      console.error("Update announcement error:", err);
      return {
        success: false,
        message: "Failed to update announcement"
      };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAnnouncement = async (
    announcement_id: number
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const result = await adminService.deleteAnnouncement(announcement_id);
      return result;
    } catch (err) {
      console.error("Delete announcement error:", err);
      return {
        success: false,
        message: "Failed to delete announcement"
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh announcements
  const refreshAnnouncements = async (): Promise<{ success: boolean; message?: string; data?: AnnouncementData[] }> => {
    try {
      setIsLoading(true);
      const result = await adminService.getAllAnnouncements();
      return result;
    } catch (err) {
      console.error("Refresh announcements error:", err);
      return {
        success: false,
        message: "Failed to refresh announcements"
      };
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AdminContextType = {
    admin,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    createAdmin,
    getAdminStats,
    getAllAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
    refreshAnnouncements,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};
