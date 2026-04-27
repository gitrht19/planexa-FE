'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, MapPin, Globe, Users,
  Edit, Trash2, ToggleLeft, Ticket, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import EventService from '@/services/event.service';
import TicketService from '@/services/ticket.service';
import BookingService from '@/services/booking.service';
import { formatDate, formatPrice, getStatusColor, getErrorMessage } from '@/lib/utils';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [eventRes, ticketsRes, attendeesRes] = await Promise.all([
          EventService.getEvent(id),
          TicketService.getTicketsByEvent(id),
          BookingService.getEventAttendees(id),
        ]);
        setEvent(eventRes);
        setTickets(ticketsRes.results || []);
        setAttendees(attendeesRes.results || []);
      } catch (err) {
        toast.error(getErrorMessage(err));
        router.push('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await EventService.changeStatus(id, newStatus);
      setEvent(prev => ({ ...prev, status: updated.status }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Event delete karna chahte ho?')) return;
    try {
      await EventService.deleteEvent(id);
      toast.success('Event deleted!');
      router.push('/events');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  const statusOptions = ['draft', 'published', 'cancelled', 'completed', 'postponed'];
  const tabs = ['overview', 'tickets', 'attendees'];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/events" className="p-2 rounded-xl hover:bg-gray-100 transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{formatDate(event.start_datetime)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/events/${id}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <Edit size={14} /> Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-sm text-red-500 hover:bg-red-50 transition"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Banner */}
      {event.banner_image && (
        <div className="w-full h-48 rounded-2xl overflow-hidden">
          <img src={event.banner_image} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tickets', value: tickets.length, icon: Ticket, color: 'bg-blue-50 text-blue-600' },
          { label: 'Attendees', value: attendees.length, icon: BookOpen, color: 'bg-green-50 text-green-600' },
          { label: 'Capacity', value: event.max_capacity || '∞', icon: Users, color: 'bg-purple-50 text-purple-600' },
          { label: 'Price', value: event.is_free ? 'FREE' : formatPrice(event.price), icon: Calendar, color: 'bg-orange-50 text-orange-600' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon size={16} />
              </div>
              <p className="text-xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Change Status */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <ToggleLeft size={16} className="text-[#e94560]" /> Change Status
        </p>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={s === event.status}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                s === event.status
                  ? 'bg-[#e94560] text-white cursor-default'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-semibold capitalize transition ${
                activeTab === tab
                  ? 'text-[#e94560] border-b-2 border-[#e94560]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {event.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.location && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin size={16} className="text-[#e94560] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Location</p>
                      <p className="text-sm font-medium text-gray-700">{event.location}</p>
                    </div>
                  </div>
                )}
                {event.online_link && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <Globe size={16} className="text-[#e94560] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Online Link</p>
                      <a href={event.online_link} target="_blank" className="text-sm font-medium text-blue-600 hover:underline truncate block">
                        {event.online_link}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar size={16} className="text-[#e94560] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Start</p>
                    <p className="text-sm font-medium text-gray-700">{formatDate(event.start_datetime)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar size={16} className="text-[#e94560] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">End</p>
                    <p className="text-sm font-medium text-gray-700">{formatDate(event.end_datetime)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">{tickets.length} Ticket Types</p>
                <Link
                  href={`/tickets?event_id=${id}`}
                  className="text-xs text-[#e94560] font-semibold hover:underline"
                >
                  Manage Tickets →
                </Link>
              </div>
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Koi ticket type nahi hai</p>
                  <Link
                    href={`/tickets?event_id=${id}`}
                    className="inline-block mt-3 text-xs text-[#e94560] font-semibold hover:underline"
                  >
                    Ticket add karo →
                  </Link>
                </div>
              ) : (
                tickets.map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-800 text-sm capitalize">{ticket.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ticket.sold_quantity}/{ticket.total_quantity} sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-sm">
                        {ticket.is_free ? 'FREE' : formatPrice(ticket.price)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.ticket_status)}`}>
                        {ticket.ticket_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Attendees Tab */}
          {activeTab === 'attendees' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">{attendees.length} Attendees</p>
              {attendees.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Koi attendee nahi hai abhi</p>
                </div>
              ) : (
                attendees.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e94560] flex items-center justify-center text-white text-xs font-bold">
                        {(booking.guest_name || booking.user?.username || 'G')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {booking.guest_name || booking.user?.username || 'Guest'}
                        </p>
                        <p className="text-xs text-gray-400">{booking.guest_email || booking.user?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Qty: {booking.quantity}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(booking.booking_status)}`}>
                        {booking.booking_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}