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
  getModules:    ()         => api.get('/api/configuration/modules/').then(r => r.data),
  getModule:     (id)       => api.get(`/api/configuration/modules/${id}/`).then(r => r.data),
  createModule:  (data)     => api.post('/api/configuration/modules/create/', data).then(r => r.data),
  updateModule:  (id, data) => api.patch(`/api/configuration/modules/${id}/update/`, data).then(r => r.data),
  deleteModule:  (id)       => api.delete(`/api/configuration/modules/${id}/delete/`).then(r => r.data),

  // ── Organizer Modules (Admin assigns to org) ─────────────────
  getOrgModules:   (orgId)          => api.get('/api/org-configuration/organizer-modules/', { params: { organizer_id: orgId } }).then(r => r.data),
  assignOrgModule: (data)           => api.post('/api/org-configuration/organizer-modules/create/', data).then(r => r.data),
  toggleOrgModule: (id, isEnabled)  => api.patch(`/api/org-configuration/organizer-modules/${id}/update/`, { is_enabled: isEnabled }).then(r => r.data),
  removeOrgModule: (id)             => api.delete(`/api/org-configuration/organizer-modules/${id}/delete/`).then(r => r.data),

  // ── Plans (Superadmin) ────────────────────────────────────────
  getPlans:      ()         => api.get('/api/subscriptions/plans/').then(r => r.data),
  getPlan:       (id)       => api.get(`/api/subscriptions/plans/${id}/`).then(r => r.data),
  createPlan:    (data)     => api.post('/api/subscriptions/plans/create/', data).then(r => r.data),
  updatePlan:    (id, data) => api.patch(`/api/subscriptions/plans/${id}/update/`, data).then(r => r.data),
  deletePlan:    (id)       => api.delete(`/api/subscriptions/plans/${id}/delete/`).then(r => r.data),

  // ── Organizer Subscriptions (Admin assigns to org) ────────────
  getAllSubscriptions:  ()            => api.get('/api/subscriptions/').then(r => r.data),
  getOrgSubscription:  (orgId)       => api.get(`/api/subscriptions/organizer/${orgId}/`).then(r => r.data),
  assignSubscription:  (data)        => api.post('/api/subscriptions/create/', data).then(r => r.data),
  updateSubscription:  (id, data)    => api.patch(`/api/subscriptions/${id}/update/`, data).then(r => r.data),
  cancelSubscription:  (id, reason)  => api.post(`/api/subscriptions/${id}/cancel/`, { reason }).then(r => r.data),
  getSubHistory:       (orgId)       => api.get(`/api/subscriptions/history/${orgId}/`).then(r => r.data),
};

export default AdminService;