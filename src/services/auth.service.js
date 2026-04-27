import api from '@/lib/api';

const AuthService = {

  // Register
  register: async (data) => {
    const res = await api.post('/api/users/register/', data);
    return res.data;
  },

  // Verify OTP
  verifyOtp: async (data) => {
    const res = await api.post('/api/users/register/verify-otp/', data);
    return res.data;
  },

  // Login
login: async (data) => {
  const res = await api.post('/api/users/login/', data);
  alert(JSON.stringify(res.data));  // ✅ Alert band nahi hoga redirect se
  return res.data;
},


  // Logout
  logout: async () => {
    const res = await api.post('/api/users/logout/');
    return res.data;
  },

  // Token refresh
  refreshToken: async () => {
    const res = await api.post('/api/users/token/refresh/');
    return res.data;
  },
};

export default AuthService;