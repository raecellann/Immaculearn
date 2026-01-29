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
