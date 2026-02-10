import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { spaceService } from "../services/spaceService";

export const useTasks = (spaceId) => {
  const queryClient = useQueryClient();

  const uploadedTasksQuery = useQuery({
    queryKey: ["uploadedTasks", spaceId],
    queryFn: () => spaceService.getUploadedTasks(spaceId),
    enabled: !!spaceId,
  });

  const draftedTasksQuery = useQuery({
    queryKey: ["draftedTasks", spaceId],
    queryFn: () => spaceService.getDraftedTasks(spaceId),
    enabled: !!spaceId,
  });

  const uploadTaskMutation = useMutation({
    mutationFn: (taskData) => 
      spaceService.uploadTask(
        spaceId,
        taskData.title,
        taskData.instruction,
        taskData.scoring,
        taskData.due_date,
        taskData.groupsData
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["uploadedTasks", spaceId] }),
  });

  const draftTaskMutation = useMutation({
    mutationFn: (taskData) => 
      spaceService.draftTask(
        spaceId,
        taskData.title,
        taskData.instruction,
        taskData.scoring,
        taskData.due_date,
        taskData.groupsData
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["draftedTasks", spaceId] }),
  });

  return {
    uploadedTasksQuery,
    draftedTasksQuery,
    uploadTaskMutation,
    draftTaskMutation,
  };
};
