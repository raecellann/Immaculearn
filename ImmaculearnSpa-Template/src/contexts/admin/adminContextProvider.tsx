import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { adminApi } from "../../lib/api.admin";
import { AdminContext, AdminContextType } from "./adminContext";
import {
  Admin,
  AdminStats,
  AnnouncementData,
  AnnouncementCreateData,
} from "../../types/admin";
import { adminService } from "../../services/adminService";

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const isCheckingRef = useRef(false);

  // Immediate auth state update
  const updateAuthState = useCallback(
    (authenticated: boolean, adminData: Admin | null) => {
      try {
        setIsAuthenticated(authenticated);
        setAdmin(adminData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in updateAuthState:", error);
      }
    },
    [],
  );

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    if (isCheckingRef.current) return isAuthenticated;
    isCheckingRef.current = true;
    setIsLoading(true);

    try {
      // Try profile
      const profileRes = await adminApi.get("/admin/profile");

      if (profileRes.data?.success && profileRes.data?.data) {
        updateAuthState(true, profileRes.data.data);
        return true;
      }

      throw new Error("No profile");
    } catch (error: any) {
      updateAuthState(false, null);
      return false;
    } finally {
      isCheckingRef.current = false;
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await adminApi.post(
        "/admin/login",
        { email, password },
        { withCredentials: true },
      );

      if (response.data?.success) {
        // Fetch admin profile after login
        await checkAuth();
        return true;
      }

      return false;
    } catch (err: unknown) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (account_id: number): Promise<void> => {
    try {
      await adminApi.post("/auth/logout", { user_id: account_id }); // API should clear refresh token cookie
    } catch (err) {
    } finally {
      updateAuthState(false, null);
      // Use navigate instead of window.location to avoid hard refresh
      navigate("/admin/login");
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
  const getAdminStats = async (): Promise<{
    success: boolean;
    data?: AdminStats | undefined;
    message?: string;
  }> => {
    try {
      const response = await adminApi.get("/admin/stats");
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (err) {
      console.error("Get admin stats error:", err);
      return {
        success: false,
        message: "Failed to get admin stats",
      };
    }
  };

  // Announcement functions
  const createAnnouncement = async (
    announcementData: AnnouncementCreateData,
  ): Promise<{
    success: boolean;
    message?: string;
    data?: AnnouncementData;
  }> => {
    try {
      setIsLoading(true);
      const result = await adminService.create_announcement(
        announcementData.title,
        announcementData.content,
        announcementData.target_audience,
        announcementData.publish_option,
        announcementData.images,
      );
      return result;
    } catch (err) {
      console.error("Create announcement error:", err);
      return {
        success: false,
        message: "Failed to create announcement",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getAllAnnouncements = async (): Promise<{
    success: boolean;
    message?: string;
    data?: AnnouncementData[];
  }> => {
    try {
      const result = await adminService.getAllAnnouncements();
      return result;
    } catch (err) {
      console.error("Get all announcements error:", err);
      return {
        success: false,
        message: "Failed to fetch announcements",
      };
    }
  };

  const updateAnnouncement = async (
    announcement_id: number,
    announcementData: Partial<AnnouncementCreateData>,
  ): Promise<{
    success: boolean;
    message?: string;
    data?: AnnouncementData;
  }> => {
    try {
      setIsLoading(true);
      const result = await adminService.updateAnnouncement(
        announcement_id,
        announcementData.title,
        announcementData.content,
        announcementData.target_audience,
        announcementData.publish_option,
      );
      return result;
    } catch (err) {
      console.error("Update announcement error:", err);
      return {
        success: false,
        message: "Failed to update announcement",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAnnouncement = async (
    announcement_id: number,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const result = await adminService.deleteAnnouncement(announcement_id);
      return result;
    } catch (err) {
      console.error("Delete announcement error:", err);
      return {
        success: false,
        message: "Failed to delete announcement",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh admin data
  const refreshAdmin = async (): Promise<void> => {
    await checkAuth();
  };

  // Update admin
  const updateAdmin = async (
    adminId: string,
    payload: any,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await adminApi.put(`/admin/${adminId}`, payload);
      if (response.data?.success) {
        // Refresh admin data after update
        await checkAuth();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Update admin error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete admin
  const deleteAdmin = async (adminId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await adminApi.delete(`/admin/${adminId}`);
      return response.data?.success || false;
    } catch (err) {
      console.error("Delete admin error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial check on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue: AdminContextType = {
    admin,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    createAdmin,
    getAdminStats,
    createAnnouncement,
    getAllAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
    refreshAnnouncements: getAllAnnouncements, // Using getAllAnnouncements as refresh
    refreshAdmin,
    updateAdmin,
    deleteAdmin,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};
