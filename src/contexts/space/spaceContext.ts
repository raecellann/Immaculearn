import { createContext } from "react";
import { Space, SpaceCreateData, SpacePendingInvitation } from "../../types/space";
import { UseQueryResult } from "@tanstack/react-query";

export interface SpaceContextType {
  // UI state
  currentSpace: Space | null;
  setCurrentSpace: (space: Space | null) => void;

  // Server data (from React Query)
  userSpaces: Space[];
  friendSpaces: Space[];
  isLoading: boolean;

  // Queries
  useJoinRequests: (
    spaceId: string
  ) => UseQueryResult<SpacePendingInvitation[], Error>;

  // Mutations
  createSpace: (data: SpaceCreateData) => Promise<any>;
  joinSpace: (inviteCode: string) => Promise<any>;
  acceptJoinRequest: (userId: number, spaceUuid: string) => Promise<any>;
  declineJoinRequest: (userId: number, spaceUuid: string) => Promise<any>;
  leaveSpace: (spaceUuid: string) => Promise<any>;
  deleteSpace: (spaceUuid: string) => Promise<any>;
}

export const SpaceContext = createContext<SpaceContextType | undefined>(
  undefined
);
