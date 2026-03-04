// services/userAnnounceservice.ts
import { api } from "../lib/api";
import {
  Announcement,
  ApiResponse,
} from "../types/announcement";

class AnnouncementService {
  private cache = new Map<string, { data: ApiResponse<Announcement[]>; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
    try {
      // Check cache first
      const cached = this.getCachedData('students');
      if (cached) return cached;

      const response = await api.get<ApiResponse<Announcement[]>>("/announce/students");
      
      // Cache the response
      this.setCachedData('students', response.data);
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch student announcements",
      };
    }
  }

  // Get announcements for professors
  async getProfessorAnnouncements(): Promise<ApiResponse<Announcement[]>> {
    try {
      // Check cache first
      const cached = this.getCachedData('professors');
      if (cached) return cached;

      const response = await api.get<ApiResponse<Announcement[]>>("/announce/professors");
      
      // Cache the response
      this.setCachedData('professors', response.data);
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch professor announcements",
      };
    }
  }

  // Get all announcements (both students and professors)
  async getAllAnnouncements(): Promise<ApiResponse<Announcement[]>> {
    try {
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
    try {
      let response: ApiResponse<Announcement[]>;

      // For students, only fetch student announcements (more efficient)
      if (audience === "STUDENTS") {
        response = await this.getStudentAnnouncements();
      } 
      // For professors, only fetch professor announcements (more efficient)
      else if (audience === "PROFESSORS") {
        response = await this.getProfessorAnnouncements();
      } 
      // For any other audience, fetch all and filter
      else {
        response = await this.getAllAnnouncements();
      }

      if (!response.success || !response.data) {
        return response;
      }

      // Filter announcements by target audience (only needed for "ALL" case)
      let filteredAnnouncements = response.data;
      if (audience !== "STUDENTS" && audience !== "PROFESSORS") {
        filteredAnnouncements = response.data.filter(announcement => 
          announcement.target_audience === audience || 
          announcement.target_audience === "ALL"
        );
      }

      return {
        success: true,
        data: filteredAnnouncements,
        message: `${audience} announcements retrieved successfully`,
        total: filteredAnnouncements.length
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch announcements by audience",
      };
    }
  }
}

export const announcementService = new AnnouncementService();
