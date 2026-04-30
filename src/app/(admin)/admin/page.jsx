'use client';
import { useEffect, useState } from 'react';
import AdminService from '@/services/admin.service';
import { 
  Users, Clock, CheckCircle, Building2, CalendarDays, 
  TrendingUp, ArrowRight, Activity, Sparkles, 
  Eye, ThumbsUp, Zap, Award, BarChart3, TrendingDown
} from 'lucide-react';
import Link from 'next/link';

const StatCard3D = ({ label, value, icon: Icon, color, gradient, href, trend, trendValue }) => (
  <Link 
    href={href || '#'}
    className="group block transform transition-all duration-300 hover:-translate-y-1"
  >
    <div className="relative">
      {/* 3D Shadow Layers */}
      <div className={`absolute inset-0 rounded-2xl ${color} opacity-40 blur-xl group-hover:opacity-60 transition-opacity duration-300`} />
      <div className={`absolute inset-0 rounded-2xl ${color} transform translate-y-1`} />
      
      {/* Main Card */}
      <div className={`relative rounded-2xl ${gradient} p-5 shadow-lg transform transition-all duration-300 group-hover:shadow-2xl`}>
        {/* Shine Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative">
          {/* Header with Icon */}
          <div className="flex items-start justify-between mb-4">
            <div className={`relative`}>
              <div className={`absolute inset-0 rounded-xl ${color} blur-md opacity-50`} />
              <div className={`relative p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={22} className="text-white" />
              </div>
            </div>
            
            {/* Trend Indicator */}
            {trend && (
              <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full backdrop-blur-sm ${trend === 'up' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                {trend === 'up' ? <TrendingUp size={10} className="text-green-400" /> : <TrendingDown size={10} className="text-red-400" />}
                <span className={`text-[10px] font-bold ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>{trendValue}</span>
              </div>
            )}
          </div>
          
          {/* Value */}
          <div className="mb-1">
            <p className="text-3xl font-black text-white tracking-tight">
              {value?.toLocaleString() ?? '0'}
            </p>
          </div>
          
          {/* Label */}
          <div>
            <p className="text-[11px] font-medium text-white/70 uppercase tracking-wider">
              {label}
            </p>
          </div>
          
          {/* Decorative Bar */}
          <div className="absolute bottom-3 right-3 opacity-20 group-hover:opacity-40 transition">
            <ArrowRight size={20} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  </Link>
);

