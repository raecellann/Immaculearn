// services/userAnnounceservice.ts
import { api } from "../lib/api";
import {
  Announcement,
  ApiResponse,
} from "../types/announcement";

class AnnouncementService {
  private cache = new Map<string, { data: ApiResponse<Announcement[]>; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private pendingRequests = new Map<string, Promise<ApiResponse<Announcement[]>>>();

  // Check if cache is valid
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  // Get cached data or null
  private getCachedData(key: string): ApiResponse<Announcement[]> | null {
    const cached = this.cache.get(key);
    if (!cached || !this.isCacheValid(key)) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  // Set cache data
  private setCachedData(key: string, data: ApiResponse<Announcement[]>): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Get announcements for students
  async getStudentAnnouncements(): Promise<ApiResponse<Announcement[]>> {
    const cacheKey = 'students';
    
    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // Check if there's already a pending request for this endpoint
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Create the request promise
    const requestPromise = (async () => {
      try {
        const response = await api.get<ApiResponse<Announcement[]>>("/announce/students");
        
        // Cache the response
        this.setCachedData(cacheKey, response.data);
        
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
        
        return response.data;
      } catch (error: any) {
        // Remove from pending requests on error
        this.pendingRequests.delete(cacheKey);
        
        return {
          success: false,
          message: error.response?.data?.message || "Failed to fetch student announcements",
        };
      }
    })();

    // Store the pending request
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }

  // Get announcements for professors
  async getProfessorAnnouncements(): Promise<ApiResponse<Announcement[]>> {
    const cacheKey = 'professors';
    
    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // Check if there's already a pending request for this endpoint
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Create the request promise
    const requestPromise = (async () => {
      try {
        const response = await api.get<ApiResponse<Announcement[]>>("/announce/professors");
        
        // Cache the response
        this.setCachedData(cacheKey, response.data);
        
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
        
        return response.data;
      } catch (error: any) {
        // Remove from pending requests on error
        this.pendingRequests.delete(cacheKey);
        
        return {
          success: false,
          message: error.response?.data?.message || "Failed to fetch professor announcements",
        };
      }
    })();

    // Store the pending request
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }

  // Get all announcements (both students and professors)
  async getAllAnnouncements(): Promise<ApiResponse<Announcement[]>> {
    try {
      // Fetch both announcements simultaneously (for admin use)
      const [studentResponse, professorResponse] = await Promise.all([
        this.getStudentAnnouncements(),
        this.getProfessorAnnouncements()
      ]);

      // Combine both announcement arrays
      const allAnnouncements = [
        ...(studentResponse.data || []),
        ...(professorResponse.data || [])
      ];

      // Sort by created_at date (newest first)
      allAnnouncements.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return {
        success: studentResponse.success || professorResponse.success,
        data: allAnnouncements,
        message: "All announcements retrieved successfully",
        total: allAnnouncements.length
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch announcements",
      };
    }
  }

  // Get announcements filtered by target audience (optimized - single API call)
  async getAnnouncementsByAudience(audience: string): Promise<ApiResponse<Announcement[]>> {
    const cacheKey = audience.toLowerCase();
    
    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // Check if there's already a pending request for this endpoint
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Create the request promise
    const requestPromise = (async () => {
      try {
        const url = `/announce/${cacheKey}`;
        const response = await api.get<ApiResponse<Announcement[]>>(url);
        
        // Cache the response
        this.setCachedData(cacheKey, response.data);
        
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
        
        return response.data;
      } catch (error: any) {
        // Remove from pending requests on error
        this.pendingRequests.delete(cacheKey);
        
        return {
          success: false,
          message: error.response?.data?.message || `Failed to fetch ${audience} announcements`,
        };
      }
    })();

    // Store the pending request
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }
}

export const announcementService = new AnnouncementService();
