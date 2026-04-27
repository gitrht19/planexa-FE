import api from '@/lib/api';

const EventService = {

  // List events (organizer)
  getEvents: async (params = {}) => {
    const res = await api.get('/api/events/events/', { params });
    return res.data;
  },

  // Event detail
  getEvent: async (id) => {
    const res = await api.get(`/api/events/events/${id}/`);
    return res.data;
  },

  // Create event
  createEvent: async (data) => {
    const res = await api.post('/api/events/events/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }, // banner image ke liye
    });
    return res.data;
  },

  // Update event
  updateEvent: async (id, data) => {
    const res = await api.patch(`/api/events/events/${id}/`, data);
    return res.data;
  },

  // Delete event
  deleteEvent: async (id) => {
    const res = await api.delete(`/api/events/events/${id}/`);
    return res.data;
  },

  // Change status
  changeStatus: async (id, status) => {
    const res = await api.patch(`/api/events/events/${id}/change-status/`, { status });
    return res.data;
  },

  // Categories
  getCategories: async () => {
    const res = await api.get('/api/events/categories/');
    return res.data;
  },
};

export default EventService;