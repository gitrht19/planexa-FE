// src/services/organizer.service.js
import api from '@/lib/api';

const OrganizerService = {
  // Apna profile get karo
  getProfile: async () => {
    const res = await api.get('/org/profile/');
    return res.data?.data || res.data;
  },

  // Profile update karo
  updateProfile: async (formData) => {
    const res = await api.patch('/org/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },

  // Dashboard stats
  getStats: async () => {
    const res = await api.get('/org/stats/');
    return res.data?.data || res.data;
  },

  // Public organizer page
  getPublicProfile: async (subdomain) => {
    const res = await api.get(`/org/${subdomain}/`);
    return res.data?.data || res.data;
  },

  // ── Sidebar Modules (org ke liye assigned modules) ───────────
  getSidebarModules: async () => {
    const res = await api.get('/api/organizer-modules/');
    return res.data?.data || res.data;
  },
};

export default OrganizerService;