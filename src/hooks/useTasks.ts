import { useContext } from "react";
import { SpaceContext } from "../contexts/space/spaceContext";

export const useTasks = (spaceId?: string) => {
  const context = useContext(SpaceContext);
  
  if (!context) {
    throw new Error("useTasks must be used within a SpaceProvider");
  }

  const {
    useUploadedTasks,
    useDraftedTasks,
    uploadTaskMutation,
    draftTaskMutation,
    updateTaskStatusMutation
  } = context;

  return {
    // Queries
    uploadedTasksQuery: useUploadedTasks(spaceId || ""),
    draftedTasksQuery: useDraftedTasks(spaceId || ""),
    
    // Mutations
    uploadTaskMutation,
    draftTaskMutation,
    updateTaskStatusMutation,
  };
};