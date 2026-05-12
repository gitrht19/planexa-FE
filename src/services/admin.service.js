import api from '@/lib/api';

const AdminService = {
  // Stats
  getStats:       () => api.get('/api/users/admin/stats/').then(r => r.data),

  // Users
  getPendingUsers: () => api.get('/api/users/admin/pending-users/').then(r => r.data),
  getAllUsers:      () => api.get('/api/users/admin/all-users/').then(r => r.data),

  // Organizers
  getOrganizers:   () => api.get('/api/users/admin/organizers/').then(r => r.data),

  // Admin Actions
  approveUser:    (id) => api.post(`/api/users/admin/approve-user/${id}/`).then(r => r.data),
  rejectUser:     (id) => api.delete(`/api/users/admin/reject-user/${id}/`).then(r => r.data),
  suspendUser:    (id) => api.post(`/api/users/admin/suspend-user/${id}/`).then(r => r.data),
  reactivateUser: (id) => api.post(`/api/users/admin/reactivate-user/${id}/`).then(r => r.data),
};

export default AdminService;