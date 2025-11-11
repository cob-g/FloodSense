import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

export const useWeeklyReport = (params = {}) => {
  return useQuery({
    queryKey: ['weekly-report', params],
    queryFn: () => analyticsService.getWeeklyReport(params),
  });
};
