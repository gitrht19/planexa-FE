import api from '@/lib/api';

const AuthService = {

  register: async (data) => {
    const res = await api.post('/api/users/register/', data);
    return res.data;
  },

  verifyOtp: async (data) => {
    const res = await api.post('/api/users/register/verify-otp/', data);
    return res.data;
  },

  // ✅ Alert hata, 403 handle karo
  login: async (data) => {
    try {
      const res = await api.post('/api/users/login/', data);
      return { success: true, data: res.data };
    } catch (error) {
      if (error.response?.status === 403) {
        return { success: false, pending: true };
      }
      throw error;
    }
  },

  logout: async () => {
    const res = await api.post('/api/users/logout/');
    return res.data;
  },

  refreshToken: async () => {
    const res = await api.post('/api/users/token/refresh/');
    return res.data;
  },
};

export default AuthService;