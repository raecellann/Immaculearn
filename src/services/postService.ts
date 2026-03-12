// services/postService.ts
import { api } from "../lib/api";
import { Post, Comment, PostCreateData, CommentCreateData, ApiResponse } from "../types/post";

class PostService {
    async createPost(postData: PostCreateData): Promise<ApiResponse<Post>> {
        try {
            const response = await api.post<ApiResponse<Post>>("/post/", {
                space_id: postData.space_uuid,
                post_content: postData.post_content,
            });

            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to create post",
            };
        }
    }
    
    async createComment(commentData: CommentCreateData): Promise<ApiResponse<Comment>> {
        try {
            const response = await api.post<ApiResponse<Comment>>("/post/comment", {
                space_uuid: commentData.space_uuid,
                post_content: commentData.post_content,
                parent_id: commentData.parent_id,
            });

            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to create comment",
            };
        }
    }

    async getPosts(space_uuid: string): Promise<ApiResponse<Post[]>> {
        try {
            const response = await api.get<ApiResponse<Post[]>>(
                `/post/${space_uuid}`
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to fetch post",
            };
        }
    }

    async getComments(postId: string): Promise<ApiResponse<Comment[]>> {
        try {
            const response = await api.get<ApiResponse<Comment[]>>(
                `/post/comment/${postId}`
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to fetch comments",
            };
        }
    }

    async deletepost(postId: string): Promise<ApiResponse<void>> {
        try {
            const response = await api.delete<ApiResponse<void>>(
                `/post/${postId}`
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to delete post",
            };
        }
    }
}

export const postService = new PostService();
