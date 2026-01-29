// services/fileService.ts
import { api } from "../lib/api";
import { UploadResponse, ApiResponse, FileData } from "../types/file";

class FileService {
    async create(title: string, space_id: string, content = ""): Promise<FileData> {
        return api
            .post<ApiResponse<FileData>>("/files/create", { title, space_id, content })
            .then(res => {
                if (!res.data.success) {
                    throw new Error(res.data.message || "Failed to create file");
                }
                return res.data.data;
            });
    }

    async draft(file_id: string, content: string): Promise<FileData> {
        return api
            .post<ApiResponse<FileData>>("/files/draft", { file_id, content })
            .then(res => {
                if (!res.data.success) {
                    throw new Error(res.data.message || "Failed to save draft");
                }
                return res.data.data;
            });
    }

    async upload(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append("file", file);

        return api
            .post<ApiResponse<UploadResponse>>("/files/upload", formData)
            .then(res => {
                if (!res.data.success) {
                    throw new Error(res.data.message || "Upload failed");
                }
                return res.data.data;
            });
    }

    async delete(file_id: string): Promise<void> {
        return api.post("/files/delete", { id: file_id }).then(() => { });
    }

    async list(space_id: number): Promise<FileData[]> {
        return api
            .get<ApiResponse<FileData[]>>(`/files/${space_id}/list`)
            .then(res => {
                if (!res.data.success) {
                    throw new Error(res.data.message || "Fetch failed");
                }
                return res.data.data;
            });
    }
}

export default FileService;
