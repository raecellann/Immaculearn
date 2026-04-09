// types/register.ts
export interface RegisterEmailPayload {
  email: string;
}

export interface RegisterEmailResponse {
  inserted: boolean;
  email: string;
}

export interface StudentEmailListResponse {
  emails: string[];
}