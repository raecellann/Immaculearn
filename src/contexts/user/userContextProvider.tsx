import React, { useState, useEffect, ReactNode, useRef } from "react";
import { api } from "../../lib/api"; // Axios instance with withCredentials

import { UserContext, User } from "./userContext";
import { PostCreateData, CommentCreateData } from "../../types/post";

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isCheckingRef = useRef(false);
  const refreshAttemptsRef = useRef(0);
  const maxRefreshAttempts = 3;
  const isRefreshingRef = useRef(false);

  // Automatic refresh with retry logic
  const attemptRefresh = async (): Promise<boolean> => {
    if (isRefreshingRef.current || refreshAttemptsRef.current >= maxRefreshAttempts) {
      return false;
    }

    isRefreshingRef.current = true;
    refreshAttemptsRef.current++;

    try {
      console.log(`🔄 Attempting token refresh (attempt ${refreshAttemptsRef.current}/${maxRefreshAttempts})`);
      
      const refreshRes = await api.post("/auth/refresh");
      
      if (refreshRes.data?.success) {
        // Reset attempts on successful refresh
        refreshAttemptsRef.current = 0;
        
        // Retry profile check after successful refresh
        const retryProfile = await api.get("/auth/profile");
        if (retryProfile.data?.data) {
          setUser(retryProfile.data.data);
          setIsAuthenticated(true);
          console.log("✅ Token refresh successful");
          return true;
        }
      }
      
      return false;
    } catch (error: any) {
      console.error(`❌ Token refresh attempt ${refreshAttemptsRef.current} failed:`, error?.response?.status);
      
      // If this was the last attempt, log out user
      if (refreshAttemptsRef.current >= maxRefreshAttempts) {
        console.error("🚫 Maximum refresh attempts reached. Logging out user.");
        setUser(null);
        setIsAuthenticated(false);
      }
      
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  };

  // Core authentication check with automatic refresh
  const checkAuth = async (): Promise<boolean> => {
    if (isCheckingRef.current) return isAuthenticated;
    isCheckingRef.current = true;
    setIsLoading(true);

    try {
      // Try profile
      const profileRes = await api.get("/auth/profile");
      
      if (profileRes.data?.data) {
        setUser(profileRes.data.data);
        setIsAuthenticated(true);
        // Reset refresh attempts on successful auth
        refreshAttemptsRef.current = 0;
        return true;
      }

      throw new Error("No profile");
    } catch (error: any) {
      const status = error?.response?.status;
      
      // Try automatic refresh if unauthorized (401)
      if (status === 401) {
        const refreshSuccess = await attemptRefresh();
        if (refreshSuccess) {
          return true;
        }
      }

      // If refresh failed or wasn't attempted, set unauthenticated
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
      isCheckingRef.current = false;
    }
  };

  // const create = async ()
  // Add this inside UserProvider component

  const createAccount = async (payload: any): Promise<boolean> => {
    const tempToken = sessionStorage.getItem("tempToken");

    console.log(tempToken)
    if (!tempToken) return false;
    try {
      setIsLoading(true);

      const response = await api.post("/account/register", payload, {
        headers: {
          Authorization: `Bearer ${tempToken}`,
        },
      });

      if (response.data?.success) {
        // After successful registration, fetch user profile
        await checkAuth();
        return true;
      }

      return false;
    } catch (err) {
      console.error("Create account error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };



  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.post("/account/login", { email, password }, {withCredentials: true});

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

  // Force refresh user state with retry logic
  const refreshUser = async (): Promise<void> => {
    // Reset refresh attempts to allow manual refresh
    refreshAttemptsRef.current = 0;
    await checkAuth();
  };

  // Reset refresh attempts (useful for testing or manual intervention)
  const resetRefreshAttempts = (): void => {
    refreshAttemptsRef.current = 0;
    console.log("🔄 Refresh attempts reset");
  };

  // Post functions
  const createPost = async (postData: PostCreateData) => {
    try {
      const response = await api.post('/post/', postData);
      return response.data;
    } catch (error: any) {
      console.error('Create post error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create post'
      };
    }
  };

  const createComment = async (commentData: CommentCreateData) => {
    try {
      const response = await api.post('/post/comment', commentData);
      return response.data;
    } catch (error: any) {
      console.error('Create comment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create comment'
      };
    }
  };

  const getPosts = async (spaceId: string) => {
    try {
      const response = await api.get(`/post/${spaceId}`);

      console.log(response.data)
      return response.data;
    } catch (error: any) {
      console.error('Get post error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch post'
      };
    }
  };

  const getComments = async (postId: string) => {
    try {
      const response = await api.get(`/post/comment/${postId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get comments error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch comments'
      };
    }
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
        createAccount,
        logout,
        refreshUser,
        checkAuth,
        resetRefreshAttempts,
        createPost,
        createComment,
        getPosts,
        getComments,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
