import React, { ReactNode, useState } from "react";
import { SpaceContext, SpaceContextType } from "./spaceContext";
import { spaceService } from "../../services/spaceService";
import { 
  Space, 
  SpaceCreateData, 
  ApiResponse, 
  SpacePendingInvitation, 
  SpaceMemberProfile,
  Task,
  DraftTask,
  TaskCreateData
} from "../../types/space";
import { useUser } from "../user/useUser";
import { useQuery, useQueryClient, useMutation, UseMutationResult } from "@tanstack/react-query";

export interface SpaceProviderProps {
  children: ReactNode;
}

export const SpaceProvider: React.FC<SpaceProviderProps> = ({ children }) => {
  const { isAuthenticated } = useUser();
  const queryClient = useQueryClient();
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);

  // ----------------------------
  // API FUNCTIONS
  // ----------------------------
  const fetchUserSpaces = async (): Promise<Space[]> => {
    try {
      const res = await spaceService.getUserSpaces();
      const spaces = res.data || [];
      return spaces;
    } catch (error) {
      console.error("Error fetching user spaces:", error);
      return [];
    }
  };

  const fetchCourseSpaces = async (): Promise<Space[]> => {
    try {
      const res = await spaceService.getCourseSpaces();
      const spaces = res.data || [];
      return spaces;
    } catch (error) {
      console.error("Error fetching user spaces:", error);
      return [];
    }
  };

  const fetchFriendSpaces = async (): Promise<Space[]> => {
    try {
      const res = await spaceService.getAllFriendSpaces();
      const spaces = res.data || [];
      return spaces;
    } catch (error) {
      console.error("Error fetching friend spaces:", error);
      return [];
    }
  };

  const fetchJoinRequests = async (spaceId: string): Promise<SpacePendingInvitation[]> => {
    const res = await spaceService.getJoinRequests(spaceId);
    return res.data || [];
  };

  // Task API functions
  const fetchUploadedTasks = async (spaceId: string): Promise<Task[]> => {
    try {
      const res = await spaceService.getUploadedTasks(spaceId);
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("Error fetching uploaded tasks:", error);
      return [];
    }
  };

  const fetchDraftedTasks = async (spaceId: string): Promise<DraftTask[]> => {
    try {
      const res = await spaceService.getDraftedTasks(spaceId);
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("Error fetching drafted tasks:", error);
      return [];
    }
  };

  // ----------------------------
  // QUERIES
  // ----------------------------
  const { data: userSpaces = [], isLoading: userSpacesLoading } = useQuery({
    queryKey: ["userSpaces"],
    queryFn: fetchUserSpaces,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const { data: courseSpaces = [], isLoading: courseSpacesLoading } = useQuery({
    queryKey: ["courseSpaces"],
    queryFn: fetchCourseSpaces,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const { data: friendSpaces = [], isLoading: friendSpacesLoading } = useQuery({
    queryKey: ["friendSpaces"],
    queryFn: fetchFriendSpaces,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const useJoinRequests = (spaceId: string) =>
    useQuery({
      queryKey: ["joinRequests", spaceId],
      queryFn: () => fetchJoinRequests(spaceId),
      enabled: !!spaceId && isAuthenticated,
      staleTime: 15_000,
    });

  // Task queries
  const useUploadedTasks = (spaceId: string) =>
    useQuery({
      queryKey: ["uploadedTasks", spaceId],
      queryFn: () => fetchUploadedTasks(spaceId),
      enabled: !!spaceId && isAuthenticated,
      staleTime: 30_000,
    });

  const useDraftedTasks = (spaceId: string) =>
    useQuery({
      queryKey: ["draftedTasks", spaceId],
      queryFn: () => fetchDraftedTasks(spaceId),
      enabled: !!spaceId && isAuthenticated,
      staleTime: 30_000,
    });

  const isLoading = userSpacesLoading || friendSpacesLoading;

  // ----------------------------
  // MUTATIONS
  // ----------------------------
  const createSpace = async (data: SpaceCreateData): Promise<ApiResponse<Space>> => {
    const result = await spaceService.createSpace(data);
    queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
    return result;
  };

  const createCourseSpace = async (data: SpaceCreateData): Promise<ApiResponse<Space>> => {
    const result = await spaceService.createCourseSpace(data);
    queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
    return result;
  };

  const joinSpace = async (inviteCode: string): Promise<ApiResponse> => {
    const spaceuuid = inviteCode.split("=").pop() || "";
    const result = await spaceService.joinSpace(spaceuuid);
    queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
    return result;
  };

  const acceptJoinRequest = async (userId: number, spaceId: string) => {
    await spaceService.acceptJoinRequest(userId, spaceId);
    queryClient.invalidateQueries({ queryKey: ["joinRequests", spaceId] });
    queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
  };

  const declineJoinRequest = async (userId: number, spaceId: string) => {
    await spaceService.declineJoinRequest(userId, spaceId);
    queryClient.invalidateQueries({ queryKey: ["joinRequests", spaceId] });
  };

  const leaveSpace = async (spaceId: string) => {
    await spaceService.leaveSpace(spaceId);
    queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
    if (currentSpace?.space_uuid === spaceId) setCurrentSpace(null);
  };

  const deleteSpace = async (spaceId: string) => {
    await spaceService.deleteSpace(spaceId);
    queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
    if (currentSpace?.space_uuid === spaceId) setCurrentSpace(null);
  };

  // Task mutations
  const uploadTaskMutation = useMutation({
    mutationFn: ({ spaceId, taskData }: { spaceId: string; taskData: TaskCreateData }) =>
      spaceService.uploadTask(
        spaceId,
        taskData.title,
        taskData.instruction || "",
        taskData.scoring || 0,
        taskData.due_date,
        taskData.groupsData || []
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTasks", variables.spaceId] });
    },
  });

  const draftTaskMutation = useMutation({
    mutationFn: ({ spaceId, taskData }: { spaceId: string; taskData: TaskCreateData }) =>
      spaceService.draftTask(
        spaceId,
        taskData.title,
        taskData.instruction || "",
        taskData.scoring || 0,
        taskData.due_date,
        taskData.groupsData || []
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draftedTasks", variables.spaceId] });
    },
  });

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: number; newStatus: string }) =>
      spaceService.updateTaskStatus(taskId, newStatus),
    onSuccess: (_, variables) => {
      // Invalidate both tasks queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["uploadedTasks"] });
      queryClient.invalidateQueries({ queryKey: ["draftedTasks"] });
    },
  });

  // ----------------------------
  // CONTEXT VALUE
  // ----------------------------
  const contextValue: SpaceContextType = {
    // UI state
    currentSpace,
    setCurrentSpace,

    // Server data
    userSpaces,
    courseSpaces,
    friendSpaces,
    isLoading,

    // Queries
    useJoinRequests,
    useUploadedTasks, // New: Task queries
    useDraftedTasks,  // New: Task queries

    // Mutations
    createSpace,
    createCourseSpace,
    joinSpace,
    acceptJoinRequest,
    declineJoinRequest,
    leaveSpace,
    deleteSpace,

    // Task mutations
    uploadTaskMutation,
    draftTaskMutation,
    updateTaskStatusMutation,
  };

  return <SpaceContext.Provider value={contextValue}>{children}</SpaceContext.Provider>;
};