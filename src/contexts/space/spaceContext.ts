import { createContext } from "react";
import {
  Space,
  SpaceCreateData,
  SpacePendingInvitation,
  Task,
  DraftTask,
  TaskCreateData,
  PendingSpaceInvitation,
  CourseSpaceCreateData,
  CourseSPace,
} from "../../types/space";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

export interface SpaceContextType {
  // UI state
  currentSpace: Space | null;
  setCurrentSpace: (space: Space | null) => void;

  // Server data
  userSpaces: Space[];
  courseSpaces: CourseSPace[];
  friendSpaces: Space[];
  isLoading: boolean;

  joinRequestsByLink: SpacePendingInvitation[];
  joinRequestsByLinkLoading: boolean;

  pendingSpaceInvitation: PendingSpaceInvitation[];
  pendingSpaceInvitationLoading: boolean;

  allJoinRequestsData: SpacePendingInvitation[];
  allJoinRequestsLoading: boolean;

  // Queries
  useJoinRequests: (
    spaceId: string,
  ) => UseQueryResult<SpacePendingInvitation[], Error>;

  // New: Task queries
  useUploadedTasks: (space_uuid: string) => UseQueryResult<Task[], Error>;

  useDraftedTasks: (spaceId: string) => UseQueryResult<DraftTask[], Error>;

  // Space mutations
  createSpace: (data: SpaceCreateData) => Promise<any>;
  createCourseSpace: (data: CourseSpaceCreateData) => Promise<any>;
  joinSpace: (inviteCode: string) => Promise<any>;
  inviteUser: (space_uuid: string, email: string) => Promise<any>;
  acceptJoinRequest: (userId: number, spaceUuid: string) => Promise<any>;
  declineJoinRequest: (userId: number, spaceUuid: string) => Promise<any>;
  leaveSpace: (space_uuid: string) => Promise<any>;
  deleteSpace: (spaceUuid: string) => Promise<any>;
  removeUserFromSpace: (spaceUuid: string, userId: number) => Promise<any>;

  // Invitation mutations
  getAllPendingRequest: (spaceUuid: string) => Promise<any>;
  acceptInvitation: (accountId: number, spaceUuid: string) => Promise<any>;
  declineInvitation: (accountId: number, spaceUuid: string) => Promise<any>;

  /**
   * SPACE INVITATION
   */
  acceptSpaceInvitation: (spaceUuid: string) => Promise<any>;
  declineSpaceInvitation: (spaceUuid: string) => Promise<any>;

  // New: Task mutations
  uploadTaskMutation: UseMutationResult<
    any,
    Error,
    { space_uuid: string; taskData: TaskCreateData },
    unknown
  >;

  draftTaskMutation: UseMutationResult<
    any,
    Error,
    { spaceId: string; taskData: TaskCreateData },
    unknown
  >;

  updateTaskStatusMutation: UseMutationResult<
    any,
    Error,
    { taskId: number; newStatus: string },
    unknown
  >;
}

export const SpaceContext = createContext<SpaceContextType | undefined>(
  undefined,
);
