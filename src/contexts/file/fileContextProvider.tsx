import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import FileService from "../../services/fileService";
import { FileContextType } from "./fileContext";
import { FileData } from "../../types/file";

import { useUser } from "../user/useUser";
import { useSpace } from "../space/useSpace";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

const FileContext = createContext<FileContextType | undefined>(undefined);

interface FileProviderProps {
  children: ReactNode;
}

export const FileProvider: React.FC<FileProviderProps> = ({ children }) => {
  const { isAuthenticated } = useUser();
  const { currentSpace } = useSpace();
  const { space_uuid: urlSpaceUuid } = useParams();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  // Use space_uuid from URL params first, then fallback to currentSpace
  const spaceUuid = urlSpaceUuid || currentSpace?.space_uuid;

  const fileService = new FileService();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshFiles = useCallback(async (space_id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const fileList = await fileService.list(Number(space_id));
      setFiles(fileList);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch files";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const {
    data: resources = [],
    isLoading: resourcesLoading,
    error: resourcesError,
  } = useQuery({
    queryKey: ["get-list-resources-by-space-uuid", spaceUuid],
    queryFn: async () => {
      return await fileService.getListResourceBySpaceUUID(spaceUuid);
    },
    enabled: isAuthenticated && !!spaceUuid,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
    retryDelay: 1000,
  });

  // Log resources error if it exists
  if (resourcesError) {
    console.error("Resources query error:", resourcesError);
    setError(
      resourcesError instanceof Error
        ? resourcesError.message
        : "Failed to fetch resources",
    );
  }

  const uploadResource = useCallback(
    async (
      files: File | File[],
      space_uuid: string,
      lesson_name: string,
    ): Promise<FileData | FileData[]> => {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        // Handle both single file and array of files
        const fileArray = Array.isArray(files) ? files : [files];
        const uploadPromises = fileArray.map(async (file, index) => {
          // Simulate progress updates for each file
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
              const progressForFile = Math.min(
                prev + 100 / fileArray.length,
                90,
              );
              return progressForFile;
            });
          }, 100);

          try {
            const uploadedFile = await fileService.uploadResource(
              file,
              space_uuid,
              lesson_name,
            );
            clearInterval(progressInterval);
            return uploadedFile;
          } catch (error) {
            clearInterval(progressInterval);
            throw error;
          }
        });

        const results = await Promise.all(uploadPromises);
        setUploadProgress(100);

        // Add new files to the existing files array
        setFiles((prev) => [...results, ...prev]);

        // Refresh resources after successful upload
        await queryClient.invalidateQueries({
          queryKey: ["get-list-resources-by-space-uuid", space_uuid],
        });

        // Reset progress after a short delay
        setTimeout(() => setUploadProgress(0), 1000);

        return Array.isArray(files) ? results : results[0];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload file";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [queryClient],
  );

  const createFile = useCallback(
    async (
      title: string,
      space_id: string,
      content = "",
    ): Promise<FileData> => {
      setLoading(true);
      setError(null);

      try {
        const newFile = await fileService.create(title, space_id, content);
        setFiles((prev) => [newFile, ...prev]);
        toast.success(`File "${title}" created successfully`);
        return newFile;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create file";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateFile = useCallback(
    async (file_id: string, content: string): Promise<FileData> => {
      setLoading(true);
      setError(null);

      try {
        const updatedFile = await fileService.draft(file_id, content);
        setFiles((prev) =>
          prev.map((file) => (file.file_id === file_id ? updatedFile : file)),
        );
        toast.success("File updated successfully");
        return updatedFile;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update file";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteFile = useCallback(async (file_id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await fileService.delete(file_id);
      setFiles((prev) => prev.filter((file) => file.file_id !== file_id));
      toast.success("File deleted successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete file";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshResources = useCallback(
    async (space_uuid: string) => {
      setError(null);
      try {
        await queryClient.invalidateQueries({
          queryKey: ["get-list-resources-by-space-uuid", space_uuid],
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to refresh resources";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
    [queryClient],
  );

  const value: FileContextType = {
    resources,
    files,
    loading,
    error,
    uploadResource,
    isUploading,
    uploadProgress,
    createFile,
    updateFile,
    deleteFile,
    refreshFiles,
    refreshResources,
    clearError,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
};

export const useFile = (): FileContextType => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFile must be used within a FileProvider");
  }
  return context;
};
