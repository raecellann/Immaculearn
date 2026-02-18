import { createContext } from "react";
import { PostCreateData, CommentCreateData, Post, Comment } from "../../types/post";

export interface User {
    id: string;
    email: string;
    username?: string;
    role?: string;
    [key: string]: any;
}

export interface UserContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: (account_id: number) => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
    createAccount: (payload: any) => Promise<boolean>;
    createPost: (postData: PostCreateData) => Promise<{ success: boolean; message?: string; data?: Post }>;
    createComment: (commentData: CommentCreateData) => Promise<{ success: boolean; message?: string; data?: Comment }>;
    getPosts: (spaceId: string) => Promise<{ success: boolean; message?: string; data?: Post[] }>;
    getComments: (postId: string) => Promise<{ success: boolean; message?: string; data?: Comment[] }>;
}

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);
