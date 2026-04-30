import api from '@/lib/api';

const AdminService = {
  getStats: () => api.get('/api/users/admin/stats/').then(r => r.data),
  getPendingUsers: () => api.get('/api/users/admin/pending-users/').then(r => r.data),
  getAllUsers: () => api.get('/api/users/admin/all-users/').then(r => r.data),
  getOrganizers: () => api.get('/api/users/admin/organizers/').then(r => r.data),
  approveUser: (id) => api.post(`/api/users/admin/approve-user/${id}/`).then(r => r.data),
  rejectUser: (id) => api.delete(`/api/users/admin/reject-user/${id}/`).then(r => r.data),
};

export default AdminService;