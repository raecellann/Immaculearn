import React, { ReactNode, useState, useEffect } from "react";
import { SpaceContext, SpaceContextType } from "./spaceContext";
import { spaceService } from "../../services/spaceService";
import {
  Space,
  SpaceCreateData,
  ApiResponse,
  SpacePendingInvitation,
  Task,
  DraftTask,
  TaskCreateData,
  CourseSpaceCreateData,
  CourseSPace,
} from "../../types/space";
import { useUser } from "../user/useUser";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { io } from "socket.io-client";

export interface SpaceProviderProps {
  children: ReactNode;
}

export const SpaceProvider: React.FC<SpaceProviderProps> = ({ children }) => {
  const { isAuthenticated } = useUser();
  const queryClient = useQueryClient();
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    socket.on("space_invitation_updated", () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSpaceInvitation"] });
    });

    socket.on("join_space_by_link", () => {
      queryClient.invalidateQueries({ queryKey: ["joinRequestsByLink"] });
    });

    socket.on("add-by-owner", () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSpaceInvitation"] });
    });

    socket.on("decline_space_invitation", () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSpaceInvitation"] });
    });

    socket.on("accept_space_invitation", () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSpaceInvitation"] });
      queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
      queryClient.invalidateQueries({ queryKey: ["friendSpaces"] });
      queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket for space updates");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, queryClient]);

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

  const fetchCourseSpaces = async (): Promise<CourseSPace[]> => {
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

  const fetchJoinRequests = async (
    spaceId: string,
  ): Promise<SpacePendingInvitation[]> => {
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

  const fetchAllJoinRequests = async (): Promise<SpacePendingInvitation[]> => {
    try {
      const res = await spaceService.getAllJoinSpaceRequests();
      return res.data || [];
    } catch (error) {
      console.error("Error fetching all join requests:", error);
      return [];
    }
  };

  const { data: allJoinRequestsData = [], isLoading: allJoinRequestsLoading } =
    useQuery({
      queryKey: ["allJoinRequests"],
      queryFn: fetchAllJoinRequests,
      enabled: isAuthenticated,
      staleTime: 30_000,
    });

  const useJoinRequests = (spaceId: string) =>
    useQuery({
      queryKey: ["joinRequests", spaceId],
      queryFn: async () => {
        const result = await fetchJoinRequests(spaceId);
        return result || [];
      },
      enabled: !!spaceId && isAuthenticated,
      staleTime: Infinity, // never becomes stale automatically
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
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
  const createSpace = async (
    data: SpaceCreateData,
  ): Promise<ApiResponse<Space>> => {
    const result = await spaceService.createSpace(data);
    queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
    return result;
  };

  const createCourseSpace = async (
    data: CourseSpaceCreateData,
  ): Promise<ApiResponse<Space>> => {
    const result = await spaceService.createCourseSpace(data);
    if (result.success)
      queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
    return result;
  };

  const joinSpace = async (inviteCode: string): Promise<ApiResponse> => {
    const spaceuuid = inviteCode.split("=").pop() || "";
    const result = await spaceService.joinSpace(spaceuuid);

    if (result.success) {
      queryClient.invalidateQueries({
        queryKey: ["joinRequestsByLink"],
      });
      queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
      queryClient.invalidateQueries({ queryKey: ["friendSpaces"] });
      queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
    }
    return result;
  };

  const inviteUser = async (
    space_uuid: string,
    email: string,
  ): Promise<ApiResponse> => {
    // const spaceuuid = inviteCode.split("=").pop() || "";
    const result = await spaceService.inviteUser(space_uuid, email);
    queryClient.invalidateQueries({ queryKey: ["pendingSpaceInvitation"] });
    // queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
    // queryClient.invalidateQueries({ queryKey: ["friendSpaces"] });
    // queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
    return result;
  };

  const acceptJoinRequest = async (userId: number, spaceId: string) => {
    await spaceService.acceptJoinRequest(userId, spaceId);
    queryClient.invalidateQueries({
      queryKey: ["joinRequestsByLink"],
    });
    queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
    queryClient.invalidateQueries({ queryKey: ["friendSpaces"] });
    queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
  };

  const declineJoinRequest = async (userId: number, spaceId: string) => {
    await spaceService.declineJoinRequest(userId, spaceId);
    queryClient.invalidateQueries({
      queryKey: ["joinRequestsByLink"],
    });
  };

  const leaveSpace = async (space_uuid: string) => {
    await spaceService.leaveSpace(space_uuid);
    if (courseSpaces.some((s) => s.space_uuid === space_uuid)) {
      queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
      queryClient.invalidateQueries({ queryKey: ["friendSpaces"] });
    }
    if (currentSpace?.space_uuid === space_uuid) setCurrentSpace(null);
  };

  const deleteSpace = async (spaceId: string) => {
    await spaceService.deleteSpace(spaceId);
    queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
    if (currentSpace?.space_uuid === spaceId) setCurrentSpace(null);
  };

  const removeUserFromSpace = async (spaceId: string, userId: number) => {
    await spaceService.removeUserFromSpace(spaceId, userId);
    queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
    if (currentSpace?.space_uuid === spaceId) setCurrentSpace(null);
  };

  // Invitation functions
  const getAllPendingRequest = async (spaceUuid: string) => {
    const result = await spaceService.getAllPendingRequest(spaceUuid);
    return result;
  };

  const {
    data: joinRequestsByLink = [],
    isLoading: joinRequestsByLinkLoading,
  } = useQuery({
    queryKey: ["joinRequestsByLink"],
    queryFn: async () => {
      const res = await spaceService.getAllJoinSpaceRequests();
      return res.data || [];
    },
    enabled: isAuthenticated,
    staleTime: Infinity, // never becomes stale automatically
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const {
    data: pendingSpaceInvitation = [],
    isLoading: pendingSpaceInvitationLoading,
  } = useQuery({
    queryKey: ["pendingSpaceInvitation"],
    queryFn: async () => {
      const res = await spaceService.getAllSpaceInvitation();
      return res.data || [];
    },
    enabled: isAuthenticated,
    staleTime: Infinity, // never becomes stale automatically
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const acceptInvitation = async (accountId: number, spaceUuid: string) => {
    const result = await spaceService.acceptInvitation(accountId, spaceUuid);

    queryClient.invalidateQueries({ queryKey: ["joinRequestsByLink"] });
    queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
    queryClient.invalidateQueries({ queryKey: ["friendSpaces"] });
    queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });

    return result;
  };

  const declineInvitation = async (accountId: number, spaceUuid: string) => {
    const result = await spaceService.declineInvitation(accountId, spaceUuid);
    queryClient.invalidateQueries({ queryKey: ["joinRequestsByLink"] });
    return result;
  };

  const acceptSpaceInvitation = async (spaceUuid: string) => {
    const result = await spaceService.acceptSpaceInvitation(spaceUuid);

    queryClient.invalidateQueries({ queryKey: ["pendingSpaceInvitation"] });
    queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
    queryClient.invalidateQueries({ queryKey: ["friendSpaces"] });
    queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });

    return result;
  };

  const declineSpaceInvitation = async (spaceUuid: string) => {
    const result = await spaceService.declineSpaceInvitation(spaceUuid);
    queryClient.invalidateQueries({ queryKey: ["pendingSpaceInvitation"] });
    return result;
  };

  // Task mutations
  const uploadTaskMutation = useMutation({
    mutationFn: ({
      spaceId,
      taskData,
    }: {
      spaceId: number;
      taskData: TaskCreateData;
    }) =>
      spaceService.uploadTask(
        spaceId,
        taskData.title,
        taskData.instruction || "",
        taskData.scoring || 0,
        taskData.status,
        taskData.due_date,
        taskData.groupsData || [],
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["uploadedTasks", variables.spaceId],
      });
    },
  });

  const draftTaskMutation = useMutation({
    mutationFn: ({
      spaceId,
      taskData,
    }: {
      spaceId: string;
      taskData: TaskCreateData;
    }) =>
      spaceService.draftTask(
        spaceId,
        taskData.title,
        taskData.instruction || "",
        taskData.scoring || 0,
        taskData.due_date,
        taskData.groupsData || [],
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["draftedTasks", variables.spaceId],
      });
    },
  });

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({
      taskId,
      newStatus,
    }: {
      taskId: number;
      newStatus: string;
    }) => spaceService.updateTaskStatus(taskId, newStatus),
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

    joinRequestsByLink,
    joinRequestsByLinkLoading,

    pendingSpaceInvitation,
    pendingSpaceInvitationLoading,

    allJoinRequestsData,
    allJoinRequestsLoading,

    // Queries
    useJoinRequests,
    useUploadedTasks, // New: Task queries
    useDraftedTasks, // New: Task queries

    // Mutations
    createSpace,
    createCourseSpace,
    joinSpace,
    inviteUser,
    acceptJoinRequest,
    declineJoinRequest,
    leaveSpace,
    deleteSpace,
    removeUserFromSpace,

    // Invitation mutations

    getAllPendingRequest,
    acceptInvitation,
    declineInvitation,

    /**
     * SPACE INVITATION
     */

    acceptSpaceInvitation,
    declineSpaceInvitation,

    // Task mutations
    uploadTaskMutation,
    draftTaskMutation,
    updateTaskStatusMutation,
  };

  return (
    <SpaceContext.Provider value={contextValue}>
      {children}
    </SpaceContext.Provider>
  );
};
