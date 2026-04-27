'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar, Ticket, BookOpen,
  CreditCard, TrendingUp, Plus, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import EventService from '@/services/event.service';
import BookingService from '@/services/booking.service';
import SubscriptionService from '@/services/subscription.service';
import { formatDate, formatPrice } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, subRes] = await Promise.all([
          EventService.getEvents({ page_size: 5 }),
          SubscriptionService.getMySubscription(),
        ]);
        setRecentEvents(eventsRes.results || []);
        setSubscription(subRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Total Events',
      value: recentEvents.length,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      href: '/events'
    },
    {
      label: 'Active Plan',
      value: subscription?.subscription?.plan_detail?.display_name || 'Free',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
      href: '/subscription'
    },
    {
      label: 'Tickets',
      value: '—',
      icon: Ticket,
      color: 'bg-green-50 text-green-600',
      href: '/tickets'
    },
    {
      label: 'Bookings',
      value: '—',
      icon: BookOpen,
      color: 'bg-orange-50 text-orange-600',
      href: '/bookings'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Aaj ka overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          href="/events/create"
          className="flex items-center gap-2 bg-[#e94560] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d63651] transition"
        >
          <Plus size={16} />
          New Event
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon size={18} />
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Subscription Banner */}
      {subscription?.subscription?.plan_detail?.name === 'free' && (
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#e94560] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Upgrade to Pro! 🚀</h3>
            <p className="text-white/70 text-sm mt-1">
              Unlimited events, custom domain, analytics aur bahut kuch unlock karo
            </p>
          </div>
          <Link
            href="/subscription"
            className="bg-white text-[#e94560] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition whitespace-nowrap"
          >
            View Plans
          </Link>
        </div>
      )}

      {/* Recent Events */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Recent Events</h3>
          <Link href="/events" className="text-[#e94560] text-sm font-medium hover:underline">
            View All
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Koi event nahi hai abhi</p>
            <Link
              href="/events/create"
              className="inline-flex items-center gap-2 mt-4 bg-[#e94560] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#d63651] transition"
            >
              <Plus size={14} /> Pehla Event Banao
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
              >
                {/* Banner */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e94560] to-[#1a1a2e] flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-white" />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{event.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(event.start_datetime)}</p>
                </div>
                {/* Status Badge */}
                <span className={`
                  text-xs font-medium px-2.5 py-1 rounded-full capitalize
                  ${event.status === 'published' ? 'bg-green-100 text-green-600' :
                    event.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                    event.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-600'}
                `}>
                  {event.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}