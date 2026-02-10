import { api } from "../lib/api";
import { ApiResponse } from "../types/space";
import { RegisterEmailPayload, RegisterEmailResponse } from "../types/register";

class AdminDashboardService {

  // register_student/email
  async registerStudentEmail(
    payload: RegisterEmailPayload
  ): Promise<ApiResponse<RegisterEmailResponse>> {
    try {
      const response = await api.post<RegisterEmailResponse>(
        "register_student/email",
        payload
      );

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
    try {
        const response = await api.get<{ emails: string[] }>(
        "/register_student/all_emails_student"
        );

        return {
        success: true,
        data: response.data,
        };
    } catch (error: any) {
        return {
        success: false,
        message:
            error.response?.data?.message ||
            "Failed to fetch student emails",
        };
    }
    }


    // Get prof email list
    async getAllProfEmails(): Promise<ApiResponse<{ emails: string[] }>> {
    try {
        const response = await api.get<{ emails: string[] }>(
        "/register_prof/all_emails_prof"
        );

        return {
        success: true,
        data: response.data,
        };
    } catch (error: any) {
        return {
        success: false,
        message:
            error.response?.data?.message ||
            "Failed to fetch student emails",
        };
    }
    }


}

export const adminDashboardService = new AdminDashboardService();
