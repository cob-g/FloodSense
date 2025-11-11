import { api } from './api';

export const usersService = {
  list: async (params = {}) => {
    return api.get('/admin/users', { params });
  },
  updateStatus: async (id, isActive) => {
    return api.patch(`/admin/users/${id}/status`, { isActive });
  },
  updateRole: async (id, role) => {
    return api.patch(`/admin/users/${id}/role`, { role });
  },
};

export default usersService;
