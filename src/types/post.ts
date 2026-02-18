export interface Post {
    id: string;
    post_uuid?: string;
    content: string;
    account_id: string;
    space_id: string;
    created_at?: string;
    updated_at?: string;
    author_name?: string;
    author_profile_pic?: string;
}

export interface Comment {
    id: string;
    comment_uuid?: string;
    content: string;
    account_id: string;
    space_id: string;
    post_id: string;
    parent_id?: string;
    created_at?: string;
    updated_at?: string;
    author_name?: string;
    author_profile_pic?: string;
}

export interface PostCreateData {
    space_id: string;
    post_content: string;
}

export interface CommentCreateData {
    space_id: string;
    post_id: string;
    post_content: string;
    parent_id?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}
