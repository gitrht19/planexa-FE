'use client';
import { useEffect, useState } from 'react';
import AdminService from '@/services/admin.service';
import toast from 'react-hot-toast';
import {
  Building2, Search, Mail, Phone, Globe,
  CheckCircle, XCircle, PauseCircle, RefreshCw,
  Eye, Calendar, Shield, ExternalLink, Edit,
  MapPin, Users, CalendarDays, Award, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { Crown } from 'lucide-react';

export default function OrganizersPage() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState(null);

  const fetchOrganizers = () => {
    setLoading(true);
    AdminService.getOrganizers()
      .then(setOrganizers)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrganizers(); }, []);

  const handleUpdateOrganizer = async (id, updates) => {
    try {
      // Call your update API here
      // await AdminService.updateOrganizer(id, updates);
      toast.success('Organizer updated successfully!');
      fetchOrganizers();
      setEditingOrganizer(null);
    } catch (error) {
      toast.error('Error updating organizer');
    }
  };

  const getStatusBadge = (org) => {
    if (org.is_active === false) {
      return {
        label: 'Inactive',
        icon: PauseCircle,
        color: 'bg-orange-100 text-orange-700 border-orange-200'
      };
    }
    return {
      label: 'Active',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700 border-green-200'
    };
  };

  const filteredOrganizers = organizers.filter(org => {
    const matchesSearch =
      org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.customuser__email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.org_number?.includes(searchTerm) ||
      org.subdomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.domain?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const stats = {
    total: organizers.length,
    active: organizers.filter(o => o.is_active === true).length,
    inactive: organizers.filter(o => o.is_active === false).length,
    withDomain: organizers.filter(o => o.domain).length
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-900 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />

        <div className="relative p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={18} className="text-pink-300" />
                <span className="text-xs font-semibold text-pink-300 uppercase tracking-wider">Organizer Directory</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">Organizers</h2>
              <p className="text-purple-100 text-sm mt-1">
                View and manage all registered event organizers
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchOrganizers}
                className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/20">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Building2 size={14} className="text-pink-300" />
                <p className="text-[10px] text-purple-200 uppercase tracking-wider">Total Organizers</p>
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={14} className="text-green-300" />
                <p className="text-[10px] text-purple-200 uppercase tracking-wider">Active</p>
              </div>
              <p className="text-2xl font-bold text-green-300">{stats.active}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <PauseCircle size={14} className="text-orange-300" />
                <p className="text-[10px] text-purple-200 uppercase tracking-wider">Inactive</p>
              </div>
              <p className="text-2xl font-bold text-orange-300">{stats.inactive}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={14} className="text-blue-300" />
                <p className="text-[10px] text-purple-200 uppercase tracking-wider">Custom Domain</p>
              </div>
              <p className="text-2xl font-bold text-blue-300">{stats.withDomain}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, org number, subdomain or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Organizers Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="inline-block">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin" />
              <Building2 size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500" />
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4">Loading organizers...</p>
        </div>
      ) : filteredOrganizers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
            <Building2 size={40} className="text-purple-400" />
          </div>
          <p className="text-gray-700 font-medium text-lg">No organizers found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOrganizers.map(org => {
            const status = getStatusBadge(org);
            const StatusIcon = status.icon;

            return (
              <div key={org.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group overflow-hidden">
                {/* Status Bar */}
                <div className={`h-1 w-full ${status.label === 'Active' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-orange-500 to-red-500'
                  }`} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{org.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">{org.customuser__email || 'No email'}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${status.color}`}>
                      <StatusIcon size={10} />
                      {status.label}
                    </span>
                  </div>

                  {/* Key Information */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                      <span className="text-gray-500">Org Number:</span>
                      <span className="font-mono text-purple-600 font-semibold">{org.org_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                      <span className="text-gray-500">Subdomain:</span>
                      <span className="text-gray-700">{org.subdomain || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5">
                      <span className="text-gray-500">Domain:</span>
                      {org.domain ? (
                        <a href={`https://${org.domain}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm">
                          {org.domain}
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-gray-400">Not configured</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { setSelectedOrganizer(org); setShowDetailsModal(true); }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
                      <Eye size={16} />
                      View Details
                    </button>

                    {/* ✅ NEW — Modules button */}
                    <Link
                      href={`/admin/organizers/${org.id}/modules`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-all"
                    >
                      <LayoutGrid size={16} />
                      Modules
                    </Link>

                    <Link href={`/admin/organizers/${org.id}/subscription`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-100 transition-all">
                      <Crown size={16} />
                      Plan
                    </Link>

                    <button onClick={() => setEditingOrganizer(org)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedOrganizer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 size={28} />
                  <div>
                    <h3 className="text-xl font-bold">{selectedOrganizer.name}</h3>
                    <p className="text-purple-200 text-sm">Organizer Complete Profile</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-white/70 hover:text-white transition">
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield size={16} className="text-purple-500" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Organization Name</label>
                    <p className="text-gray-900 font-medium mt-1">{selectedOrganizer.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Org Number</label>
                    <p className="font-mono text-purple-600 font-bold mt-1">{selectedOrganizer.org_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Email Address</label>
                    <p className="text-gray-900 mt-1">{selectedOrganizer.customuser__email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Mobile Number</label>
                    <p className="text-gray-900 mt-1">{selectedOrganizer.customuser__mobile_number || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Domain & Subdomain */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe size={16} className="text-purple-500" />
                  Domain Configuration
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Subdomain</label>
                    <p className="text-gray-900 font-mono mt-1">{selectedOrganizer.subdomain || 'N/A'}</p>
                    {selectedOrganizer.subdomain && (
                      <p className="text-xs text-gray-400 mt-1">
                        URL: {selectedOrganizer.subdomain}.yourdomain.com
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Custom Domain</label>
                    {selectedOrganizer.domain ? (
                      <a href={`https://${selectedOrganizer.domain}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 flex items-center gap-1 mt-1">
                        {selectedOrganizer.domain}
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <p className="text-gray-400 mt-1">Not configured</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Activity size={16} className="text-purple-500" />
                  Account Status
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusBadge(selectedOrganizer).color}`}>
                        {selectedOrganizer.is_active ? <CheckCircle size={12} /> : <PauseCircle size={12} />}
                        {selectedOrganizer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Joined On</label>
                    <p className="text-gray-900 mt-1">
                      {selectedOrganizer.created_at ? new Date(selectedOrganizer.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setEditingOrganizer(selectedOrganizer);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition"
                >
                  Edit Organizer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Organizer Modal */}
      {editingOrganizer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingOrganizer(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit size={24} />
                  <div>
                    <h3 className="text-xl font-bold">Edit Organizer</h3>
                    <p className="text-purple-200 text-sm">Update organizer information</p>
                  </div>
                </div>
                <button onClick={() => setEditingOrganizer(null)} className="text-white/70 hover:text-white">
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updates = {
                name: formData.get('name'),
                subdomain: formData.get('subdomain'),
                domain: formData.get('domain'),
                mobile_number: formData.get('mobile_number'),
                is_active: formData.get('is_active') === 'true'
              };
              handleUpdateOrganizer(editingOrganizer.id, updates);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingOrganizer.name}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                <input
                  type="text"
                  name="subdomain"
                  defaultValue={editingOrganizer.subdomain}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., companyname"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Domain</label>
                <input
                  type="text"
                  name="domain"
                  defaultValue={editingOrganizer.domain}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  name="mobile_number"
                  defaultValue={editingOrganizer.customuser__mobile_number}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="is_active"
                  defaultValue={editingOrganizer.is_active}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingOrganizer(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}