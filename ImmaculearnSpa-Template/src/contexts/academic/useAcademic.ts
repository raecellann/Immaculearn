import { useAcademicContext } from './academicContext';
import { AcademicContextType } from '../../types/academic';

export const useAcademic = (): AcademicContextType => {
  return useAcademicContext();
};

export default useAcademic;