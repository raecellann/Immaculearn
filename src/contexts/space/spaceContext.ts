import { createContext } from "react";
import {
  Space,
  SpaceCreateData,
  SpacePendingInvitation,
  Task,
  DraftTask,
  TaskCreateData
} from "../../types/space";
import {
  UseQueryResult,
  UseMutationResult
} from "@tanstack/react-query";

export interface SpaceContextType {
  // UI state
  currentSpace: Space | null;
  setCurrentSpace: (space: Space | null) => void;

  // Server data
  userSpaces: Space[];
  courseSpaces: Space[];
  friendSpaces: Space[];
  isLoading: boolean;

  // Queries
  useJoinRequests: (
    spaceId: string
  ) => UseQueryResult<SpacePendingInvitation[], Error>;

  // New: Task queries
  useUploadedTasks: (
    spaceId: string
  ) => UseQueryResult<Task[], Error>;

  useDraftedTasks: (
    spaceId: string
  ) => UseQueryResult<DraftTask[], Error>;

  // Space mutations
  createSpace: (data: SpaceCreateData) => Promise<any>;
  createCourseSpace: (data: SpaceCreateData) => Promise<any>;
  joinSpace: (inviteCode: string) => Promise<any>;
  acceptJoinRequest: (userId: number, spaceUuid: string) => Promise<any>;
  declineJoinRequest: (userId: number, spaceUuid: string) => Promise<any>;
  leaveSpace: (spaceUuid: string) => Promise<any>;
  deleteSpace: (spaceUuid: string) => Promise<any>;

  // New: Task mutations
  uploadTaskMutation: UseMutationResult<
    any,
    Error,
    { spaceId: number, taskData: TaskCreateData },
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
  undefined
);