import api from './api';

export const fallbacksService = {
  getFallbacks: async (params = {}) => {
    return api.get('/fallbacks', { params });
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
  
  updatePriority: async (id, priority) => {
    return api.patch(`/fallbacks/${id}/priority`, { priority });
  },
  
  getEvacuationCenters: async (barangay = null) => {
    const params = barangay ? { barangay } : {};
    return api.get('/fallbacks/category/evacuation-centers', { params });
  },
  
  getEmergencyFacilities: async (barangay = null) => {
    const params = barangay ? { barangay } : {};
    return api.get('/fallbacks/category/emergency-facilities', { params });
  },
  
  getFallbacksByBarangay: async (barangay, category = null) => {
    const params = category ? { category } : {};
    return api.get(`/fallbacks/barangay/${barangay}`, { params });
  },
};

export default fallbacksService;
