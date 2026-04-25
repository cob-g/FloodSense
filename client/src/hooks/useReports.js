import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';

export const useReports = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => reportsService.getReports(filters),
    ...options,
  });
};

export const useArchivedReports = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['reports', 'archived', filters],
    queryFn: () => reportsService.getArchivedReports(filters),
    ...options,
  });
};

export const useInfiniteReports = (filters = {}, pageSize = 10) => {
  return useInfiniteQuery({
    queryKey: ['reports', 'infinite', filters, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      reportsService.getReports({ ...filters, limit: pageSize, skip: pageParam }),
    getNextPageParam: (lastPage) => {
      const pg = lastPage?.data?.pagination;
      if (!pg) return undefined;
      return pg.hasMore ? pg.skip + pg.limit : undefined;
    },
    initialPageParam: 0,
  });
};

export const useReport = (id) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsService.getReport(id),
    enabled: !!id,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: reportsService.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
    },
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => reportsService.updateReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: reportsService.deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
    },
  });
};

export const useRestoreReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportsService.restoreReport,
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
    },
  });
};

export const usePermanentDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportsService.permanentlyDeleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
    },
  });
};

export const useValidateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }) => reportsService.validateReport(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
    },
  });
};

export const useRejectReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }) => reportsService.rejectReport(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
    },
  });
};

export const useReportsByBarangay = (barangay, params = {}) => {
  return useQuery({
    queryKey: ['reports', 'barangay', barangay, params],
    queryFn: () => reportsService.getReportsByBarangay(barangay, params),
    enabled: !!barangay,
  });
};
