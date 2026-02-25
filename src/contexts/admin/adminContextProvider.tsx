import React, { useState, useEffect, ReactNode } from "react";
import { adminApi } from "../../lib/api.admin";
import { AdminContext, AdminContextType } from "./adminContext";
import { Admin, AdminStats } from "../../types/admin";

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
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
    } catch (error) {
      console.error("Check auth error:", error);
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
        // Fetch admin profile after login
        await checkAuth();
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
      await adminApi.post("/admin/logout");
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
  const getAdminStats = async (): Promise<{ success: boolean; data?: AdminStats; message?: string }> => {
    try {
      const response = await adminApi.get("/admin/stats");
      return response.data;
    } catch (error) {
      console.error("Get admin stats error:", error);
      return {
        success: false,
        message: "Failed to fetch admin statistics"
      };
    }
  };

  // Get all admins
  const getAllAdmins = async (): Promise<{ success: boolean; data?: Admin[]; message?: string }> => {
    try {
      const response = await adminApi.get("/admin/all");
      return response.data;
    } catch (error) {
      console.error("Get all admins error:", error);
      return {
        success: false,
        message: "Failed to fetch admins"
      };
    }
  };

  // Update admin
  const updateAdmin = async (adminId: string, payload: any): Promise<boolean> => {
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
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};
