import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { connectSocket, disconnectSocket } from '../lib/socket';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Skip if we're already on the login page to prevent redirect loops
    if (window.location.pathname.startsWith('/auth/login')) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getProfile();
      if (response?.success && response.data?.user) {
        setUser(response.data.user);
        connectSocket(response.data.user.id);
      } else {
        // If no valid user data, ensure we're not in a redirect loop
        if (!window.location.pathname.startsWith('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
    } catch (error) {
      console.log('Authentication check failed:', error.message);
      setUser(null);
      if (!window.location.pathname.startsWith('/auth/login')) {
        window.location.href = '/auth/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    if (response.success && response.data?.user) {
      setUser(response.data.user);
      connectSocket(response.data.user.id);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    if (response.success && response.data?.user) {
      setUser(response.data.user);
      connectSocket(response.data.user.id);
    }
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      disconnectSocket();
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
