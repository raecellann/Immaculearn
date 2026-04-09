import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { academicService } from '../../services/academicService';
import { AcademicState, AcademicContextType, CreateAcademicTermRequest, UpdateAcademicTermRequest } from '../../types/academic';

const initialState: AcademicState = {
  academicTerms: [],
  activeAcademicTerm: null,
  latestAcademicTerm: null,
  loading: false,
  error: null,
};

type AcademicAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACADEMIC_TERMS'; payload: any[] }
  | { type: 'SET_ACTIVE_ACADEMIC_TERM'; payload: any | null }
  | { type: 'SET_LATEST_ACADEMIC_TERM'; payload: any | null }
  | { type: 'ADD_ACADEMIC_TERM'; payload: any }
  | { type: 'UPDATE_ACADEMIC_TERM'; payload: { id: number; data: any } }
  | { type: 'CLEAR_ERROR' };

const academicReducer = (state: AcademicState, action: AcademicAction): AcademicState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_ACADEMIC_TERMS':
      return { ...state, academicTerms: action.payload, loading: false };
    case 'SET_ACTIVE_ACADEMIC_TERM':
      return { ...state, activeAcademicTerm: action.payload, loading: false };
    case 'SET_LATEST_ACADEMIC_TERM':
      return { ...state, latestAcademicTerm: action.payload, loading: false };
    case 'ADD_ACADEMIC_TERM':
      return {
        ...state,
        academicTerms: [action.payload, ...state.academicTerms],
        loading: false,
      };
    case 'UPDATE_ACADEMIC_TERM':
      return {
        ...state,
        academicTerms: state.academicTerms.map(term =>
          term.acad_term_id === action.payload.id
            ? { ...term, ...action.payload.data }
            : term
        ),
        activeAcademicTerm:
          state.activeAcademicTerm?.acad_term_id === action.payload.id
            ? { ...state.activeAcademicTerm, ...action.payload.data }
            : state.activeAcademicTerm,
        latestAcademicTerm:
          state.latestAcademicTerm?.acad_term_id === action.payload.id
            ? { ...state.latestAcademicTerm, ...action.payload.data }
            : state.latestAcademicTerm,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AcademicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(academicReducer, initialState);

  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  const fetchAllAcademicTerms = async () => {
    try {
      setLoading(true);
      clearError();
      const terms = await academicService.getAllAcademicTerms();
      dispatch({ type: 'SET_ACADEMIC_TERMS', payload: terms });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch academic terms');
    }
  };

  const fetchActiveAcademicTerm = async () => {
    try {
      setLoading(true);
      clearError();
      const term = await academicService.getActiveAcademicTerm();
      dispatch({ type: 'SET_ACTIVE_ACADEMIC_TERM', payload: term });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch active academic term');
    }
  };

  const fetchLatestAcademicTerm = async () => {
    try {
      setLoading(true);
      clearError();
      const term = await academicService.getLatestAcademicTerm();
      dispatch({ type: 'SET_LATEST_ACADEMIC_TERM', payload: term });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch latest academic term');
    }
  };

  const createAcademicTerm = async (data: CreateAcademicTermRequest) => {
    try {
      setLoading(true);
      clearError();
      const newTermId = await academicService.createAcademicTerm(data);
      
      // Refetch all terms to get the newly created term
      await fetchAllAcademicTerms();
      
      // If this is an active term, refetch active term
      if (data.academic_status === 'active') {
        await fetchActiveAcademicTerm();
      }
      
      // Refetch latest term
      await fetchLatestAcademicTerm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create academic term');
    }
  };

  const updateAcademicTerm = async (id: number, data: UpdateAcademicTermRequest) => {
    try {
      setLoading(true);
      clearError();
      await academicService.updateAcademicTerm(id, data);
      
      // Update local state immediately for better UX
      dispatch({ type: 'UPDATE_ACADEMIC_TERM', payload: { id, data } });
      
      // Refetch to ensure consistency
      await fetchAllAcademicTerms();
      await fetchActiveAcademicTerm();
      await fetchLatestAcademicTerm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update academic term');
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchActiveAcademicTerm();
    fetchLatestAcademicTerm();
  }, []);

  const contextValue: AcademicContextType = {
    ...state,
    fetchAllAcademicTerms,
    fetchActiveAcademicTerm,
    fetchLatestAcademicTerm,
    createAcademicTerm,
    updateAcademicTerm,
    clearError,
  };

  return (
    <AcademicContext.Provider value={contextValue}>
      {children}
    </AcademicContext.Provider>
  );
};

// Import AcademicContext from the context file
import { AcademicContext } from './academicContext';