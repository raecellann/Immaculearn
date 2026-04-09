import { adminApi } from "../lib/api.admin";
import { AcademicData, AnnouncementData, ApiResponse } from "../types/admin";

class AdminService {
  async createAcademic(
    academic_period: string,
    academic_semester: number,
    academic_year: string,
  ): Promise<ApiResponse> {
    try {
      const response = await adminApi.post<ApiResponse>("/admin/academic", {
        academic_period,
        academic_semester,
        academic_year,
      });

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to create academic term",
      };
    }
  }
  async updateAcademic(
    academic_id: number,
    academic_period?: string,
    academic_semester?: number,
    academic_year?: string,
    academic_status?: string,
  ): Promise<ApiResponse> {
    try {
      const payload: Record<string, any> = { academic_id };

      if (academic_period !== undefined)
        payload.academic_period = academic_period;

      if (academic_semester !== undefined)
        payload.academic_semester = academic_semester;

      if (academic_year !== undefined) payload.academic_year = academic_year;

      if (academic_status !== undefined)
        payload.academic_status = academic_status;

      const response = await adminApi.patch<ApiResponse>(
        "/admin/academic/update",
        payload,
      );

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update academic term",
      };
    }
  }

  async getAllAcademicTerms(): Promise<ApiResponse<AcademicData[]>> {
    try {
      const response = await adminApi.get<ApiResponse<AcademicData[]>>(
        "/admin/academic/all",
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch academic terms",
      };
    }
  }

  async create_announcement(
    title: string,
    content: string,
    target_audience: string,
    publish_option: string = "NOW",
    images?: File[],
  ): Promise<ApiResponse<AnnouncementData>> {
    try {
      const formData = new FormData();

      // Append basic announcement data
      formData.append("title", title);
      formData.append("content", content);
      formData.append("target_audience", target_audience);
      formData.append("publish_option", publish_option);

      // Append images if provided
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append("images", image);
        });
      }


      const response = await adminApi.post<ApiResponse<AnnouncementData>>(
        "/announce/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to create announcement",
      };
    }
  }

  async getAllAnnouncements(): Promise<ApiResponse<AnnouncementData[]>> {
    try {
      const response =
        await adminApi.get<ApiResponse<AnnouncementData[]>>("/announce/");
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch announcements",
      };
    }
  }

  async updateAnnouncement(
    announcement_id: number,
    title?: string,
    content?: string,
    target_audience?: string,
    publish_option?: string,
  ): Promise<ApiResponse<AnnouncementData>> {
    try {
      const payload: Record<string, any> = { announcement_id };

      if (title !== undefined) payload.title = title;
      if (content !== undefined) payload.content = content;
      if (target_audience !== undefined)
        payload.target_audience = target_audience;
      if (publish_option !== undefined) payload.publish_option = publish_option;

      const response = await adminApi.patch<ApiResponse<AnnouncementData>>(
        "/announce/update",
        payload,
      );

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update announcement",
      };
    }
  }

  async deleteAnnouncement(announcement_id: number): Promise<ApiResponse> {
    try {
      const response = await adminApi.delete<ApiResponse>(
        `/announce/delete/${announcement_id}`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to delete announcement",
      };
    }
  }
}

export const adminService = new AdminService();
