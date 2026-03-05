import { ApiResponse, AcademicTerm, CreateAcademicTermRequest, UpdateAcademicTermRequest } from '../types/academic';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class AcademicService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/academic${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Academic service error:', error);
      throw error;
    }
  }

  async getAllAcademicTerms(): Promise<AcademicTerm[]> {
    const response = await this.request<AcademicTerm[]>('/');
    return response.data || [];
  }

  async getActiveAcademicTerm(): Promise<AcademicTerm | null> {
    const response = await this.request<AcademicTerm>('/active');
    return response.data || null;
  }

  async getLatestAcademicTerm(): Promise<AcademicTerm | null> {
    const response = await this.request<AcademicTerm>('/latest');
    return response.data || null;
  }

  async createAcademicTerm(data: CreateAcademicTermRequest): Promise<number> {
    const response = await this.request<AcademicTerm>('/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.insertId) {
      return response.insertId;
    }
    
    throw new Error('Failed to create academic term');
  }

  async updateAcademicTerm(id: number, data: UpdateAcademicTermRequest): Promise<void> {
    await this.request<void>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const academicService = new AcademicService();
export default academicService;