export interface Announcement {
    announce_id: number;
    title: string;
    content: string;
    target_audience: string;
    publish_option: string;
    scheduled_at: string | null;
    is_published: number;
    created_by: number;
    created_at: string;
    updated_at: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    total?: number;
}