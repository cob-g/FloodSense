import { api } from './api';

export const sensorsService = {
  getReadings: async (params = {}) => {
    const res = await api.get('/sensor-data', { params });
    // res: { success, count, data }
    return res;
  },
  getLatest: async () => {
    const res = await api.get('/sensor-data/latest');
    return res;
  },
  listSensors: async (params = {}) => {
    const res = await api.get('/sensors', { params });
    return res;
  },
  listSensorsWithStatus: async (params = {}) => {
    const res = await api.get('/sensors/with-status', { params });
    return res;
  },
  createSensor: async (payload) => {
    const res = await api.post('/sensors', payload);
    return res;
  },
  updateSensor: async ({ id, payload }) => {
    const res = await api.put(`/sensors/${id}`, payload);
    return res;
  },
  deleteSensor: async (id) => {
    const res = await api.delete(`/sensors/${id}`);
    return res;
  },
  restoreSensor: async (id) => {
    const res = await api.patch(`/sensors/${id}/restore`);
    return res;
  },
};
