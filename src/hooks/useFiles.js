import { useQuery } from "@tanstack/react-query";
import FileService from "../services/fileService";
import { fileKeys } from "../queries/fileKeys";

const fileService = new FileService();

export const useFiles = () => {
  return useQuery({
    queryKey: fileKeys.lists(),
    queryFn: () => fileService.list(),
  });
};
