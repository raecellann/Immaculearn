import { adminApi } from "../lib/api.admin";
import { AcademicData, ApiResponse } from "../types/admin";

class AdminService {

  async createAcademic(
    academic_period: string,
    academic_semester: number,
    academic_year: string): Promise<ApiResponse> {
    try {
      
      const response = await adminApi.post<ApiResponse>(
        "/admin/academic", {
            academic_period, academic_semester, academic_year
        }
      );

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to create academic term",
      };
    }
  }
  async updateAcademic(
    academic_id: number,
    academic_period?: string,
    academic_semester?: number,
    academic_year?: string,
    academic_status?: string
  ): Promise<ApiResponse> {
    try {
      const payload: Record<string, any> = { academic_id };

      if (academic_period !== undefined)
        payload.academic_period = academic_period;

      if (academic_semester !== undefined)
        payload.academic_semester = academic_semester;

      if (academic_year !== undefined)
        payload.academic_year = academic_year;

      if (academic_status !== undefined)
        payload.academic_status = academic_status;

      const response = await adminApi.patch<ApiResponse>(
        "/admin/academic/update",
        payload
      );

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to update academic term",
      };
    }
  }

  async getAllAcademicTerms(): Promise<ApiResponse<AcademicData[]>> {
    try {
      const response = await adminApi.get<ApiResponse<AcademicData[]>>(
        "/admin/academic/all"
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch academic terms",
      };
    }
  }
}

export const adminService = new AdminService();