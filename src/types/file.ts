// Generic API response
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data: T;
}

// File data returned from backend
export interface FileData {
    file_id: string;
    fuuid: string;
    space_id: string;
    owner_id: string;
    filename: string;
    content: string;
    path: string | null;
    cld_url: string | null;
    public_id: string | null;
    mimetype: string;
    size: number;
    status: "local" | "drafted" | "uploaded";
    lesson_name?: string;
    created_at?: string;
}

// File upload payload
export interface UploadFileData {
    file: File;
}

// Upload response
export interface UploadResponse {
    public_id: string;
    cloud_url: string;
    size: number;
    status: "uploaded";
}





/**
 * GET DATA FROM SUPABASE
 */
export interface SupabaseFileMetadata {
  eTag: string;
  size: number;
  mimetype: string;
  cacheControl: string;
  lastModified: string;
  contentLength: number;
  httpStatusCode: number;
}

export interface ResourceFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: SupabaseFileMetadata;
  url: string;
}

export interface ListResourcesResponse {
  success: boolean;
  data: ResourceFile[];
  message: string;
}