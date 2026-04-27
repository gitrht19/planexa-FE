'use client';
import { useState, useEffect } from 'react';
import {
  CreditCard, Search, Eye, X,
  TrendingUp, ArrowDownLeft, ArrowUpRight,
  CheckCircle, XCircle, Clock, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import PaymentService from '@/services/payment.service';
import EventService from '@/services/event.service';
import { formatDate, formatPrice, getErrorMessage } from '@/lib/utils';

// ── Status Config ─────────────────────────────────────────
const statusConfig = {
  success:    { label: 'Success',    bg: 'bg-green-50',  text: 'text-green-600',  icon: CheckCircle },
  pending:    { label: 'Pending',    bg: 'bg-yellow-50', text: 'text-yellow-600', icon: Clock },
  failed:     { label: 'Failed',     bg: 'bg-red-50',    text: 'text-red-500',    icon: XCircle },
  refunded:   { label: 'Refunded',   bg: 'bg-blue-50',   text: 'text-blue-600',   icon: ArrowUpRight },
  processing: { label: 'Processing', bg: 'bg-purple-50', text: 'text-purple-600', icon: RefreshCw },
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

// ── Payment Detail Modal ──────────────────────────────────
function PaymentDetailModal({ payment, onClose, onRefund }) {
  const [refunding, setRefunding] = useState(false);

  if (!payment) return null;

  const handleRefund = async () => {
    if (!confirm('Is payment ka refund karna chahte ho?')) return;
    setRefunding(true);
    await onRefund(payment.id);
    setRefunding(false);
  };

  const rows = [
    { label: 'Payment ID',      value: payment.razorpay_payment_id || payment.id },
    { label: 'Order ID',        value: payment.razorpay_order_id || '—' },
    { label: 'Booking Ref',     value: payment.booking_ref || '—' },
    { label: 'Event',           value: payment.event_title || `Event #${payment.event}` },
    { label: 'Amount',          value: formatPrice(payment.amount) },
    { label: 'Method',          value: payment.payment_method || '—' },
    { label: 'Gateway',         value: payment.payment_gateway || 'Razorpay' },
    { label: 'Date',            value: formatDate(payment.created_at) },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Payment Detail</h3>
            <StatusBadge status={payment.status} />
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Amount Hero */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#e94560] p-6 text-center">
          <p className="text-white/60 text-sm mb-1">Amount</p>
          <p className="text-4xl font-black text-white">{formatPrice(payment.amount)}</p>
        </div>

        {/* Details Grid */}
        <div className="p-5 space-y-3">
          {rows.map(row => (
            <div key={row.label} className="flex items-start justify-between gap-4">
              <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{row.label}</span>
              <span className="text-xs font-semibold text-gray-700 text-right break-all">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Refund Button */}
        {payment.status === 'success' && (
          <div className="px-5 pb-5">
            <button
              onClick={handleRefund}
              disabled={refunding}
              className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {refunding
                ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                : <><ArrowUpRight size={15} /> Refund Initiate Karo</>
              }
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [stats, setStats] = useState(null);

  // Load events for filter
  useEffect(() => {
    EventService.getEvents({ page_size: 100 })
      .then(res => setEvents(res.results || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPayments(currentPage);
  }, [currentPage, statusFilter, eventFilter]);

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (statusFilter) params.status = statusFilter;
      if (eventFilter) params.event = eventFilter;

      const [paymentsRes, statsRes] = await Promise.all([
        PaymentService.getAllPayments(params),
        PaymentService.getPaymentStats().catch(() => null),
      ]);

      setPayments(paymentsRes.results || []);
      setPagination(paymentsRes.pagination || null);
      setStats(statsRes);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId) => {
    try {
      await PaymentService.initiateRefund(paymentId);
      toast.success('Refund initiated!');
      setSelectedPayment(null);
      fetchPayments(currentPage);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // Client-side search
  const filteredPayments = payments.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.razorpay_payment_id?.toLowerCase().includes(q) ||
      p.razorpay_order_id?.toLowerCase().includes(q) ||
      p.booking_ref?.toLowerCase().includes(q) ||
      p.event_title?.toLowerCase().includes(q)
    );
  });

  const statusOptions = ['success', 'pending', 'failed', 'refunded', 'processing'];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
        <p className="text-gray-500 text-sm mt-1">Sab transactions ek jagah</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: stats ? formatPrice(stats.total_revenue || 0) : '—',
            icon: TrendingUp,
            color: 'from-[#1a1a2e] to-[#e94560]',
            light: false,
          },
          {
            label: 'Successful',
            value: stats?.success_count ?? payments.filter(p => p.status === 'success').length,
            icon: CheckCircle,
            color: 'bg-green-50',
            text: 'text-green-600',
            light: true,
          },
          {
            label: 'Pending',
            value: stats?.pending_count ?? payments.filter(p => p.status === 'pending').length,
            icon: Clock,
            color: 'bg-yellow-50',
            text: 'text-yellow-600',
            light: true,
          },
          {
            label: 'Refunded',
            value: stats?.refund_count ?? payments.filter(p => p.status === 'refunded').length,
            icon: ArrowUpRight,
            color: 'bg-blue-50',
            text: 'text-blue-600',
            light: true,
          },
        ].map(stat => {
          const Icon = stat.icon;
          return stat.light ? (
            <div key={stat.label} className={`${stat.color} rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} className={stat.text} />
              </div>
              <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
              <p className={`text-xs mt-1 font-medium ${stat.text}`}>{stat.label}</p>
            </div>
          ) : (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} className="text-white/70" />
                <ArrowDownLeft size={14} className="text-white/40" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs mt-1 font-medium text-white/60">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Payment ID, order ID, booking ref..."
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

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <CreditCard size={40} className="text-gray-300" />
            <p className="text-gray-400 text-sm">Koi payment nahi mili</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Payment ID', 'Event', 'Booking Ref', 'Amount', 'Method', 'Status', 'Date', ''].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition">

                      {/* Payment ID */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-mono text-gray-500 max-w-[120px] truncate">
                          {payment.razorpay_payment_id || `#${payment.id}`}
                        </p>
                      </td>

                      {/* Event */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700 max-w-[140px] truncate">
                          {payment.event_title || `Event #${payment.event}`}
                        </p>
                      </td>

                      {/* Booking Ref */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-mono text-gray-500">
                          {payment.booking_ref || '—'}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-gray-800">
                          {formatPrice(payment.amount)}
                        </p>
                      </td>

                      {/* Method */}
                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-500 capitalize">
                          {payment.payment_method || '—'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={payment.status} />
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(payment.created_at)}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"
                          title="View Detail"
                        >
                          <Eye size={15} />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredPayments.map(payment => (
                <div
                  key={payment.id}
                  className="p-4 flex items-center justify-between gap-4"
                  onClick={() => setSelectedPayment(payment)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      payment.status === 'success' ? 'bg-green-100' :
                      payment.status === 'failed' ? 'bg-red-100' :
                      payment.status === 'refunded' ? 'bg-blue-100' : 'bg-yellow-100'
                    }`}>
                      <CreditCard size={16} className={
                        payment.status === 'success' ? 'text-green-600' :
                        payment.status === 'failed' ? 'text-red-500' :
                        payment.status === 'refunded' ? 'text-blue-600' : 'text-yellow-600'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {payment.event_title || `Event #${payment.event}`}
                      </p>
                      <p className="text-xs text-gray-400 font-mono truncate">
                        {payment.booking_ref || payment.razorpay_payment_id || `#${payment.id}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-800 text-sm">{formatPrice(payment.amount)}</p>
                    <StatusBadge status={payment.status} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Total {pagination.total} payments</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={!pagination.previous}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">
                    {pagination.current_page} / {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!pagination.next}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <PaymentDetailModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onRefund={handleRefund}
      />

    </div>
  );
}