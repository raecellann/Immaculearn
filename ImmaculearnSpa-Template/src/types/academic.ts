export interface AcademicTerm {
  acad_term_id: number;
  acad_term_name: string;
  semester: string;
  academic_year: string;
  academic_status: 'active' | 'completed' | 'inactive';
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAcademicTermRequest {
  acad_term_name: string;
  semester: string;
  academic_year: string;
  academic_status?: 'active' | 'completed' | 'inactive';
}

export interface UpdateAcademicTermRequest {
  acad_term_name?: string;
  semester?: string;
  academic_year?: string;
  academic_status?: 'active' | 'completed' | 'inactive';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  insertId?: number;
}

export interface AcademicState {
  academicTerms: AcademicTerm[];
  activeAcademicTerm: AcademicTerm | null;
  latestAcademicTerm: AcademicTerm | null;
  loading: boolean;
  error: string | null;
}

export interface AcademicContextType extends AcademicState {
  fetchAllAcademicTerms: () => Promise<void>;
  fetchActiveAcademicTerm: () => Promise<void>;
  fetchLatestAcademicTerm: () => Promise<void>;
  createAcademicTerm: (data: CreateAcademicTermRequest) => Promise<void>;
  updateAcademicTerm: (id: number, data: UpdateAcademicTermRequest) => Promise<void>;
  clearError: () => void;
}