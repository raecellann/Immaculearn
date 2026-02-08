
export interface SpaceMemberProfile {
    account_id: number;
    birth_date: string;
    course: string;
    department: string;
    email: string;
    full_name: string;
    gender: string;
    profile_pic: string;
    role: string;
    year_level: string;
}



interface SpaceSettings {
    space_cover: string;
    max_member: number;
}

export interface SpaceCreateData {
    space_name: string;
    description?: string;
    settings?: SpaceSettings;
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

export interface Space {
    space_id: string;
    space_uuid: string;
    space_name: string;
    members: SpaceMemberProfile[];
    description: string | null;
    settings?: SpaceSettings;
    created_by: string; // User ID
    created_at: string;
    updated_at: string;
}
