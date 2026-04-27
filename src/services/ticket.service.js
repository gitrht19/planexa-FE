import api from '@/lib/api';

const TicketService = {

  // List tickets
  getTickets: async (params = {}) => {
    const res = await api.get('/api/tickets/tickets/', { params });
    return res.data;
  },

  // Tickets by event
  getTicketsByEvent: async (eventId) => {
    const res = await api.get('/api/tickets/tickets/', {
      params: { event_id: eventId }
    });
    return res.data;
  },

  // Create ticket
  createTicket: async (data) => {
    const res = await api.post('/api/tickets/tickets/', data);
    return res.data;
  },

  // Update ticket
  updateTicket: async (id, data) => {
    const res = await api.patch(`/api/tickets/tickets/${id}/`, data);
    return res.data;
  },

  // Change status
  changeStatus: async (id, ticket_status) => {
    const res = await api.patch(`/api/tickets/tickets/${id}/change-status/`, { ticket_status });
    return res.data;
  },

  // Delete ticket
  deleteTicket: async (id) => {
    const res = await api.delete(`/api/tickets/tickets/${id}/`);
    return res.data;
  },
};

export default TicketService;