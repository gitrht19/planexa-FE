'use client';
import { useState, useEffect } from 'react';
import {
  BookOpen, Search, Eye, X,
  User, Mail, Phone, Calendar,
  Ticket, CreditCard, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import BookingService from '@/services/booking.service';
import EventService from '@/services/event.service';
import { formatDate, formatPrice, getStatusColor, getErrorMessage } from '@/lib/utils';

// ── Booking Detail Modal ──────────────────────────────────
function BookingDetailModal({ booking, onClose, onCancel }) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Booking Detail</h3>
            <p className="text-xs text-gray-400 mt-0.5">#{booking.booking_ref}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`text-sm px-3 py-1.5 rounded-full font-semibold capitalize ${getStatusColor(booking.booking_status)}`}>
              {booking.booking_status}
            </span>
            <p className="text-xs text-gray-400">{formatDate(booking.created_at)}</p>
          </div>

          {/* Attendee Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase">Attendee</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e94560] flex items-center justify-center text-white font-bold">
                {(booking.guest_name || booking.user?.username || 'G')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {booking.guest_name || booking.user?.username || 'Guest'}
                </p>
                <p className="text-xs text-gray-400">
                  {booking.guest_email || booking.user?.email || '—'}
                </p>
              </div>
            </div>
            {booking.guest_phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400" />
                {booking.guest_phone}
              </div>
            )}
          </div>

          {/* Event + Ticket Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase">Booking Info</p>
            {[
              { icon: Calendar, label: 'Event', value: booking.event_title || `Event #${booking.event}` },
              { icon: Ticket, label: 'Ticket Type', value: booking.ticket_type_name || `Ticket #${booking.ticket_type}` },
              { icon: User, label: 'Quantity', value: `${booking.quantity} tickets` },
              { icon: CreditCard, label: 'Total Amount', value: formatPrice(booking.total_price) },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <Icon size={15} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{item.label}</span>
                    <span className="text-sm font-medium text-gray-700">{item.value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cancellation Reason */}
          {booking.cancellation_reason && (
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-500 mb-1">Cancellation Reason</p>
              <p className="text-sm text-red-600">{booking.cancellation_reason}</p>
            </div>
          )}

          {/* Cancel Button */}
          {['pending', 'confirmed'].includes(booking.booking_status) && (
            <button
              onClick={() => onCancel(booking)}
              className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition"
            >
              Cancel Booking
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Cancel Confirm Modal ──────────────────────────────────
function CancelModal({ booking, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(booking.id, reason);
    setLoading(false);
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">Booking Cancel Karo</h3>
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">#{booking.booking_ref}</span> cancel karna chahte ho?
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Cancel karne ki wajah..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition disabled:opacity-60 flex items-center justify-center"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : 'Confirm Cancel'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelBooking, setCancelBooking] = useState(null);

  useEffect(() => {
    EventService.getEvents({ page_size: 100 })
      .then(res => setEvents(res.results || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchBookings(currentPage);
  }, [currentPage, statusFilter, eventFilter]);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (statusFilter) params.booking_status = statusFilter;
      if (eventFilter) params.event = eventFilter;
      const res = await BookingService.getAllBookings(params);
      setBookings(res.results || []);
      setPagination(res.pagination || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id, reason) => {
    try {
      await BookingService.cancelBooking(id, reason);
      toast.success('Booking cancelled!');
      setCancelBooking(null);
      setSelectedBooking(null);
      fetchBookings(currentPage);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // Client-side search filter
  const filteredBookings = bookings.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.booking_ref?.toLowerCase().includes(q) ||
      b.guest_name?.toLowerCase().includes(q) ||
      b.guest_email?.toLowerCase().includes(q) ||
      b.user?.username?.toLowerCase().includes(q)
    );
  });

  const statusOptions = ['pending', 'confirmed', 'cancelled', 'attended', 'refunded'];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">Sab bookings ek jagah dekho</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: pagination?.total || bookings.length, color: 'bg-blue-50 text-blue-600' },
          { label: 'Confirmed', value: bookings.filter(b => b.booking_status === 'confirmed').length, color: 'bg-green-50 text-green-600' },
          { label: 'Pending', value: bookings.filter(b => b.booking_status === 'pending').length, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Cancelled', value: bookings.filter(b => b.booking_status === 'cancelled').length, color: 'bg-red-50 text-red-600' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl p-4 ${stat.color.split(' ')[0]}`}>
            <p className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
            <p className={`text-xs font-medium mt-1 ${stat.color.split(' ')[1]}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ref, name, email se search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
            />
          </div>

          {/* Event Filter */}
          <select
            value={eventFilter}
            onChange={e => { setEventFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560] bg-white"
          >
            <option value="">All Events</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560] bg-white"
          >
            <option value="">All Status</option>
            {statusOptions.map(s => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <BookOpen size={40} className="text-gray-300" />
            <p className="text-gray-400 text-sm">Koi booking nahi mili</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Ref', 'Attendee', 'Event', 'Tickets', 'Amount', 'Status', 'Date', ''].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition">

                      {/* Ref */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-mono font-semibold text-gray-600">
                          {booking.booking_ref}
                        </p>
                      </td>

                      {/* Attendee */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#e94560] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(booking.guest_name || booking.user?.username || 'G')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {booking.guest_name || booking.user?.username || 'Guest'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {booking.guest_email || booking.user?.email || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Event */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-600 max-w-[150px] truncate">
                          {booking.event_title || `Event #${booking.event}`}
                        </p>
                      </td>

                      {/* Tickets */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-600">{booking.quantity}x</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {booking.ticket_type_name || '—'}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-800">
                          {formatPrice(booking.total_price)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusColor(booking.booking_status)}`}>
                          {booking.booking_status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-400">{formatDate(booking.created_at)}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"
                            title="View Detail"
                          >
                            <Eye size={15} />
                          </button>
                          {['pending', 'confirmed'].includes(booking.booking_status) && (
                            <button
                              onClick={() => setCancelBooking(booking)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition"
                              title="Cancel"
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredBookings.map(booking => (
                <div key={booking.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-mono font-semibold text-gray-500">
                        #{booking.booking_ref}
                      </p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {booking.guest_name || booking.user?.username || 'Guest'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {booking.event_title || `Event #${booking.event}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize flex-shrink-0 ${getStatusColor(booking.booking_status)}`}>
                      {booking.booking_status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{booking.quantity} tickets · {formatPrice(booking.total_price)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                      >
                        View
                      </button>
                      {['pending', 'confirmed'].includes(booking.booking_status) && (
                        <button
                          onClick={() => setCancelBooking(booking)}
                          className="px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-500 hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Total {pagination.total} bookings</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={!pagination.previous}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">
                    {pagination.current_page} / {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!pagination.next}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onCancel={(b) => { setSelectedBooking(null); setCancelBooking(b); }}
      />
      <CancelModal
        booking={cancelBooking}
        onClose={() => setCancelBooking(null)}
        onConfirm={handleCancel}
      />

    </div>
  );
}