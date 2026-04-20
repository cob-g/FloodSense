import { useQuery } from '@tanstack/react-query';
import { logsService } from '../services/logs.service';

export const useActivityLogs = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['admin-logs', filters],
    queryFn: () => logsService.getActivityLogs(filters),
    ...options,
  });
};

export default useActivityLogs;
