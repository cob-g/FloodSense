import api from './api';

export const reportsService = {
  getReports: async (params = {}) => {
    return api.get('/reports', { params });
  },
  
  getReport: async (id) => {
    return api.get(`/reports/${id}`);
  },
  
  createReport: async (formData) => {
    return api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  updateReport: async (id, data) => {
    return api.patch(`/reports/${id}`, data);
  },
  
  deleteReport: async (id) => {
    return api.delete(`/reports/${id}`);
  },
  
  validateReport: async (id, notes) => {
    return api.patch(`/reports/${id}/validate`, { notes });
  },
  
  rejectReport: async (id, notes) => {
    return api.patch(`/reports/${id}/reject`, { notes });
  },
  
  getReportsByBarangay: async (barangay, params = {}) => {
    return api.get(`/reports/barangay/${barangay}`, { params });
  },

  exportReports: async (format = 'csv') => {
    return api.get('/reports/export', {
      params: { format },
      responseType: 'blob',
      transformResponse: [(data) => data],
    });
  },
};

export default reportsService;
