import { api } from './api';

export const analyticsService = {
  getWeeklyReport: async (params = {}) => {
    const res = await api.get('/admin/weekly-report', { params });
    return res;
  },
  exportWeeklyReport: async (format = 'csv', params = {}) => {
    const res = await api.get('/admin/weekly-report/export', {
      params: { ...params, format },
      responseType: 'blob',
      transformResponse: [(data) => data],
    });
    return res;
  },
};
