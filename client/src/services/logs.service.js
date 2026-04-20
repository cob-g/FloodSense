import { api } from './api';

export const logsService = {
  getActivityLogs: async (params = {}) => {
    return api.get('/admin/activity-logs', { params });
  },
};

export default logsService;
