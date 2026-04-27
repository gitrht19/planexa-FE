'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, TrendingUp, Users, CreditCard,
  ArrowRight, Crown, BarChart3, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import OrganizerService from '@/services/organizer.service';
import { formatDate, formatPrice, getStatusColor, getErrorMessage } from '@/lib/utils';

export default function OrganizerStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrganizerService.getStats()
      .then(setStats)
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Events',
      value: stats.events?.total ?? 0,
      sub: `${stats.events?.upcoming ?? 0} upcoming`,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      href: '/events',
    },
    {
      label: 'Total Bookings',
      value: stats.bookings?.total ?? 0,
      sub: `${stats.bookings?.confirmed ?? 0} confirmed`,
      icon: Users,
      color: 'bg-green-50 text-green-600',
      href: '/bookings',
    },
    {
      label: 'Total Revenue',
      value: formatPrice(stats.revenue?.total ?? 0),
      sub: 'All time',
      icon: CreditCard,
      color: 'bg-[#e94560]/10 text-[#e94560]',
      href: '/payments',
    },
    {
      label: 'Published Events',
      value: stats.events?.published ?? 0,
      sub: `${stats.events?.past ?? 0} past`,
      icon: BarChart3,
      color: 'bg-purple-50 text-purple-600',
      href: '/events',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Organizer Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Apna performance dekho</p>
        </div>
        <Link
          href="/organizer/profile"
          className="flex items-center gap-2 text-sm text-[#e94560] font-semibold hover:underline"
        >
          <Crown size={15} /> Profile Edit
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon;
          const [bg, text] = card.color.split(' ');
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={text} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Events */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Top Events</h3>
            <Link href="/events" className="text-xs text-[#e94560] font-semibold hover:underline flex items-center gap-1">
              Sab dekho <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.top_events?.length === 0 ? (
              <div className="py-10 text-center">
                <Calendar size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Koi event nahi hai abhi</p>
              </div>
            ) : stats.top_events?.map((event, i) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition"
              >
                <span className="text-lg font-black text-gray-200 w-6">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{event.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(event.start_datetime)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Recent Bookings</h3>
            <Link href="/bookings" className="text-xs text-[#e94560] font-semibold hover:underline flex items-center gap-1">
              Sab dekho <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recent_bookings?.length === 0 ? (
              <div className="py-10 text-center">
                <Users size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Koi booking nahi hai abhi</p>
              </div>
            ) : stats.recent_bookings?.map(booking => (
              <div key={booking.id} className="flex items-center gap-3 px-6 py-4">
                <div className="w-8 h-8 rounded-full bg-[#e94560] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(booking.guest_name || booking.user?.username || 'G')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {booking.guest_name || booking.user?.username || 'Guest'}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {formatDate(booking.created_at)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-800">{formatPrice(booking.total_price)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(booking.booking_status)}`}>
                    {booking.booking_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}