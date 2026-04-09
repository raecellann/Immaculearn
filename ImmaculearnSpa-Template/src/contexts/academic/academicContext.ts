import { createContext, useContext } from 'react';
import { AcademicContextType } from '../../types/academic';

export const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export const useAcademicContext = () => {
  const context = useContext(AcademicContext);
  if (context === undefined) {
    throw new Error('useAcademicContext must be used within an AcademicProvider');
  }
  return context;
};