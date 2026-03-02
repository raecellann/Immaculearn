import React, { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router";
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
  AnswerData,
} from "../../types/space";
import { useUser } from "../user/useUser";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { io } from "socket.io-client";

export interface SpaceProviderProps {
  children: ReactNode;
}

import { toast } from "react-toastify";

export const SpaceProvider: React.FC<SpaceProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useUser();
  const queryClient = useQueryClient();
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [taskId, setTaskId] = useState<number>(0);
  const navigator = useNavigate();

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
  const fetchUploadedTasks = async (space_uuid: string): Promise<Task[]> => {
    try {
      const res = await spaceService.getUploadedTasks(space_uuid);
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

  const { data: archivedSpaces = [], isLoading: archivedSpacesLoading } =
    useQuery({
      queryKey: ["archivedSpaces"],
      queryFn: async () => {
        const res = await spaceService.getAllArchivedCourses();
        return res.data || [];
      },
      enabled: isAuthenticated,
      staleTime: Infinity, // never becomes stale automatically
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
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
  const useUploadedTasks = (space_uuid: string) =>
    useQuery({
      queryKey: ["uploadedTasks", space_uuid],
      queryFn: () => fetchUploadedTasks(space_uuid),
      enabled: !!space_uuid && isAuthenticated,
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
    return result;
  };

  const acceptJoinRequest = async (userId: number, spaceId: string) => {
    await spaceService.acceptJoinRequest(userId, spaceId);
    queryClient.invalidateQueries({
      queryKey: ["joinRequestsByLink"],
    });
    // queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
    // queryClient.invalidateQueries({ queryKey: ["friendSpaces"] });
    // queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
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
    queryClient.invalidateQueries({ queryKey: ["friendSpaces"] });
    queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
    if (currentSpace?.space_uuid === spaceId) setCurrentSpace(null);
  };

  const removeUserFromSpace = async (spaceId: string, userId: number) => {
    await spaceService.removeUserFromSpace(spaceId, userId);
    if (userSpaces?.some((s) => s.space_id === spaceId)) {
      queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
    } else if (friendSpaces?.some((s) => s.space_id === spaceId)) {
      queryClient.invalidateQueries({ queryKey: ["friendSpaces"] });
    } else if (courseSpaces?.some((s) => s.space_id === spaceId)) {
      queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
    }
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

  const setArchive = async (spaceUuid: string) => {
    const result = await spaceService.setArchive(spaceUuid);
    queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
    queryClient.invalidateQueries({ queryKey: ["archivedSpaces"] });

    return result;
  };

  const submitTaskAnswer = async (answerData: AnswerData) => {
    const result = await spaceService.submitTaskAnswer(answerData);
    // queryClient.invalidateQueries({ queryKey: ["archivedSpaces"] });

    return result;
  };

  const declineInvitation = async (accountId: number, spaceUuid: string) => {
    const result = await spaceService.declineInvitation(accountId, spaceUuid);
    queryClient.invalidateQueries({ queryKey: ["joinRequestsByLink"] });
    return result;
  };

  const acceptSpaceInvitation = async (spaceUuid: string) => {
    const result = await spaceService.acceptSpaceInvitation(spaceUuid);

    const invalidateIfExists = (
      spaces: Space[] | CourseSPace[],
      key: string,
    ) => {
      if (spaces?.some((s) => Number(s.space_id) === Number(spaceUuid))) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    };
    invalidateIfExists(userSpaces, "userSpaces");
    invalidateIfExists(friendSpaces, "friendSpaces");
    invalidateIfExists(courseSpaces, "courseSpaces");

    queryClient.invalidateQueries({ queryKey: ["pendingSpaceInvitation"] });
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
      space_uuid,
      taskData,
    }: {
      space_uuid: string;
      taskData: TaskCreateData;
    }) => spaceService.uploadTask(space_uuid, taskData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["uploadedTasks", variables.space_uuid],
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

  const { data: questionnaire = [], isLoading: questionnaireLoading } =
    useQuery({
      queryKey: ["questionnaire", taskId],
      queryFn: async () => {
        const res = await spaceService.getQuestionnaireByTaskId(taskId);
        return res.data || [];
      },
      enabled: isAuthenticated && !!taskId,
      staleTime: Infinity, // never becomes stale automatically
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    socket.on("join_space_by_link", () => {
      queryClient.invalidateQueries({ queryKey: ["joinRequestsByLink"] });
    });

    socket.on("add-by-owner", ({ space_id, email }) => {
      if (user?.email === email) {
        queryClient.invalidateQueries({ queryKey: ["pendingSpaceInvitation"] });
      }
    });

    socket.on("decline_space_invitation", () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSpaceInvitation"] });
    });

    socket.on("accept_space_invitation", ({ space_id, owner_id }) => {
      console.log("SPACE & OWNER ID", user?.id, owner_id);
      if (Number(owner_id) === Number(user?.id)) {
        const spaceIdNum = Number(space_id);

        const invalidateIfExists = (
          spaces: Space[] | CourseSPace[],
          key: string,
        ) => {
          if (spaces?.some((s) => Number(s.space_id) === Number(spaceIdNum))) {
            queryClient.invalidateQueries({ queryKey: [key] });
          }
        };

        invalidateIfExists(userSpaces, "userSpaces");
        invalidateIfExists(friendSpaces, "friendSpaces");
        invalidateIfExists(courseSpaces, "courseSpaces");
        // queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
        // queryClient.invalidateQueries({ queryKey: ["friendSpaces"] });
        // queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
      }
    });

    socket.on("remove_user_from_space", ({ spaceId, user_id }) => {
      if (Number(user_id) === Number(user?.id)) {
        const spaceIdNum = Number(spaceId);

        const invalidateIfExists = (
          spaces: Space[] | CourseSPace[],
          key: string,
        ) => {
          if (spaces?.some((s) => Number(s.space_id) === Number(spaceIdNum))) {
            queryClient.invalidateQueries({ queryKey: [key] });
            toast.info(
              `You've been remove from the Space ${spaces?.find((s) => Number(s.space_id) === Number(spaceIdNum))?.space_name}`,
            );
            if (currentSpace) {
              navigator(user?.role === "professor" ? "/prof/spaces" : "/space");
            }
          }
        };

        invalidateIfExists(userSpaces, "userSpaces");
        invalidateIfExists(friendSpaces, "friendSpaces");
        invalidateIfExists(courseSpaces, "courseSpaces");
        // queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
        // queryClient.invalidateQueries({ queryKey: ["friendSpaces"] });
        // queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
      }
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
  }, [
    isAuthenticated,
    queryClient,
    userSpaces,
    courseSpaces,
    friendSpaces,
    currentSpace,
  ]);

  // ----------------------------
  // CONTEXT VALUE
  // ----------------------------
  const contextValue: SpaceContextType = {
    // UI state
    currentSpace,
    setCurrentSpace,
    setTaskId,
    questionnaire,

    // Server data
    userSpaces,
    courseSpaces,
    friendSpaces,
    archivedSpaces,
    archivedSpacesLoading,
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
    setArchive,
    submitTaskAnswer,

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
