'use client';
import { useState, useEffect } from 'react';
import {
  BookOpen, Search, Eye, X,
  User, Phone, Calendar, Ticket,
  CreditCard, CheckCircle, Clock,
  XCircle, UserCheck, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BookingService from '@/services/booking.service';
import EventService from '@/services/event.service';
import { formatDate, formatPrice, getErrorMessage } from '@/lib/utils';

// ── Status Config ──────────────────────────────────────
const statusConfig = {
  pending:   { label: 'Pending',   bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  confirmed: { label: 'Confirmed', bg: 'bg-green-50',  text: 'text-green-700',  icon: CheckCircle },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50',    text: 'text-red-600',    icon: XCircle },
  attended:  { label: 'Attended',  bg: 'bg-blue-50',   text: 'text-blue-700',   icon: UserCheck },
  refunded:  { label: 'Refunded',  bg: 'bg-purple-50', text: 'text-purple-700', icon: RefreshCw },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ── Booking Detail Modal ───────────────────────────────
function BookingDetailModal({ booking, onClose, onCancel }) {
  if (!booking) return null;

  const attendeeName  = booking.guest_name  || booking.user_username || 'Guest';
  const attendeeEmail = booking.guest_email || booking.user_email    || '—';
  const canCancel     = ['pending', 'confirmed'].includes(booking.booking_status);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Booking Detail</h3>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{booking.booking_ref}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Status + Date */}
          <div className="flex items-center justify-between">
            <StatusBadge status={booking.booking_status} />
            <p className="text-xs text-gray-400">{formatDate(booking.created_at)}</p>
          </div>

          {/* Attendee Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attendee</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e94560] flex items-center justify-center text-white font-bold text-sm">
                {attendeeName[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{attendeeName}</p>
                <p className="text-xs text-gray-400">{attendeeEmail}</p>
              </div>
            </div>
            {booking.guest_phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={13} className="text-gray-400" />
                {booking.guest_phone}
              </div>
            )}
          </div>

          {/* Booking Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Booking Info</p>
            {[
              { icon: Calendar,   label: 'Event',        value: booking.event_title      || `Event #${booking.event}` },
              { icon: Ticket,     label: 'Ticket Type',  value: booking.ticket_type_name || `Ticket #${booking.ticket_type}` },
              { icon: User,       label: 'Quantity',     value: `${booking.quantity} ticket${booking.quantity > 1 ? 's' : ''}` },
              { icon: CreditCard, label: 'Total Amount', value: formatPrice(booking.total_price) },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <Icon size={14} className="text-gray-400 flex-shrink-0" />
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
          {canCancel && (
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

// ── Cancel Confirm Modal ───────────────────────────────
function CancelModal({ booking, onClose, onConfirm }) {
  const [reason, setReason]   = useState('');
  const [loading, setLoading] = useState(false);

  if (!booking) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(booking.id, reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <h3 className="font-bold text-gray-800 text-lg">Booking Cancel Karo</h3>
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700 font-mono">{booking.booking_ref}</span> cancel karna chahte ho?
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Reason <span className="text-gray-400 font-normal">(optional)</span>
          </label>
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
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
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

// ── Main Page ──────────────────────────────────────────
export default function BookingsPage() {
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter]   = useState('');
  const [events, setEvents]             = useState([]);
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalCount, setTotalCount]     = useState(0);
  const [stats, setStats]               = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelBooking, setCancelBooking]     = useState(null);

  // Load organizer's events for filter dropdown
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
      if (eventFilter)  params.event = eventFilter;

      const [bookingsRes, statsRes] = await Promise.all([
        BookingService.getOrganizerBookings(params),
        BookingService.getOrganizerBookingStats().catch(() => null),
      ]);

      setBookings(bookingsRes.results || []);
      setTotalPages(bookingsRes.pages || 1);
      setTotalCount(bookingsRes.total || 0);
      setStats(statsRes);
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

  // Client-side search
  const filteredBookings = bookings.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.booking_ref?.toLowerCase().includes(q)    ||
      b.guest_name?.toLowerCase().includes(q)     ||
      b.guest_email?.toLowerCase().includes(q)    ||
      b.user_email?.toLowerCase().includes(q)     ||
      b.user_username?.toLowerCase().includes(q)  ||
      b.event_title?.toLowerCase().includes(q)
    );
  });

  const statCards = [
    { label: 'Total',     value: stats?.total     ?? totalCount, bg: 'bg-blue-50',   text: 'text-blue-700' },
    { label: 'Confirmed', value: stats?.confirmed ?? '—',        bg: 'bg-green-50',  text: 'text-green-700' },
    { label: 'Pending',   value: stats?.pending   ?? '—',        bg: 'bg-yellow-50', text: 'text-yellow-700' },
    { label: 'Cancelled', value: stats?.cancelled ?? '—',        bg: 'bg-red-50',    text: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">Tumhare events ke saare attendees</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className={`${card.bg} rounded-2xl p-5`}>
            <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
            <p className={`text-xs font-medium mt-1 ${card.text}`}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ref, name, email, event se search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
            />
          </div>

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

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560] bg-white"
          >
            <option value="">All Status</option>
            {Object.entries(statusConfig).map(([val, cfg]) => (
              <option key={val} value={val}>{cfg.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
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
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBookings.map(booking => {
                    const attendeeName = booking.guest_name || booking.user_username || 'Guest';
                    const attendeeEmail = booking.guest_email || booking.user_email || '—';
                    const canCancel = ['pending', 'confirmed'].includes(booking.booking_status);
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4">
                          <p className="text-xs font-mono font-semibold text-gray-600">{booking.booking_ref}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#e94560] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {attendeeName[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">{attendeeName}</p>
                              <p className="text-xs text-gray-400">{attendeeEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-600 max-w-[140px] truncate">
                            {booking.event_title || `Event #${booking.event}`}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-700 font-medium">{booking.quantity}×</p>
                          <p className="text-xs text-gray-400 truncate max-w-[100px]">
                            {booking.ticket_type_name || '—'}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-gray-800">{formatPrice(booking.total_price)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={booking.booking_status} />
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs text-gray-400 whitespace-nowrap">{formatDate(booking.created_at)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"
                              title="View"
                            >
                              <Eye size={15} />
                            </button>
                            {canCancel && (
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredBookings.map(booking => {
                const attendeeName = booking.guest_name || booking.user_username || 'Guest';
                const canCancel = ['pending', 'confirmed'].includes(booking.booking_status);
                return (
                  <div key={booking.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-mono text-gray-400">{booking.booking_ref}</p>
                        <p className="font-semibold text-gray-800 mt-0.5 text-sm">{attendeeName}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">
                          {booking.event_title || `Event #${booking.event}`}
                        </p>
                      </div>
                      <StatusBadge status={booking.booking_status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''} · {formatPrice(booking.total_price)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                        >
                          View
                        </button>
                        {canCancel && (
                          <button
                            onClick={() => setCancelBooking(booking)}
                            className="px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Total {totalCount} bookings</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                  >Prev</button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                  >Next</button>
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