// services/fileService.ts
import { api } from "../lib/api";
import {
  UploadResponse,
  ApiResponse,
  FileData,
  ResourceFile,
} from "../types/file";

class FileService {
  async uploadResource(file: File, space_uuid: string, lesson_name: string): Promise<FileData> {
    console.log(space_uuid);
    const formData = new FormData();
    formData.append("file", file); // MUST match upload.single("file")
    formData.append("space_uuid", space_uuid); // MUST match upload.single("file")
    formData.append("lesson_name", lesson_name); // MUST match upload.single("file")

    const res = await api.post<ApiResponse<FileData>>(
      "/files/resources/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Upload failed");
    }

    return res.data.data;
    
  }

  async getListResourceBySpaceUUID(
    space_uuid: string | undefined,
  ): Promise<ResourceFile[]> {
    console.log("Fetching resources for space_uuid:", space_uuid);
    
    if (!space_uuid) {
      console.error("No space_uuid provided");
      throw new Error("space_uuid is required");
    }

    try {
      const res = await api.get<ApiResponse<ResourceFile[]>>(
        `/files/resources/${space_uuid}`,
      );

      console.log("API response:", res);

      if (!res.data) {
        console.error("No data in response");
        throw new Error("No data received from server");
      }

      if (!res.data.success) {
        console.error("API returned error:", res.data.message);
        throw new Error(res.data.message || "Get Resources failed");
      }

      console.log("Successfully fetched resources:", res.data.data);
      return res.data.data;
    } catch (error) {
      console.error("Error in getListResourceBySpaceUUID:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred while fetching resources");
    }
  }
  async create(
    title: string,
    space_id: string,
    content = "",
  ): Promise<FileData> {
    return api
      .post<
        ApiResponse<FileData>
      >("/files/create", { title, space_id, content })
      .then((res) => {
        if (!res.data.success) {
          throw new Error(res.data.message || "Failed to create file");
        }
        return res.data.data;
      });
  }

  async draft(file_id: string, content: string): Promise<FileData> {
    return api
      .post<ApiResponse<FileData>>("/files/draft", { file_id, content })
      .then((res) => {
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
      .then((res) => {
        if (!res.data.success) {
          throw new Error(res.data.message || "Upload failed");
        }
        return res.data.data;
      });
  }

  async uploadResources(file: File, space_uuid: string, lesson_name: string): Promise<FileData> {
    console.log("Uploading to space:", space_uuid);

    if (!file) {
      throw new Error("No file provided");
    }

    // Await the upload
    const uploadedFile = await this.uploadResource(file, space_uuid, lesson_name);

    return uploadedFile;
  }

  async delete(file_id: string): Promise<void> {
    return api.post("/files/delete", { id: file_id }).then(() => {});
  }

  async list(space_id: number): Promise<FileData[]> {
    return api
      .get<ApiResponse<FileData[]>>(`/files/${space_id}/list`)
      .then((res) => {
        if (!res.data.success) {
          throw new Error(res.data.message || "Fetch failed");
        }
        return res.data.data;
      });
  }
}

export default FileService;
