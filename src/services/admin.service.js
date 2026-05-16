// src/services/admin.service.js
import api from '@/lib/api';

const AdminService = {
  // Stats
  getStats:        () => api.get('/api/users/admin/stats/').then(r => r.data),

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

  // ── Global Modules (Superadmin) ──────────────────────────────
  getModules:    ()        => api.get('/api/configuration/modules/').then(r => r.data),
  getModule:     (id)      => api.get(`/api/configuration/modules/${id}/`).then(r => r.data),
  createModule:  (data)    => api.post('/api/configuration/modules/create/', data).then(r => r.data),
  updateModule:  (id, data)=> api.patch(`/api/configuration/modules/${id}/update/`, data).then(r => r.data),
  deleteModule:  (id)      => api.delete(`/api/configuration/modules/${id}/delete/`).then(r => r.data),

  // ── Organizer Modules (Admin assigns to org) ─────────────────
  getOrgModules:    (orgId)         => api.get('/api/org-configuration/organizer-modules/', { params: { organizer_id: orgId } }).then(r => r.data),
  assignOrgModule:  (data)          => api.post('/api/org-configuration/organizer-modules/create/', data).then(r => r.data),
  toggleOrgModule:  (id, isEnabled) => api.patch(`/api/org-configuration/organizer-modules/${id}/update/`, { is_enabled: isEnabled }).then(r => r.data),
  removeOrgModule:  (id)            => api.delete(`/api/org-configuration/organizer-modules/${id}/delete/`).then(r => r.data),
};

export default AdminService;