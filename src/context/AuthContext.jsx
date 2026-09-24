import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage or fetch profile
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (e) {
          console.error('Failed to parse stored user profile', e);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, remember_me = false) => {
    try {
      const res = await authService.login(email, password, remember_me);
      // Handles both { data: { session, profile } } and direct structure
      const data = res.data || res;
      const session = data.session || {};
      const profile = data.profile || data.user || { email };

      const accessToken = session.access_token || data.access_token || data.access;
      const refreshToken = session.refresh_token || data.refresh_token || data.refresh;

      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        setToken(accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(profile));
      setUser(profile);

      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      const isNetworkError = !error.response;
      const detail = isNetworkError
        ? 'Cannot connect to backend server. Please check your network connection.'
        : error.response?.data?.message ||
          error.response?.data?.detail ||
          error.response?.data?.data?.non_field_errors?.[0] ||
          'Invalid email or password. Please try again.';
      return { success: false, message: detail };
    }
  };

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  }, []);

  const updateUserProfile = (newProfile) => {
    setUser(newProfile);
    localStorage.setItem('user', JSON.stringify(newProfile));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
