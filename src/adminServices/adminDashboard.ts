import { api } from "../lib/api";
import { ApiResponse } from "../types/space";
import { RegisterEmailPayload, RegisterEmailResponse } from "../types/register";

class AdminDashboardService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached || !this.isCacheValid(key)) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // register_student/email
  async registerStudentEmail(
    payload: RegisterEmailPayload
  ): Promise<ApiResponse<RegisterEmailResponse>> {
    try {
      const response = await api.post<RegisterEmailResponse>(
        "register_student/email",
        payload
      );

      // Clear student cache after adding new student
      this.clearCache('student');

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to register student",
      };
    }
  }

  // register_prof/email
  async registerProfEmail(
    payload: RegisterEmailPayload
  ): Promise<ApiResponse<RegisterEmailResponse>> {
    try {
      const response = await api.post<RegisterEmailResponse>(
        "/register_prof/email",
        payload
      );

      // Clear professor cache after adding new professor
      this.clearCache('prof');

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to register professor",
      };
    }
  }
 
  // register_prof/bulk_email
  async bulkRegisterProfFile(
    file: File
    ): Promise<ApiResponse<{ message: string; total: number }>> {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post(
        "/register_prof/bulk_email",
        formData,
        {
            headers: {
            "Content-Type": "multipart/form-data",
            },
        }
        );

        // Clear professor cache after bulk import
        this.clearCache('prof');

        return {
        success: true,
        data: response.data,
        };
    } catch (error: any) {
        return {
        success: false,
        message:
            error.response?.data?.message ||
            "Failed to bulk register students",
        };
    }
    }

 


  // register_student/bulk_email (FILE UPLOAD)
    async bulkRegisterStudentFile(
    file: File
    ): Promise<ApiResponse<{ message: string; total: number }>> {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post(
        "/register_student/bulk_email",
        formData,
        {
            headers: {
            "Content-Type": "multipart/form-data",
            },
        }
        );

        // Clear student cache after bulk import
        this.clearCache('student');

        return {
        success: true,
        data: response.data,
        };
    } catch (error: any) {
        return {
        success: false,
        message:
            error.response?.data?.message ||
            "Failed to bulk register students",
        };
    }
    }



    
    // Get student email list
    async getAllStudentEmails(): Promise<ApiResponse<{ emails: string[] }>> {
    const cacheKey = 'all_emails_student';
    
    // Check cache first
    const cachedData = this.getCache(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await api.get<{ emails: string[] }>(
        "/register_student/all_emails_student"
        );

        const result = {
        success: true,
        data: response.data,
        };

        // Cache the result
        this.setCache(cacheKey, result);

        return result;
    } catch (error: any) {
        const result = {
        success: false,
        message:
            error.response?.data?.message ||
            "Failed to fetch student emails",
        };
        return result;
    }
    }


    // Get prof email list
    async getAllProfEmails(): Promise<ApiResponse<{ emails: string[] }>> {
    const cacheKey = 'all_emails_prof';
    
    // Check cache first
    const cachedData = this.getCache(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await api.get<{ emails: string[] }>(
        "/register_prof/all_emails_prof"
        );

        const result = {
        success: true,
        data: response.data,
        };

        // Cache the result
        this.setCache(cacheKey, result);

        return result;
    } catch (error: any) {
        const result = {
        success: false,
        message:
            error.response?.data?.message ||
            "Failed to fetch student emails",
        };
        return result;
    }
    }


}

export const adminDashboardService = new AdminDashboardService();
