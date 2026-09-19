import api from './api';

export const authService = {
  login: async (email, password, remember_me = false) => {
    const response = await api.post('/v1/auth/login/', {
      email,
      password,
      remember_me,
    });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/v1/auth/logout/');
    } catch (e) {
      console.warn('Logout API error, clearing client credentials anyway', e);
    }
  },

  refreshToken: async (refresh_token) => {
    const response = await api.post('/v1/auth/refresh/', { refresh_token });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/v1/users/profile/');
    return response.data;
  },

  sendOtp: async (email) => {
    const response = await api.post('/v1/auth/send-otp/', { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post('/v1/auth/verify-otp/', { email, otp });
    return response.data;
  },

  resetPassword: async (email, otp, new_password) => {
    const response = await api.post('/v1/auth/reset-password/', {
      email,
      otp,
      new_password,
    });
    return response.data;
  },

  setPassword: async (current_password, new_password) => {
    const response = await api.post('/v1/auth/set-password/', {
      current_password,
      new_password,
    });
    return response.data;
  },
};

export default authService;
