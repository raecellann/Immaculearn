import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import { useAdmin } from "../contexts/admin/useAdmin";

export const useAcademicMutations = () => {
  const { isAuthenticated } = useAdmin();
  const queryClient = useQueryClient();

  // ------------------- Create Academic Term -------------------
  const createAcademic = useMutation({
    mutationFn: (payload: {
      academic_period: string;
      academic_semester: number;
      academic_year: string;
    }) =>
      adminService.createAcademic(
        payload.academic_period,
        payload.academic_semester,
        payload.academic_year
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["academicTerms"] }),
  });

  // ------------------- Update Academic Term -------------------
  const updateAcademic = useMutation({
    mutationFn: (payload: {
      academic_id: number;
      academic_period?: string;
      academic_semester?: number;
      academic_year?: string;
      academic_status?: string;
    }) =>
      adminService.updateAcademic(
        payload.academic_id,
        payload.academic_period,
        payload.academic_semester,
        payload.academic_year,
        payload.academic_status
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["academicTerms"] }),
  });

  // ------------------- Fetch Academic Terms -------------------
  const {
    data: academicTerms = [],
    isLoading: academicTermsLoading,
    refetch,
  } = useQuery({
    queryKey: ["academicTerms"],
    queryFn: async () => {
      const res = await adminService.getAllAcademicTerms?.(); // Make sure this exists
      return res?.data || [];
    },
    enabled: !!isAuthenticated,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    createAcademic,
    updateAcademic,
    academicTerms,
    academicTermsLoading,
    refetchAcademicTerms: refetch,
  };
};