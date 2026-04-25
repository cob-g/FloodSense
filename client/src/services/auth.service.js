import api, { setStoredAuthToken, clearStoredAuthToken } from './api';

export const authService = {
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response?.success && response?.data?.token) {
      setStoredAuthToken(response.data.token);
    }
    return response;
  },
  
  logout: async () => {
    try {
      return await api.post('/auth/logout');
    } finally {
      clearStoredAuthToken();
    }
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
