export interface Admin {
  id: string;
  email: string;
  fullname: string;
  role: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}


export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminCreateRequest {
  email: string;
  password: string;
  fullname: string;
}

export interface AdminAuthResponse {
  success: boolean;
  message?: string;
}

export interface AdminStats {
  totalStudent: number;
  totalProfessor: number;
  totalSpaces: number;
  totalPosts: number;
  totalComments: number;
}


export interface AcademicData {
  academic_id: number;
  academic_period: string;
  academic_semester: number;
  academic_year: string;
  academic_status: string;
}

export interface AnnouncementData {
  announcement_id: number;
  announcement_title: string;
  announcement_content: string;
  announcement_date: string;
  announcement_status: string;
  target_audience: string;
  publish_option: string;
  scheduled_at: string;
  created_by: string;

}

export interface AnnouncementCreateData {
  title: string;
  content: string;
  target_audience: string;
  scheduled_at?: string;
  publish_option: string;
}




