import api from './api';

export const fallbacksService = {
  getFallbacks: async (params = {}) => {
    return api.get('/fallbacks', { params });
  },

  getArchivedFallbacks: async (params = {}) => {
    return api.get('/fallbacks', { params: { ...params, archived: true } });
  },
  
  getFallback: async (id) => {
    return api.get(`/fallbacks/${id}`);
  },
  
  createFallback: async (data) => {
    return api.post('/fallbacks', data);
  },
  
  updateFallback: async (id, data) => {
    return api.patch(`/fallbacks/${id}`, data);
  },
  
  deleteFallback: async (id) => {
    return api.delete(`/fallbacks/${id}`);
  },

  restoreFallback: async (id) => {
    return api.patch(`/fallbacks/${id}/restore`);
  },
  
  updatePriority: async (id, priority) => {
    return api.patch(`/fallbacks/${id}/priority`, { priority });
  },

  getHistoricalFloodSpots: async (barangay = null) => {
    const params = barangay ? { barangay } : {};
    return api.get('/fallbacks/category/historical-flood-spots', { params });
  },

  getFallbacksByBarangay: async (barangay) => {
    return api.get(`/fallbacks/barangay/${barangay}`);
  },
};

export default fallbacksService;
