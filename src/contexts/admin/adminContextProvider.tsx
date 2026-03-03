import React, { useState, useEffect, useRef } from "react";
import { adminApi } from "../../lib/api.admin";
import { AdminContext, AdminContextType } from "./adminContext";
import { Admin, AdminStats, AnnouncementData, AnnouncementCreateData } from "../../types/admin";
import { adminService } from "../../services/adminService";

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Cache for announcements to prevent redundant re-renders when data hasn't changed
  const announcementsCache = useRef<{
    data: AnnouncementData[] | null;
    lastFetch: number | null;
  }>({ data: null, lastFetch: null });

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
    } catch {
      setAdmin(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await adminApi.post("/admin/login", { email, password });

      if (response.data?.success) {
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
      await checkAuth();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  // Refresh admin data
  const refreshAdmin = async (): Promise<void> => {
    await checkAuth();
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
    data?: AdminStats;
    message?: string;
  }> => {
    try {
      const response = await adminApi.get("/admin/stats");
      return response.data;
    } catch (error) {
      console.error("Get admin stats error:", error);
      return {
        success: false,
        message: "Failed to fetch admin statistics",
      };
    }
  };

  // Get all admins
  const getAllAdmins = async (): Promise<{
    success: boolean;
    data?: Admin[];
    message?: string;
  }> => {
    try {
      const response = await adminApi.get("/admin/all");
      return response.data;
    } catch (error) {
      console.error("Get all admins error:", error);
      return {
        success: false,
        message: "Failed to fetch admins",
      };
    }
  };

  // Update admin
  const updateAdmin = async (
    adminId: string,
    payload: any,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await adminApi.put(`/admin/${adminId}`, payload);
      return response.data?.success || false;
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

  // Announcement functions
  const createAnnouncement = async (
  announcementData: AnnouncementCreateData
): Promise<{ success: boolean; message?: string; data?: AnnouncementData }> => {
  try {
    setIsLoading(true);

    const result = await adminService.create_announcement(
      announcementData.title,
      announcementData.content,
      announcementData.target_audience,
      announcementData.scheduled_at
    );

    if (result.success) {
      // Clear cache to ensure fresh data on next fetch
      announcementsCache.current = { data: null, lastFetch: null };

      // Fetch fresh announcements immediately
      await getAllAnnouncements();
    }

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
      // Check if we have cached data and return it immediately to prevent API call
      if (announcementsCache.current.data) {
        console.log('Returning cached announcements data to prevent API call');
        return {
          success: true,
          data: announcementsCache.current.data
        };
      }

      // No cached data, fetch from API
      console.log('Fetching fresh announcements data from API');
      const result = await adminService.getAllAnnouncements();
      
      // Update cache if request was successful
      if (result.success && result.data) {
        announcementsCache.current = {
          data: result.data,
          lastFetch: Date.now()
        };
      }
      
      return result;
    } catch (err) {
      console.error("Get all announcements error:", err);
      return {
        success: false,
        message: "Failed to fetch announcements"
      };
    }
  };

  const updateAnnouncement = async (announcement_id: number, announcementData: Partial<AnnouncementCreateData>): Promise<{ success: boolean; message?: string; data?: AnnouncementData }> => {
    try {
      setIsLoading(true);
      const result = await adminService.updateAnnouncement(
        announcement_id,
        announcementData.title,
        announcementData.content,
        announcementData.target_audience,
        announcementData.publish_option
      );
      
      // Clear cache to ensure fresh data on next fetch
      announcementsCache.current = { data: null, lastFetch: null };
      
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

  const deleteAnnouncement = async (announcement_id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const result = await adminService.deleteAnnouncement(announcement_id);
      
      // Clear cache to ensure fresh data on next fetch
      announcementsCache.current = { data: null, lastFetch: null };
      
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

  // Manual cache refresh function
  const refreshAnnouncements = async (): Promise<{ success: boolean; message?: string; data?: AnnouncementData[] }> => {
    // Force clear cache to fetch fresh data
    announcementsCache.current = { data: null, lastFetch: null };
    
    // Fetch fresh data
    return await getAllAnnouncements();
  };

  // Initial check on mount - only if we have a token
  useEffect(() => {
    const token =
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminToken");
    if (token) {
      checkAuth();
    }
  }, []);

  const contextValue: AdminContextType = {
    admin,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshAdmin,
    checkAuth,
    createAdmin,
    getAdminStats,
    updateAdmin,
    deleteAdmin,
    createAnnouncement,
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
