import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any custom headers here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Backend returns { success, message, data }
    // Return the whole response for flexibility
    return response.data;
  },
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/');
    const isLoginPage = window.location.pathname.includes('/auth/login');
    
    // Only handle 401 for non-auth requests or when not on login page
    if (error.response?.status === 401 && !isAuthRequest && !isLoginPage) {
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.startsWith('/auth/login')) {
        window.location.href = '/auth/login';
      }
    }
    
    // Return error in consistent format
    const errorData = error.response?.data || { message: error.message };
    return Promise.reject(errorData);
  }
);

export default api;
