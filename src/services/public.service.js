import api from '@/lib/api';

const PublicService = {

  // All events with filters
  getEvents: async (params = {}) => {
    const res = await api.get('/public/events/', { params });
    return res.data;
  },

  // Event detail
  getEvent: async (id) => {
    const res = await api.get(`/public/events/${id}/`);
    return res.data;
  },

  // Organizer profile
  getOrganizer: async (subdomain) => {
    const res = await api.get(`/public/organizer/${subdomain}/`);
    return res.data;
  },

  // Categories
  getCategories: async () => {
    const res = await api.get('/public/categories/');
    return res.data;
  },

  // Category events
  getCategoryEvents: async (id) => {
    const res = await api.get(`/public/categories/${id}/events/`);
    return res.data;
  },
};

export default PublicService;