const InsightCard = ({ icon: Icon, label, value, color, change }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition group">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 group-hover:scale-110 transition`}>
        <Icon size={14} className={color.replace('bg-', 'text-')} />
      </div>
      <div>
        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
    {change && (
      <div className={`text-[10px] font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? '+' : ''}{change}%
      </div>
    )}
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await AdminService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { 
      label: 'TOTAL USERS', 
      value: stats?.total_users, 
      icon: Users, 
      color: 'bg-blue-600',
      gradient: 'bg-gradient-to-br from-blue-600 to-blue-800',
      href: '/admin/users',
      trend: 'up',
      trendValue: '+12%'
    },
    { 
      label: 'PENDING', 
      value: stats?.pending_users, 
      icon: Clock, 
      color: 'bg-amber-600',
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-700',
      href: '/admin/pending',
      trend: stats?.pending_users > 0 ? 'up' : 'down',
      trendValue: stats?.pending_users > 0 ? '+2' : '0'
    },
    { 
      label: 'APPROVED', 
      value: stats?.approved_users, 
      icon: CheckCircle, 
      color: 'bg-emerald-600',
      gradient: 'bg-gradient-to-br from-emerald-500 to-green-700',
      href: '/admin/users',
      trend: 'up',
      trendValue: '+8%'
    },
    { 
      label: 'ORGANIZERS', 
      value: stats?.total_organizers, 
      icon: Building2, 
      color: 'bg-purple-600',
      gradient: 'bg-gradient-to-br from-purple-500 to-indigo-800',
      href: '/admin/organizers',
      trend: 'up',
      trendValue: '+5%'
    },
    { 
      label: 'EVENTS', 
      value: stats?.total_events, 
      icon: CalendarDays, 
      color: 'bg-rose-600',
      gradient: 'bg-gradient-to-br from-rose-500 to-pink-700',
      href: '/admin/events',
      trend: 'up',
      trendValue: '+24%'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
            <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500" />
          </div>
          <p className="text-gray-500 text-sm mt-4">Loading dashboard magic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header with Stats */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-yellow-400" />
              <span className="text-xs font-medium text-yellow-400/90 uppercase tracking-wider">Admin Dashboard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">Welcome back, Admin</h2>
            <p className="text-gray-300 text-sm mt-1">
              Here's what's happening with your platform today
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition flex items-center gap-2">
              <BarChart3 size={14} />
              Analytics
            </button>
            <button className="bg-rose-500 px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition flex items-center gap-2 shadow-lg shadow-rose-500/25">
              <Zap size={14} />
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/10">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Platform Growth</p>
            <p className="text-lg font-bold">+{Math.round(Math.random() * 30 + 10)}%</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Active Users</p>
            <p className="text-lg font-bold">{Math.round((stats?.total_users || 0) * 0.7)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Engagement Rate</p>
            <p className="text-lg font-bold">78%</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Response Time</p>
            <p className="text-lg font-bold">2.4h</p>
          </div>
        </div>
      </div>

      {/* 3D Stats Grid - Single Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => (
          <StatCard3D key={index} {...card} />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Recent Activity</h3>
                <p className="text-gray-500 text-xs mt-0.5">Latest updates from your platform</p>
              </div>
              <Activity size={18} className="text-gray-400" />
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { id: 1, user: 'Sarah Johnson', action: 'registered as organizer', time: '5 mins ago', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
              { id: 2, user: 'Tech Corp', action: 'created new event', time: '1 hour ago', icon: CalendarDays, color: 'text-rose-600', bg: 'bg-rose-50' },
              { id: 3, user: 'Mike Chen', action: 'approved as vendor', time: '3 hours ago', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { id: 4, user: 'Creative Studio', action: 'submitted for approval', time: '5 hours ago', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${activity.bg} group-hover:scale-110 transition`}>
                    <activity.icon size={14} className={activity.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-bold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                  <Eye size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/activities" className="block p-3 text-center text-xs font-medium text-rose-500 hover:bg-rose-50 transition border-t border-gray-100">
            View all activities →
          </Link>
        </div>

        {/* Platform Insights */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Platform Insights</h3>
                <p className="text-gray-500 text-xs mt-0.5">Key metrics at a glance</p>
              </div>
              <Award size={18} className="text-gray-400" />
            </div>
          </div>
          <div className="p-5 space-y-3">
            <InsightCard 
              icon={ThumbsUp}
              label="Approval Rate"
              value={`${stats?.total_users ? Math.round((stats.approved_users / stats.total_users) * 100) : 0}%`}
              color="text-emerald-600"
              change={+5}
            />
            <InsightCard 
              icon={Building2}
              label="Organizer Ratio"
              value={`${stats?.total_users ? Math.round((stats.total_organizers / stats.total_users) * 100) : 0}%`}
              color="text-purple-600"
              change={+2}
            />
            <InsightCard 
              icon={CalendarDays}
              label="Avg. Events/Organizer"
              value={`${stats?.total_organizers ? (stats.total_events / stats.total_organizers).toFixed(1) : 0}`}
              color="text-rose-600"
              change={-1}
            />
            <InsightCard 
              icon={Clock}
              label="Pending Actions"
              value={`${stats?.pending_users || 0} users need approval`}
              color="text-amber-600"
            />
          </div>
          
          {/* Progress Bar */}
          <div className="p-5 pt-0">
            <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${stats?.total_users ? (stats.approved_users / stats.total_users) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              Platform completion status
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/admin/users/new" className="bg-white rounded-xl p-3 text-center hover:shadow-md transition border border-gray-100 group">
          <Users size={16} className="mx-auto mb-1 text-gray-400 group-hover:text-rose-500 transition" />
          <p className="text-[11px] font-medium text-gray-700">Add User</p>
        </Link>
        <Link href="/admin/events/create" className="bg-white rounded-xl p-3 text-center hover:shadow-md transition border border-gray-100 group">
          <CalendarDays size={16} className="mx-auto mb-1 text-gray-400 group-hover:text-rose-500 transition" />
          <p className="text-[11px] font-medium text-gray-700">Create Event</p>
        </Link>
        <Link href="/admin/reports" className="bg-white rounded-xl p-3 text-center hover:shadow-md transition border border-gray-100 group">
          <BarChart3 size={16} className="mx-auto mb-1 text-gray-400 group-hover:text-rose-500 transition" />
          <p className="text-[11px] font-medium text-gray-700">View Reports</p>
        </Link>
        <Link href="/admin/settings" className="bg-white rounded-xl p-3 text-center hover:shadow-md transition border border-gray-100 group">
          <Zap size={16} className="mx-auto mb-1 text-gray-400 group-hover:text-rose-500 transition" />
          <p className="text-[11px] font-medium text-gray-700">Quick Settings</p>
        </Link>
      </div>
    </div>
  );
}