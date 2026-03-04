import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { adminApi, setAuthNavigate, setAuthRefreshCallback } from "../../lib/api.admin";
import { AdminContext, AdminContextType } from "./adminContext";
import { Admin, AdminStats, AnnouncementData, AnnouncementCreateData } from "../../types/admin";
import { adminService } from "../../services/adminService";

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);

  // Register navigation function with API interceptor
  useEffect(() => {
    setAuthNavigate((to: string) => {
      navigate(to, { replace: true });
    });

    // Register auth refresh callback
    setAuthRefreshCallback(() => {
      checkAuth(); // Re-check authentication when tokens are refreshed
    });
  }, [navigate]);

  // Auth state update function
  const updateAuthState = useCallback((authenticated: boolean, adminData: Admin | null) => {
    // Clear any pending timeout
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
    }

    // Debounce the state update to prevent rapid changes
    authTimeoutRef.current = setTimeout(() => {
      setIsAuthenticated(authenticated);
      setAdmin(adminData);
      setIsLoading(false);
    }, 100); // Small delay to prevent rapid state changes
  }, []);

  // Cache for announcements to prevent redundant re-renders when data hasn't changed
  const announcementsCache = useRef<{
    data: AnnouncementData[] | null;
    lastFetch: number | null;
  }>({ data: null, lastFetch: null });

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    if (isCheckingRef.current) return isAuthenticated;
    isCheckingRef.current = true;
    setIsLoading(true);

    try {
      console.log("Checking admin auth...");
      console.log("Current cookies:", document.cookie);
      const response = await adminApi.get("/admin/profile");

      console.log("Admin profile response:", response.data);
      if (response.data?.success && response.data?.admin) {
        console.log("Admin auth successful:", response.data.admin);
        updateAuthState(true, response.data.admin);
        return true;
      }

      throw new Error("No admin profile");
    } catch (error: any) {
      console.log("Admin auth failed:", error.response?.status, error.response?.data);
      const status = error?.response?.status;

      // Try refresh if unauthorized
      if (status === 401) {
        try {
          console.log("Trying to refresh admin token...");
          console.log("Cookies during refresh:", document.cookie);
          const refreshRes = await adminApi.get("/admin/refresh");

          console.log("Admin refresh response:", refreshRes.data);
          if (refreshRes.data?.success) {
            console.log("Admin refresh successful, retrying profile...");
            const retryProfile = await adminApi.get("/admin/profile");
            if (retryProfile.data?.success && retryProfile.data?.admin) {
              updateAuthState(true, retryProfile.data.admin);
              return true;
            }
          }
        } catch (refreshError) {
          console.log("Admin refresh failed:", (refreshError as any).response?.status, (refreshError as any).response?.data);
        }
      }

      console.log("Setting admin auth to false");
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
      const response = await adminApi.post("/admin/login", { email, password });

      if (response.data?.success) {
        console.log("Admin login successful, cookies after login:", document.cookie);
        // Use updateAuthState for consistent state management
        updateAuthState(true, {
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
  const logout = async (admin_id?: number): Promise<void> => {
    try {
      await adminApi.post("/auth/logout", { admin_id }); // API should clear refresh token cookie
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      updateAuthState(false, null);
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
