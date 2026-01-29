export interface Space {
    space_id: string;
    space_uuid: string;
    space_name: string;
    members: [any];
    description: string | null;
    cover_image: string | null;
    created_by: string; // User ID
    created_at: string;
    updated_at: string;
}

export interface SpaceMember {
    user_id: string;
    space_id: string;
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
}

export interface SpaceCreateData {
    space_name: string;
    description?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface SpacePendingInvitation {
    account_id: number;
    email: string;
    fullname: string;
    profile_pic: string;
    added_at: string;
}