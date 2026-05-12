'use client';
import { useEffect, useState } from 'react';
import AdminService from '@/services/admin.service';
import toast from 'react-hot-toast';
import { 
  CheckCircle, XCircle, Clock, UserCheck, UserX, 
  Search, Users, Shield, Mail, Phone, Calendar,
  RefreshCw, AlertCircle, Hourglass, TrendingUp,
  Sparkles, Eye, MessageCircle
} from 'lucide-react';
import Link from 'next/link';

export default function PendingUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPendingUsers = () => {
    setLoading(true);
    AdminService.getPendingUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPendingUsers(); }, []);

  const handleAction = async (action, id, label) => {
    setActionId(id);
    try {
      await action(id);
      toast.success(`${label} successful!`);
      fetchPendingUsers();
    } catch {
      toast.error(`Error: ${label} failed.`);
    } finally {
      setActionId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile_number?.includes(searchTerm)
  );

  const stats = {
    total: users.length,
    highPriority: users.filter(u => {
      const daysOld = u.created_at ? (new Date() - new Date(u.created_at)) / (1000 * 60 * 60 * 24) : 0;
      return daysOld > 7;
    }).length,
    newRequests: users.filter(u => {
      const daysOld = u.created_at ? (new Date() - new Date(u.created_at)) / (1000 * 60 * 60 * 24) : 0;
      return daysOld <= 2;
    }).length,
    verified: users.filter(u => u.is_verified).length
  };

  const getDaysPending = (createdAt) => {
    if (!createdAt) return 'Recently';
    const days = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getPriorityBadge = (createdAt) => {
    if (!createdAt) return null;
    const days = (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
    if (days > 7) {
      return { label: 'High Priority', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle };
    }
    if (days > 3) {
      return { label: 'Medium Priority', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock };
    }
    return { label: 'New', color: 'bg-green-100 text-green-700 border-green-200', icon: Sparkles };
  };

  return (
    <div className="space-y-6">
      {/* Animated Header with Pending Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-400 rounded-full blur-3xl opacity-30 animate-pulse delay-1000" />
        
        {/* Animated Clock Icon */}
        <div className="absolute top-4 right-4 opacity-10">
          <Clock size={120} className="text-white animate-spin-slow" />
        </div>
        
        <div className="relative p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hourglass size={18} className="text-yellow-300" />
                <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">Pending Approvals</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">Approval Queue</h2>
              <p className="text-orange-100 text-sm mt-1">
                Review and manage user registration requests
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={fetchPendingUsers}
                className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <Link href="/admin/users" className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/30 transition-all flex items-center gap-2">
                <Users size={16} />
                View All Users
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/20">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-yellow-300" />
                <p className="text-[10px] text-yellow-200 uppercase tracking-wider">Pending Requests</p>
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-[10px] text-white/70 mt-1">Awaiting review</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={14} className="text-red-300" />
                <p className="text-[10px] text-yellow-200 uppercase tracking-wider">High Priority</p>
              </div>
              <p className="text-2xl font-bold text-red-300">{stats.highPriority}</p>
              <p className="text-[10px] text-white/70 mt-1">Waiting &gt;7 days</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-green-300" />
                <p className="text-[10px] text-yellow-200 uppercase tracking-wider">New Requests</p>
              </div>
              <p className="text-2xl font-bold text-green-300">{stats.newRequests}</p>
              <p className="text-[10px] text-white/70 mt-1">Last 48 hours</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-blue-300" />
                <p className="text-[10px] text-yellow-200 uppercase tracking-wider">Verified</p>
              </div>
              <p className="text-2xl font-bold text-blue-300">{stats.verified}</p>
              <p className="text-[10px] text-white/70 mt-1">Email verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Info Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search pending users by name, email or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <div className="bg-orange-50 px-4 py-2 rounded-xl flex items-center gap-2">
              <MessageCircle size={14} className="text-orange-500" />
              <span className="text-xs text-orange-700 font-medium">
                {stats.total} user{stats.total !== 1 ? 's' : ''} waiting for approval
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Users Cards View (More Modern than Table) */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="inline-block">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
              <Clock size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" />
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4">Loading pending requests...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <p className="text-gray-700 font-medium text-lg">All caught up! ✨</p>
          <p className="text-gray-400 text-sm mt-1">No pending users waiting for approval</p>
          <Link href="/admin/users" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm hover:bg-orange-600 transition">
            <Users size={14} />
            View all users
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredUsers.map(user => {
            const priority = getPriorityBadge(user.created_at);
            const PriorityIcon = priority?.icon;
            const daysPending = getDaysPending(user.created_at);
            
            return (
              <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group overflow-hidden">
                {/* Priority Bar */}
                <div className={`h-1 w-full ${
                  priority?.label === 'High Priority' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                  priority?.label === 'Medium Priority' ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                  'bg-gradient-to-r from-green-500 to-emerald-500'
                }`} />
                
                <div className="p-5">
                  {/* Header with Priority Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-md">
                        {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{user.username || 'No Username'}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Mail size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    {priority && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${priority.color}`}>
                        <PriorityIcon size={10} />
                        {priority.label}
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      {user.mobile_number && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Phone size={14} className="text-gray-400" />
                          <span>{user.mobile_number}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        <span>Requested: {daysPending}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        {user.is_verified ? (
                          <>
                            <CheckCircle size={14} className="text-green-500" />
                            <span className="text-green-600">Email verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} className="text-red-400" />
                            <span className="text-red-400">Not verified</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Eye size={14} className="text-gray-400" />
                        <span>ID: {user.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      disabled={actionId === user.id}
                      onClick={() => handleAction(AdminService.approveUser, user.id, 'Approval')}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
                    >
                      <UserCheck size={16} />
                      {actionId === user.id ? 'Processing...' : 'Approve User'}
                    </button>
                    <button
                      disabled={actionId === user.id}
                      onClick={() => handleAction(AdminService.rejectUser, user.id, 'Rejection')}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50"
                    >
                      <UserX size={16} />
                      {actionId === user.id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>

                  {/* Quick View Note */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                      <Clock size={10} />
                      Pending for {daysPending} • Click to take action
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Stats Footer */}
      {!loading && filteredUsers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <TrendingUp size={20} className="text-orange-500" />
              <div>
                <p className="text-xs text-orange-700 font-medium">Approval Tips</p>
                <p className="text-[11px] text-orange-600">Review user details carefully before approving</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const approveAll = async () => {
                    for (const user of filteredUsers) {
                      await handleAction(AdminService.approveUser, user.id, 'Approval');
                    }
                  };
                  if (window.confirm(`Approve all ${filteredUsers.length} pending users?`)) {
                    approveAll();
                  }
                }}
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition"
              >
                Approve All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}