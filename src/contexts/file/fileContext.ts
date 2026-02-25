import { FileData } from '../../types/file';

export interface FileContextType {
  // File operations
  files: FileData[];
  loading: boolean;
  error: string | null;
  
  // Upload operations
  uploadResource: (files: File | File[], space_uuid: string) => Promise<FileData | FileData[]>;
  isUploading: boolean;
  uploadProgress: number;
  
  // CRUD operations
  createFile: (title: string, space_id: string, content?: string) => Promise<FileData>;
  updateFile: (file_id: string, content: string) => Promise<FileData>;
  deleteFile: (file_id: string) => Promise<void>;
  
  // Utility functions
  refreshFiles: (space_id: string | number) => Promise<void>;
  clearError: () => void;
}