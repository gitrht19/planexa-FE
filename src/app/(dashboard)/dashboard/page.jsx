'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar, Ticket, TrendingUp, Plus, ArrowRight, Sparkles, Zap,
  Users, Wallet, Activity, Eye, ChartNoAxesCombined, TrendingDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import EventService from '@/services/event.service';
import SubscriptionService from '@/services/subscription.service';
import { formatDate } from '@/lib/utils';
import TicketService from '@/services/ticket.service';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyRevenue, setWeeklyRevenue] = useState([1200, 3400, 2800, 4200, 5600, 4800, 6200]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await EventService.getEvents({ page_size: 4 });
        setRecentEvents(eventsRes.results || []);
        setStats(prev => ({
          ...prev,
          totalEvents: eventsRes.count || eventsRes.results?.length || 0,
        }));

        try {
          const ticketsRes = await TicketService.getTickets();
          setStats(prev => ({
            ...prev,
            totalTickets: ticketsRes.count || ticketsRes.results?.length || 0,
          }));
        } catch { }
        
        try {
          const subRes = await SubscriptionService.getMySubscription();
          setSubscription(subRes);
        } catch { }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Events', value: stats.totalEvents, icon: Calendar, color: '#e94560', bg: 'bg-rose-50' },
    { label: 'Tickets', value: stats.totalTickets, icon: Ticket, color: '#10b981', bg: 'bg-emerald-50' },
    { label: 'Bookings', value: stats.totalBookings || '0', icon: Users, color: '#8b5cf6', bg: 'bg-purple-50' },
    { label: 'Revenue', value: `₹${(stats.totalRevenue || 12580).toLocaleString()}`, icon: Wallet, color: '#f59e0b', bg: 'bg-amber-50' },
  ];

  const quickActions = [
    { label: 'Create Event', icon: Plus, href: '/events/create', color: 'rose' },
    { label: 'Manage Tickets', icon: Ticket, href: '/tickets', color: 'emerald' },
    { label: 'View Bookings', icon: Eye, href: '/bookings', color: 'purple' },
    { label: 'Analytics', icon: ChartNoAxesCombined, href: '/analytics', color: 'amber' },
  ];

  // Calculate graph stats
  const maxRevenue = Math.max(...weeklyRevenue);
  const totalWeeklyRevenue = weeklyRevenue.reduce((a, b) => a + b, 0);
  const avgRevenue = totalWeeklyRevenue / 7;
  const revenueChange = ((weeklyRevenue[6] - weeklyRevenue[0]) / weeklyRevenue[0] * 100).toFixed(0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
          <Sparkles size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          href="/events/create"
          className="flex items-center gap-1.5 bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-rose-600 transition shadow-sm"
        >
          <Plus size={12} /> Create Event
        </Link>
      </div>

      {/* Stats Row - Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((card, idx) => (
          <Link
            key={idx}
            href={`/${card.label.toLowerCase()}`}
            className="bg-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center group-hover:scale-110 transition`}>
                <card.icon size={14} style={{ color: card.color }} />
              </div>
              <ArrowRight size={12} className="text-gray-300 group-hover:text-gray-500" />
            </div>
            <p className="text-xl font-bold text-gray-800">{card.value}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {quickActions.map((action, idx) => {
          const colors = {
            rose: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
            emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
            purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
            amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
          };
          return (
            <Link
              key={idx}
              href={action.href}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${colors[action.color]}`}
            >
              <action.icon size={12} /> {action.label}
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Events - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-rose-500" />
              <h3 className="font-semibold text-gray-800 text-sm">Recent Events</h3>
            </div>
            <Link href="/events" className="text-rose-500 text-[11px] font-medium hover:underline">All →</Link>
          </div>
          
          {recentEvents.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">No events yet</p>
              <Link href="/events/create" className="inline-block mt-2 text-rose-500 text-xs font-medium">Create one →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Calendar size={12} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-xs truncate">{event.title}</p>
                    <p className="text-[10px] text-gray-400">{formatDate(event.start_datetime)}</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium capitalize ${
                    event.status === 'published' ? 'bg-emerald-100 text-emerald-600' :
                    event.status === 'draft' ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {event.status === 'published' ? 'Live' : event.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Graph Card */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChartNoAxesCombined size={14} className="text-emerald-500" />
                <h3 className="font-semibold text-gray-800 text-sm">Revenue Overview</h3>
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-semibold ${revenueChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {revenueChange >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {revenueChange >= 0 ? '+' : ''}{revenueChange}%
              </div>
            </div>
          </div>
          
          <div className="p-4">
            {/* Graph Bars */}
            <div className="flex items-end justify-between gap-1 h-24 mb-3">
              {weeklyRevenue.map((value, idx) => {
                const height = (value / maxRevenue) * 100;
                const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-gradient-to-t from-rose-500 to-pink-500 rounded-sm transition-all duration-500 hover:scale-105 cursor-pointer"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    <span className="text-[8px] text-gray-400 font-medium">{days[idx]}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider">Total (Week)</p>
                <p className="text-sm font-bold text-gray-800">₹{totalWeeklyRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider">Daily Avg</p>
                <p className="text-sm font-bold text-gray-800">₹{Math.round(avgRevenue).toLocaleString()}</p>
              </div>
            </div>

            {/* Peak Day */}
            <div className="mt-2 p-2 bg-emerald-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-emerald-600 font-medium">📈 Best Day</span>
                <span className="text-[10px] font-bold text-emerald-700">₹{maxRevenue.toLocaleString()}</span>
              </div>
              <p className="text-[8px] text-gray-500 mt-0.5">Sunday • Highest revenue this week</p>
            </div>
          </div>

          {/* Plan Info Footer */}
          <div className="px-4 py-2 bg-gradient-to-r from-rose-50 to-pink-50 border-t border-rose-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap size={10} className="text-rose-500" />
                <span className="text-[9px] font-medium text-rose-600">
                  {subscription?.subscription?.plan_detail?.display_name || 'Free'} Plan
                </span>
              </div>
              {subscription?.subscription?.plan_detail?.name === 'free' && (
                <Link href="/subscription" className="text-[9px] font-semibold text-rose-600 hover:underline">
                  Upgrade →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-amber-50 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-600" />
          <p className="text-amber-800 text-xs font-medium">🎯 Pro Tip: Create more events to grow your audience!</p>
        </div>
        <Link href="/events/create" className="text-amber-600 text-[11px] font-semibold hover:underline">Create →</Link>
      </div>
    </div>
  );
}