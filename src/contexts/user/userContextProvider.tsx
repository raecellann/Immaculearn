import React, { useState, useEffect, ReactNode, useRef } from "react";
import { api } from "../../lib/api"; // Axios instance with withCredentials

import { UserContext, User } from "./userContext";

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isCheckingRef = useRef(false);

  // Core authentication check
  const checkAuth = async (): Promise<boolean> => {
    if (isCheckingRef.current) return isAuthenticated;
    isCheckingRef.current = true;
    setIsLoading(true);

    try {
      // Try profile
      const profileRes = await api.get("/auth/profile");
      // console.log(profileRes.data?.data)
      if (profileRes.data?.data) {
        setUser(profileRes.data.data);
        setIsAuthenticated(true);
        return true;
      }

      throw new Error("No profile");
    } catch (error: any) {
      const status = error?.response?.success;

      // Try refresh if unauthorized
      if (!status) {
        try {
          const refreshRes = await api.post("/auth/refresh");

          if (refreshRes.data?.success) {
            const retryProfile = await api.get("/auth/profile");
            if (retryProfile.data?.data) {
              setUser(retryProfile.data.data);
              setIsAuthenticated(true);
              return true;
            }
          }
        } catch {}
      }

      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
      isCheckingRef.current = false;
    }
  };


  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.post("/auth/login", { email, password });

      if (response.data.success) {
        // Fetch user profile after login
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
  const logout = async (account_id: number): Promise<void> => {
    try {
      await api.post("/auth/logout", {user_id: account_id}); // API should clear refresh token cookie
      await checkAuth();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Force refresh user state
  const refreshUser = async (): Promise<void> => {
    await checkAuth();
  };

  // Initial check on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
        checkAuth,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
