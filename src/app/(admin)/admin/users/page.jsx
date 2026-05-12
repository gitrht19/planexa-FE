'use client';
import { useEffect, useState } from 'react';
import AdminService from '@/services/admin.service';
import toast from 'react-hot-toast';
import { 
  CheckCircle, XCircle, PauseCircle, PlayCircle, 
  UserPlus, Search, Filter, Users, Shield, Calendar,
  Mail, Phone, UserCheck, UserX, RefreshCw, Download,
  TrendingUp, Clock, AlertCircle
} from 'lucide-react';

export default function AllUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchUsers = () => {
    setLoading(true);
    AdminService.getAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAction = async (action, id, label) => {
    setActionId(id);
    try {
      await action(id);
      toast.success(`${label} successful!`);
      fetchUsers();
    } catch (error) {
      toast.error(`Error: ${label} failed.`);
    } finally {
      setActionId(null);
    }
  };

  const getStatusBadge = (user) => {
    if (user.is_deleted) {
      return {
        label: 'Rejected',
        icon: XCircle,
        color: 'bg-red-100 text-red-700 border-red-200',
        iconColor: 'text-red-500'
      };
    }
    if (user.is_approved && user.is_active) {
      return {
        label: 'Active',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-700 border-green-200',
        iconColor: 'text-green-500'
      };
    }
    if (user.is_approved && !user.is_active) {
      return {
        label: 'Suspended',
        icon: PauseCircle,
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        iconColor: 'text-orange-500'
      };
    }
    return {
      label: 'Pending',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      iconColor: 'text-yellow-500'
    };
  };

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile_number?.includes(searchTerm);
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && user.is_approved && user.is_active && !user.is_deleted;
    if (statusFilter === 'pending') return matchesSearch && !user.is_approved && !user.is_deleted;
    if (statusFilter === 'suspended') return matchesSearch && user.is_approved && !user.is_active && !user.is_deleted;
    if (statusFilter === 'rejected') return matchesSearch && user.is_deleted;
    
    return matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_approved && u.is_active && !u.is_deleted).length,
    pending: users.filter(u => !u?.is_approved && !u.is_deleted).length,
    suspended: users.filter(u => u.is_approved && !u.is_active && !u.is_deleted).length,
    rejected: users.filter(u => u.is_deleted).length,
    verified: users.filter(u => u.is_verified).length
  };

  return (
    <div className="space-y-6">
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
        
        <div className="relative p-6">
          {/* Header Top Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} className="text-rose-400" />
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">User Management</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">All Users</h2>
              <p className="text-gray-300 text-sm mt-1">
                Manage and monitor all registered users on your platform
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={fetchUsers}
                className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button className="bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2 rounded-xl text-sm font-medium text-white hover:from-rose-600 hover:to-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-500/25">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-blue-400" />
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total</p>
              </div>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={14} className="text-green-400" />
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Active</p>
              </div>
              <p className="text-xl font-bold text-green-400">{stats.active}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-yellow-400" />
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Pending</p>
              </div>
              <p className="text-xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <PauseCircle size={14} className="text-orange-400" />
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Suspended</p>
              </div>
              <p className="text-xl font-bold text-orange-400">{stats.suspended}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={14} className="text-red-400" />
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Rejected</p>
              </div>
              <p className="text-xl font-bold text-red-400">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username, email or mobile number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                statusFilter === 'active'
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('suspended')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                statusFilter === 'suspended'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Suspended
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                statusFilter === 'rejected'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="inline-block">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-rose-500 rounded-full animate-spin" />
              <Users size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500" />
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Users size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No users found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Verified</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registered</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => {
                  const status = getStatusBadge(user);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gradient-to-r hover:from-rose-50/50 hover:to-transparent transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-semibold shadow-md">
                            {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.username || 'No Username'}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Mail size={10} className="text-gray-400" />
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.mobile_number ? (
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Phone size={14} className="text-gray-400" />
                            <span>{user.mobile_number}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                          <StatusIcon size={12} className={status.iconColor} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_verified ? (
                          <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-medium">
                            <CheckCircle size={14} />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-red-400 text-sm">
                            <XCircle size={14} />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                          <Calendar size={14} className="text-gray-400" />
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {/* Pending User Actions */}
                          {!user.is_approved && !user.is_deleted && (
                            <>
                              <button
                                disabled={actionId === user.id}
                                onClick={() => handleAction(AdminService.approveUser, user.id, 'Approval')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-xs font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
                              >
                                <UserCheck size={13} />
                                {actionId === user.id ? '...' : 'Approve'}
                              </button>
                              <button
                                disabled={actionId === user.id}
                                onClick={() => handleAction(AdminService.rejectUser, user.id, 'Rejection')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg text-xs font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50"
                              >
                                <UserX size={13} />
                                {actionId === user.id ? '...' : 'Reject'}
                              </button>
                            </>
                          )}

                          {/* Active User Actions */}
                          {user.is_approved && user.is_active && !user.is_deleted && (
                            <button
                              disabled={actionId === user.id}
                              onClick={() => handleAction(AdminService.suspendUser, user.id, 'Suspend')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg text-xs font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50"
                            >
                              <PauseCircle size={13} />
                              {actionId === user.id ? '...' : 'Suspend'}
                            </button>
                          )}

                          {/* Suspended User Actions */}
                          {user.is_approved && !user.is_active && !user.is_deleted && (
                            <button
                              disabled={actionId === user.id}
                              onClick={() => handleAction(AdminService.reactivateUser, user.id, 'Reactivate')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-xs font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
                            >
                              <PlayCircle size={13} />
                              {actionId === user.id ? '...' : 'Activate'}
                            </button>
                          )}

                          {/* Rejected User Status */}
                          {user.is_deleted && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs">
                              <XCircle size={13} />
                              Rejected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1">
                Previous
              </button>
              <button className="px-3 py-1.5 text-xs bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all shadow-sm">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}