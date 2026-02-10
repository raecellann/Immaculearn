import React, { ReactNode, useState } from "react";
import { SpaceContext, SpaceContextType } from "./spaceContext";
import { spaceService } from "../../services/spaceService";
import { Space, SpaceCreateData, ApiResponse, SpacePendingInvitation, SpaceMemberProfile } from "../../types/space";
import { useUser } from "../user/useUser";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
      console.log("Fetching user spaces...");
      const res = await spaceService.getUserSpaces();
      console.log("API response:", res);
      const spaces = res.data || [];
      console.log("Spaces fetched:", spaces);
      return spaces;
    } catch (error) {
      console.error("Error fetching user spaces:", error);
      return [];
    }
  };

  const fetchFriendSpaces = async (): Promise<Space[]> => {
    try {
      console.log("Fetching friend spaces...");
      const res = await spaceService.getAllFriendSpaces();
      console.log("API response:", res);
      const spaces = res.data || [];
      console.log("Spaces fetched:", spaces);
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

  // ----------------------------
  // QUERIES
  // ----------------------------
  const { data: userSpaces = [], isLoading: userSpacesLoading } = useQuery({
    queryKey: ["userSpaces"],
    queryFn: fetchUserSpaces,
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
      enabled: !!spaceId,
      staleTime: 15_000,
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

  // ----------------------------
  // CONTEXT VALUE
  // ----------------------------
  const contextValue: SpaceContextType = {
    currentSpace,
    setCurrentSpace,
    userSpaces,
    friendSpaces,
    isLoading,
    useJoinRequests,
    createSpace,
    joinSpace,
    acceptJoinRequest,
    declineJoinRequest,
    leaveSpace,
    deleteSpace,
  };

  return <SpaceContext.Provider value={contextValue}>{children}</SpaceContext.Provider>;
};