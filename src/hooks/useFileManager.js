// hooks/useFileManager.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FileService from "../services/fileService";

const service = new FileService();

export const useFileManager = (space_id) => {
  const queryClient = useQueryClient();

  // 📄 List files
  const list = useQuery({
    queryKey: ["files"],
    queryFn: () => service.list(space_id),
    enabled: !!space_id,
  });

  // ➕ Create file
  const create = useMutation({
    mutationFn: ({ title, space_id, content }) =>
      service.create(title, space_id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  // ✏️ Save draft
  const draft = useMutation({
    mutationFn: ({ file_id, content }) =>
      service.draft(file_id, content),
  });

  // ☁️ Upload file
  const upload = useMutation({
    mutationFn: (file) => service.upload(file),
  });

  // 🗑 Delete file
  const remove = useMutation({
    mutationFn: (file_id) => service.delete(file_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  return {
    list,
    create,
    draft,
    upload,
    remove,
  };
};
