import api from '@/lib/api';

const BookingService = {

  // Create booking
  createBooking: async (data) => {
    const res = await api.post('/api/bookings/bookings/', data);
    return res.data;
  },

  // My bookings
  getMyBookings: async () => {
    const res = await api.get('/api/bookings/bookings/my-bookings/');
    return res.data;
  },

  // All bookings (admin)
  getAllBookings: async (params = {}) => {
    const res = await api.get('/api/bookings/bookings/', { params });
    return res.data;
  },

  // Event attendees
  getEventAttendees: async (eventId) => {
    const res = await api.get('/api/bookings/bookings/event-attendees/', {
      params: { event_id: eventId }
    });
    return res.data;
  },

  // Cancel booking
  cancelBooking: async (id, reason = '') => {
    const res = await api.post(`/api/bookings/bookings/${id}/cancel/`, {
      cancellation_reason: reason
    });
    return res.data;
  },
};

export default BookingService;