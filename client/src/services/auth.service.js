import api from './api';

export const authService = {
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },
  
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },
  
  logout: async () => {
    return api.post('/auth/logout');
  },
  
  getProfile: async () => {
    return api.get('/auth/me');
  },
  
  updateProfile: async (userData) => {
    return api.patch('/auth/me', userData);
  },
  
  changePassword: async (passwords) => {
    return api.patch('/auth/change-password', passwords);
  },

  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    return api.post('/auth/reset-password', { token, newPassword });
  },
};

export default authService;
