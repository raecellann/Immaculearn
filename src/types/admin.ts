export interface Admin {
  id: string;
  email: string;
  fullname: string;
  role: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
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