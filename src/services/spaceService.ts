// services/spaceService.ts
import { api } from "../lib/api";
import {
  Space,
  SpaceCreateData,
  ApiResponse,
  SpacePendingInvitation,
  PendingSpaceInvitation,
  CourseSpaceCreateData,
  CourseSPace,
} from "../types/space";

class SpaceService {
  async createSpace(spaceData: SpaceCreateData): Promise<ApiResponse<Space>> {
    try {
      const response = await api.post<ApiResponse<Space>>("/spaces/", {
        space_name: spaceData.space_name,
        description: spaceData.description || "",
        settings: spaceData.settings || { space_cover: null, max_member: 10 },
      });

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create space",
      };
    }
  }
  async createCourseSpace(
    spaceData: CourseSpaceCreateData,
  ): Promise<ApiResponse<Space>> {
    try {
      const response = await api.post<ApiResponse<Space>>(
        "/spaces/course-space",
        {
          space_name: spaceData.space_name,
          space_day: spaceData.space_day,
          space_time_start: spaceData.space_time_start,
          space_time_end: spaceData.space_time_end,
          space_yr_lvl: spaceData.space_yr_lvl,
          space_settings: spaceData.space_settings || { space_cover: null, max_member: 50 },
        },
      );

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to create course space",
      };
    }
  }

  async getUserSpaces(): Promise<ApiResponse<Space[]>> {
    try {
      const response = await api.get<ApiResponse<Space[]>>("/spaces/all");
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      console.log(response);
      return {
        success: response.data.success,
        message: response.data.message,
        data,
      };
      // return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch spaces",
        data: [],
      };
    }
  }

  async getCourseSpaces(): Promise<ApiResponse<CourseSPace[]>> {
    try {
      const response = await api.get<ApiResponse<CourseSPace[]>>(
        "/spaces/course-spaces",
      );
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      console.log(response);
      return {
        success: response.data.success,
        message: response.data.message,
        data,
      };
      // return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch spaces",
        data: [],
      };
    }
  }

  async getSpace(uuid: string): Promise<ApiResponse<Space>> {
    try {
      const response = await api.get<ApiResponse<Space>>(`/spaces/${uuid}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Space not found",
      };
    }
  }

  async getAllFriendSpaces(): Promise<ApiResponse<Space[]>> {
    try {
      const response = await api.get<ApiResponse<Space[]>>("/spaces/shared");
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      console.log(response);
      return {
        success: response.data.success,
        message: response.data.message,
        data,
      };
      // return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch spaces",
        data: [],
      };
    }
  }

  async joinSpace(space_uuid: string): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>("/spaces/join-by-link", {
        space_uuid,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to join space",
      };
    }
  }

  async inviteUser(space_uuid: string, email: string): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>("/spaces/add-by-owner", {
        space_uuid: space_uuid,
        email: email,
      });

      console.log(response.data)
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to join space",
      };
    }
  }

  async getAllPendingRequest(
    space_uuid: string,
  ): Promise<ApiResponse<SpacePendingInvitation[]>> {
    try {
      const response = await api.get<ApiResponse<SpacePendingInvitation[]>>(
        `/spaces/${space_uuid}/invitations`,
      );
      // return response.data
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      return {
        success: response.data.success,
        message: response.data.message,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Space Pending Inivation Not Found",
      };
    }
  }

  async acceptInvitation(
    account_id: number,
    space_uuid: string,
  ): Promise<ApiResponse> {
    try {
      const response = await api.patch<ApiResponse>(
        `/spaces/join-by-link/accept`,
        { space_uuid: space_uuid, invited_account_id: account_id },
      );

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Space Pending Inivation Not Found",
      };
    }
  }

  async declineInvitation(
    account_id: number,
    space_uuid: string,
  ): Promise<ApiResponse> {
    try {
      const response = await api.patch<ApiResponse>(
        `/spaces/${space_uuid}/decline`,
        { user_id: account_id },
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Space Pending Inivation Not Found",
      };
    }
  }

  async getJoinRequests(
    space_uuid: string,
  ): Promise<ApiResponse<SpacePendingInvitation[]>> {
    try {
      const response = await api.get<ApiResponse<SpacePendingInvitation[]>>(
        `/spaces/${space_uuid}/join-by-link`,
      );
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      return {
        success: response.data.success,
        message: response.data.message,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch join requests",
        data: [],
      };
    }
  }

  async getAllJoinSpaceRequests(): Promise<
    ApiResponse<SpacePendingInvitation[]>
  > {
    try {
      const response = await api.get<ApiResponse<SpacePendingInvitation[]>>(
        `/spaces/pending-request/all`,
      );

      if (!response.data.success) {
      }
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      return {
        success: response.data.success,
        message: response.data.message,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch join requests",
        data: [],
      };
    }
  }

  async getAllSpaceInvitation(): Promise<
    ApiResponse<PendingSpaceInvitation[]>
  > {
    try {
      const response = await api.get<ApiResponse<PendingSpaceInvitation[]>>(
        `/spaces/pending-invitation/all`,
      );

      if (!response.data.success) {
      }
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      return {
        success: response.data.success,
        message: response.data.message,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch space invitation",
        data: [],
      };
    }
  }

  // Accept a join request
  async acceptJoinRequest(
    user_id: number,
    space_uuid: string,
  ): Promise<ApiResponse> {
    try {
      const response = await api.patch<ApiResponse>(
        `/spaces/join-by-link/accept`,
        { space_uuid: space_uuid, invited_account_id: user_id },
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to accept join request",
      };
    }
  }

  // Decline a join request
  async declineJoinRequest(
    user_id: number,
    space_uuid: string,
  ): Promise<ApiResponse> {
    try {
      const response = await api.patch<ApiResponse>(
        `/spaces/join-by-link/decline`, {
          space_uuid: space_uuid,
          invited_account_id: user_id
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to decline join request",
      };
    }
  }
  // Accept a join request
  async acceptSpaceInvitation(space_uuid: string): Promise<ApiResponse> {
    try {
      const response = await api.patch<ApiResponse>(
        `/spaces/join-direct/accept`,
        { space_uuid },
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to accept join request",
      };
    }
  }

  // Decline a join request
  async declineSpaceInvitation(space_uuid: string): Promise<ApiResponse> {
    try {
      const response = await api.patch<ApiResponse>(
        `/spaces/join-direct/decline`,
        { space_uuid },
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to decline join request",
      };
    }
  }

  async leaveSpace(space_uuid: string): Promise<ApiResponse> {
    try {
      const response = await api.delete<ApiResponse>(
        `/spaces/${space_uuid}/leave`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to leave space",
      };
    }
  }

  async deleteSpace(spaceUuid: string): Promise<ApiResponse> {
    try {
      console.log(`SPACE UUID ${spaceUuid}`);
      const response = await api.delete<ApiResponse>(`/spaces/${spaceUuid}`);

      console.log(response.data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to leave space",
      };
    }
  }

  async removeUserFromSpace(
    space_id: string,
    userId: number,
  ): Promise<ApiResponse> {
    try {
      console.log(`SPACE UUID ${space_id}`);
      const response = await api.delete<ApiResponse>(
        `/spaces/${space_id}/${userId}`,
      );

      console.log(response.data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to remove  space",
      };
    }
  }

  // Tasks
  async uploadTask(
    space_id: number,
    title: string,
    instruction: string,
    scoring: number,
    status: string,
    dueDate: string,
    groupsData: any[],
  ) {
    try {
      const response = await api.post(`/tasks/upload`, {
        space_id,
        title,
        instruction,
        scoring,
        status,
        due_date: dueDate,
        groupsData,
      });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to upload task",
      };
    }
  }

  async draftTask(
    spaceId: string,
    title: string,
    instruction: string,
    scoring: number,
    dueDate: string,
    groupsData: any[],
  ) {
    try {
      const response = await api.post(`/tasks/draft`, {
        space_id: spaceId,
        title,
        instruction,
        scoring,
        due_date: dueDate,
        groupsData,
      });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to draft task",
      };
    }
  }

  async getUploadedTasks(spaceId: string) {
    try {
      const response = await api.get(`/tasks/upload/${spaceId}`);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message:
          err.response?.data?.message || "Failed to fetch uploaded tasks",
      };
    }
  }

  async getDraftedTasks(spaceId: string) {
    try {
      const response = await api.get(`/tasks/draft/${spaceId}`);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to fetch drafted tasks",
      };
    }
  }

  async updateTaskStatus(taskId: number, newStatus: string) {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
      });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update task status",
      };
    }
  }
}

export const spaceService = new SpaceService();
