import api from '@/lib/api';

const BookingService = {

  // ── User — apni bookings ──────────────────────────────

  getMyBookings: async () => {
    const res = await api.get('/api/bookings/bookings/my-bookings/');
    return res.data;
  },

  createBooking: async (data) => {
    const res = await api.post('/api/bookings/bookings/', data);
    return res.data;
  },

  getBookingById: async (id) => {
    const res = await api.get(`/api/bookings/bookings/${id}/`);
    return res.data;
  },

  cancelBooking: async (id, reason = '') => {
    const res = await api.post(`/api/bookings/bookings/${id}/cancel/`, {
      cancellation_reason: reason,
    });
    return res.data;
  },

  // ── Organizer — apne events ke bookings ──────────────

  getOrganizerBookings: async (params = {}) => {
    const res = await api.get('/api/bookings/bookings/organizer-bookings/', { params });
    return res.data;
  },

  getOrganizerBookingStats: async () => {
    const res = await api.get('/api/bookings/bookings/organizer-stats/');
    return res.data;
  },

  // Organizer — event ke attendees
  getEventAttendees: async (eventId) => {
    const res = await api.get('/api/bookings/bookings/event-attendees/', {
      params: { event_id: eventId },
    });
    return res.data;
  },
};

export default BookingService;