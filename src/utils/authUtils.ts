import { api } from '../lib/api';

/**
 * Authentication utility functions for handling token refresh and authentication errors
 */

// Maximum number of refresh attempts
export const MAX_REFRESH_ATTEMPTS = 3;

// Track refresh attempts globally
let globalRefreshAttempts = 0;
let isGloballyRefreshing = false;

/**
 * Reset global refresh attempts counter
 */
export const resetGlobalRefreshAttempts = (): void => {
  globalRefreshAttempts = 0;
  isGloballyRefreshing = false;
  console.log('🔄 Global refresh attempts reset');
};

/**
 * Attempt to refresh authentication token
 * @returns Promise<boolean> - True if refresh successful
 */
export const attemptTokenRefresh = async (): Promise<boolean> => {
  if (isGloballyRefreshing || globalRefreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    console.log(`🚫 Refresh blocked: ${isGloballyRefreshing ? 'already refreshing' : 'max attempts reached'}`);
    return false;
  }

  isGloballyRefreshing = true;
  globalRefreshAttempts++;

  try {
    console.log(`🔄 Attempting global token refresh (attempt ${globalRefreshAttempts}/${MAX_REFRESH_ATTEMPTS})`);
    
    const refreshResponse = await api.post('/auth/refresh');
    
    if (refreshResponse.data?.success) {
      // Reset attempts on successful refresh
      globalRefreshAttempts = 0;
      console.log('✅ Global token refresh successful');
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error(`❌ Global refresh attempt ${globalRefreshAttempts} failed:`, error?.response?.status);
    
    // If this was the last attempt, log out
    if (globalRefreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      console.error('🚫 Maximum global refresh attempts reached');
    }
    
    return false;
  } finally {
    isGloballyRefreshing = false;
  }
};

/**
 * Check if user is authenticated with automatic refresh
 * @returns Promise<boolean> - True if authenticated
 */
export const checkAuthWithRefresh = async (): Promise<boolean> => {
  try {
    const profileResponse = await api.get('/auth/profile');
    
    if (profileResponse.data?.data) {
      // Reset attempts on successful auth
      globalRefreshAttempts = 0;
      return true;
    }
    
    return false;
  } catch (error: any) {
    const status = error?.response?.status;
    
    // Try refresh if unauthorized
    if (status === 401) {
      const refreshSuccess = await attemptTokenRefresh();
      
      if (refreshSuccess) {
        // Retry profile check after successful refresh
        try {
          const retryProfile = await api.get('/auth/profile');
          return retryProfile.data?.data ? true : false;
        } catch {
          return false;
        }
      }
    }
    
    return false;
  }
};

/**
 * Wrapper for API calls with automatic authentication refresh
 * @param apiCall - Function that returns a Promise
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @returns Promise with API result
 */
export const withAuthRefresh = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = MAX_REFRESH_ATTEMPTS
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    const status = error?.response?.status;
    
    // Only handle authentication errors
    if (status !== 401) {
      throw error;
    }
    
    // Attempt refresh
    const refreshSuccess = await attemptTokenRefresh();
    
    if (refreshSuccess) {
      // Retry original API call
      console.log('🔄 Retrying API call after successful refresh');
      return await apiCall();
    }
    
    // If refresh failed, throw original error
    throw error;
  }
};

/**
 * Get current refresh attempt count
 */
export const getRefreshAttemptCount = (): number => globalRefreshAttempts;

/**
 * Check if currently refreshing
 */
export const isRefreshing = (): boolean => isGloballyRefreshing;
