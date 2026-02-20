import { useCallback } from 'react';
import { useUser } from '../contexts/user/useUser';

/**
 * Custom hook to handle authentication errors and automatic refresh
 * Provides utilities to check auth status and handle refresh attempts
 */
export const useAuthRefresh = () => {
  const { checkAuth, isAuthenticated, resetRefreshAttempts } = useUser();

  /**
   * Handle authentication error with automatic refresh
   * @param error - The error object from API call
   * @param maxRetries - Maximum number of refresh attempts (default: 3)
   * @returns Promise<boolean> - True if authentication succeeded, false otherwise
   */
  const handleAuthError = useCallback(async (
    error: any, 
    maxRetries: number = 3
  ): Promise<boolean> => {
    const status = error?.response?.status;
    
    // Only handle 401 unauthorized errors
    if (status !== 401) {
      return false;
    }

    console.log(`🔐 Handling authentication error (status: ${status})`);
    
    // Attempt to refresh authentication
    let attempts = 0;
    
    while (attempts < maxRetries) {
      attempts++;
      console.log(`🔄 Authentication refresh attempt ${attempts}/${maxRetries}`);
      
      try {
        const authSuccess = await checkAuth();
        
        if (authSuccess) {
          console.log(`✅ Authentication successful on attempt ${attempts}`);
          return true;
        }
        
        // Wait before next attempt (exponential backoff)
        if (attempts < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempts - 1), 5000); // Max 5 seconds
          console.log(`⏳ Waiting ${delay}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (refreshError) {
        console.error(`❌ Refresh attempt ${attempts} failed:`, refreshError);
      }
    }
    
    console.error(`🚫 Authentication failed after ${maxRetries} attempts`);
    return false;
  }, [checkAuth]);

  /**
   * Force authentication check with reset attempts
   * Useful when user manually wants to retry authentication
   */
  const forceRefresh = useCallback(async (): Promise<boolean> => {
    console.log('🔄 Forcing authentication refresh...');
    resetRefreshAttempts();
    return await checkAuth();
  }, [checkAuth, resetRefreshAttempts]);

  /**
   * Check if user is currently authenticated
   */
  const isUserAuthenticated = useCallback((): boolean => {
    return isAuthenticated;
  }, [isAuthenticated]);

  /**
   * Wrapper for API calls with automatic auth handling
   * @param apiCall - Function that returns a Promise
   * @param maxRetries - Maximum refresh attempts
   * @returns Promise with API result or error
   */
  const withAuthRefresh = useCallback(async <T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> => {
    try {
      return await apiCall();
    } catch (error: any) {
      // If it's an auth error, try to refresh
      if (error?.response?.status === 401) {
        const authSuccess = await handleAuthError(error, maxRetries);
        
        if (authSuccess) {
          // Retry the original API call after successful refresh
          console.log('🔄 Retrying original API call after successful refresh');
          return await apiCall();
        }
      }
      
      // Re-throw the error if it's not auth-related or refresh failed
      throw error;
    }
  }, [handleAuthError]);

  return {
    handleAuthError,
    forceRefresh,
    isUserAuthenticated,
    withAuthRefresh,
  };
};
