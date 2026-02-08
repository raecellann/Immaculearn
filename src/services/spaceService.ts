// services/spaceService.ts
import { api } from "../lib/api";
import { Space, SpaceCreateData, ApiResponse, SpacePendingInvitation } from "../types/space";

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

    async getUserSpaces(): Promise<ApiResponse<Space[]>> {
        try {
            const response = await api.get<ApiResponse<Space[]>>("/spaces/all");
            const data = Array.isArray(response.data?.data) ? response.data.data : [];
            console.log(response)
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
            console.log(response)
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
            const response = await api.post<ApiResponse>("/spaces/join", {
                space_uuid
            });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to join space",
            };
        }
    }

    async getAllPendingInvitations(space_uuid: string): Promise<ApiResponse<SpacePendingInvitation[]>> {
        try {
            const response = await api.get<ApiResponse<SpacePendingInvitation[]>>(`/spaces/${space_uuid}/invitations`);
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
                message: error.response?.data?.message || "Space Pending Inivation Not Found",
            };
        }
    }

    async acceptInvitation(account_id: number, space_uuid: string): Promise<ApiResponse> {
        try {
            const response = await api.patch<ApiResponse>(`/spaces/${space_uuid}/accept`, { user_id: account_id });

            return response.data
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Space Pending Inivation Not Found",
            };
        }
    }

    async declineInvitation(account_id: number, space_uuid: string): Promise<ApiResponse> {
        try {
            const response = await api.patch<ApiResponse>(`/spaces/${space_uuid}/decline`, { user_id: account_id });
            return response.data
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Space Pending Inivation Not Found",
            };
        }
    }

    async getJoinRequests(space_uuid: string): Promise<ApiResponse<SpacePendingInvitation[]>> {
        try {
            const response = await api.get<ApiResponse<SpacePendingInvitation[]>>(
                `/spaces/${space_uuid}/join-requests`
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
                message: error.response?.data?.message || "Failed to fetch join requests",
                data: [],
            };
        }
    }


    // Accept a join request
    async acceptJoinRequest(user_id: number, space_uuid: string): Promise<ApiResponse> {
        try {
            const response = await api.patch<ApiResponse>(
                `/spaces/${space_uuid}/accept/${user_id}?status=accepted`
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to accept join request",
            };
        }
    }

    // Decline a join request
    async declineJoinRequest(user_id: number, space_uuid: string): Promise<ApiResponse> {
        try {
            const response = await api.patch<ApiResponse>(
                `/spaces/${space_uuid}/decline/${user_id}?status=declined`
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to decline join request",
            };
        }
    }

    async leaveSpace(spaceUuid: string): Promise<ApiResponse> {
        try {
            const response = await api.delete<ApiResponse>(
                `/spaces/${spaceUuid}/leave`
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

            console.log(`SPACE UUID ${spaceUuid}`)
            const response = await api.delete<ApiResponse>(
                `/spaces/${spaceUuid}`
            );

            console.log(response.data)
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to leave space",
            };
        }
    }
}

export const spaceService = new SpaceService();
