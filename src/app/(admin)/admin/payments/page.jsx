'use client';
import { useState, useEffect } from 'react';
import {
  CreditCard, Search, Eye, X, IndianRupee,
  ArrowUpRight, CheckCircle, XCircle, Clock,
  RefreshCw, ShieldCheck, AlertCircle, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PaymentService from '@/services/payment.service';
import { formatDate, formatPrice, getErrorMessage } from '@/lib/utils';

// ── Status Config ──────────────────────────────────────
const statusConfig = {
  success:   { label: 'Success',   bg: 'bg-green-50',  text: 'text-green-700',  icon: CheckCircle },
  pending:   { label: 'Pending',   bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  failed:    { label: 'Failed',    bg: 'bg-red-50',    text: 'text-red-600',    icon: XCircle },
  refunded:  { label: 'Refunded',  bg: 'bg-blue-50',   text: 'text-blue-700',   icon: ArrowUpRight },
  initiated: { label: 'Initiated', bg: 'bg-purple-50', text: 'text-purple-700', icon: RefreshCw },
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

// ── Admin Payment Detail Modal ─────────────────────────
function AdminPaymentDetailModal({ payment, onClose, onUpiAction, onRefundProcess }) {
  const [upiLoading,    setUpiLoading]    = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundRef,     setRefundRef]     = useState('');

  if (!payment) return null;
  const status = payment.payment_status;

  const handleUpiAction = async (action) => {
    setUpiLoading(true);
    await onUpiAction(payment.payment_ref, action);
    setUpiLoading(false);
  };

  const handleRefundProcess = async (action) => {
    if (!refundRef.trim()) {
      toast.error('Refund Ref daalo');
      return;
    }
    setRefundLoading(true);
    await onRefundProcess(refundRef.trim(), action);
    setRefundLoading(false);
    setRefundRef('');
  };

  const rows = [
    { label: 'Payment Ref',  value: payment.payment_ref || '—' },
    { label: 'Booking Ref',  value: payment.booking__booking_ref || '—' },
    { label: 'User Email',   value: payment.user__email || '—' },
    { label: 'Username',     value: payment.user__username || '—' },
    { label: 'Amount',       value: formatPrice(payment.amount) },
    { label: 'Method',       value: payment.method || '—' },
    { label: 'Date',         value: formatDate(payment.created_at) },
    { label: 'Paid At',      value: payment.paid_at ? formatDate(payment.paid_at) : '—' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-bold text-gray-800 text-lg">Payment Detail</h3>
            <StatusBadge status={status} />
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#e94560] p-6 text-center">
          <p className="text-white/60 text-sm mb-1">Total Amount</p>
          <p className="text-4xl font-black text-white">{formatPrice(payment.amount)}</p>
          <p className="text-white/50 text-xs mt-2 capitalize">{payment.method || '—'}</p>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3">
          {rows.map(row => (
            <div key={row.label} className="flex items-start justify-between gap-4">
              <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5 w-28">{row.label}</span>
              <span className="text-xs font-semibold text-gray-700 text-right break-all">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Admin Actions */}
        <div className="px-5 pb-5 space-y-3">

          {/* UPI Confirm/Reject */}
          {payment.method === 'upi' && status === 'pending' && (
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">UPI Verification</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpiAction('confirm')}
                  disabled={upiLoading}
                  className="flex-1 py-2.5 rounded-xl bg-green-50 text-green-700 font-semibold text-sm hover:bg-green-100 transition disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {upiLoading
                    ? <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    : <><ShieldCheck size={14} /> Confirm</>}
                </button>
                <button
                  onClick={() => handleUpiAction('reject')}
                  disabled={upiLoading}
                  className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {upiLoading
                    ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    : <><AlertCircle size={14} /> Reject</>}
                </button>
              </div>
            </div>
          )}

          {/* Refund Process */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Refund Process (Refund Ref se)</p>
            <input
              type="text"
              placeholder="Refund Ref daalo..."
              value={refundRef}
              onChange={e => setRefundRef(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560] mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleRefundProcess('approve')}
                disabled={refundLoading}
                className="flex-1 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {refundLoading
                  ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  : <><CheckCircle size={14} /> Approve</>}
              </button>
              <button
                onClick={() => handleRefundProcess('reject')}
                disabled={refundLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {refundLoading
                  ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  : <><XCircle size={14} /> Reject</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Admin Main Page ────────────────────────────────────
export default function AdminPaymentsPage() {
  const [payments, setPayments]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalCount, setTotalCount]     = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [stats, setStats]               = useState(null);

  useEffect(() => {
    fetchPayments(currentPage);
  }, [currentPage, statusFilter, methodFilter]);

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (statusFilter) params.payment_status = statusFilter;
      if (methodFilter) params.method = methodFilter;

      const [paymentsRes, statsRes] = await Promise.all([
        PaymentService.getAdminPayments(params),
        PaymentService.getAdminStats().catch(() => null),
      ]);

      setPayments(paymentsRes.results || []);
      setTotalPages(paymentsRes.pages || 1);
      setTotalCount(paymentsRes.total || 0);
      setStats(statsRes);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpiAction = async (paymentRef, action) => {
    try {
      await PaymentService.confirmUpiPayment(paymentRef, action);
      toast.success(`Payment ${action}ed!`);
      setSelectedPayment(null);
      fetchPayments(currentPage);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRefundProcess = async (refundRef, action) => {
    try {
      await PaymentService.processRefund(refundRef, action);
      toast.success(`Refund ${action}d!`);
      setSelectedPayment(null);
      fetchPayments(currentPage);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const filteredPayments = payments.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.payment_ref?.toLowerCase().includes(q) ||
      p.booking__booking_ref?.toLowerCase().includes(q) ||
      p.user__email?.toLowerCase().includes(q) ||
      p.user__username?.toLowerCase().includes(q)
    );
  });

  const statCards = [
    { label: 'Total Revenue', value: stats ? formatPrice(stats.total_revenue || 0) : '—', icon: IndianRupee, dark: true },
    { label: 'Successful',    value: stats?.success_count ?? '—', icon: CheckCircle,  bg: 'bg-green-50',  text: 'text-green-700' },
    { label: 'Pending',       value: stats?.pending_count ?? '—', icon: Clock,         bg: 'bg-yellow-50', text: 'text-yellow-700' },
    { label: 'Refunded',      value: stats?.refund_count  ?? '—', icon: ArrowUpRight,  bg: 'bg-blue-50',   text: 'text-blue-700' },
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Payments — Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Platform ke saare transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon;
          return card.dark ? (
            <div key={card.label} className="bg-gradient-to-br from-[#1a1a2e] to-[#e94560] rounded-2xl p-5">
              <Icon size={18} className="text-white/70 mb-3" />
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-xs mt-1 font-medium text-white/60">{card.label}</p>
            </div>
          ) : (
            <div key={card.label} className={`${card.bg} rounded-2xl p-5`}>
              <Icon size={18} className={`${card.text} mb-3`} />
              <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
              <p className={`text-xs mt-1 font-medium ${card.text}`}>{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Payment ref, booking ref, email, username..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
            />
          </div>
          <select
            value={methodFilter}
            onChange={e => { setMethodFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560] bg-white"
          >
            <option value="">All Methods</option>
            <option value="razorpay">Razorpay</option>
            <option value="upi">UPI</option>
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
        ) : filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <CreditCard size={40} className="text-gray-300" />
            <p className="text-gray-400 text-sm">Koi payment nahi mili</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Payment Ref', 'User', 'Booking Ref', 'Amount', 'Method', 'Status', 'Date', ''].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <p className="text-xs font-mono text-gray-600 max-w-[130px] truncate">
                          {payment.payment_ref || `#${payment.id}`}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-700 max-w-[140px] truncate">{payment.user__email || '—'}</p>
                        <p className="text-[10px] text-gray-400">{payment.user__username || ''}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-mono text-gray-400">{payment.booking__booking_ref || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-gray-800">{formatPrice(payment.amount)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                          payment.method === 'upi' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {payment.method || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={payment.payment_status} /></td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-400 whitespace-nowrap">{formatDate(payment.created_at)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredPayments.map(payment => (
                <div
                  key={payment.id}
                  className="p-4 flex items-center justify-between gap-4 active:bg-gray-50"
                  onClick={() => setSelectedPayment(payment)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      payment.payment_status === 'success'  ? 'bg-green-100'  :
                      payment.payment_status === 'failed'   ? 'bg-red-100'    :
                      payment.payment_status === 'refunded' ? 'bg-blue-100'   : 'bg-yellow-100'
                    }`}>
                      <CreditCard size={16} className={
                        payment.payment_status === 'success'  ? 'text-green-600' :
                        payment.payment_status === 'failed'   ? 'text-red-500'   :
                        payment.payment_status === 'refunded' ? 'text-blue-600'  : 'text-yellow-600'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {payment.user__email || payment.user__username || '—'}
                      </p>
                      <p className="text-xs text-gray-400 font-mono truncate">
                        {payment.booking__booking_ref || payment.payment_ref || `#${payment.id}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <p className="font-bold text-gray-800 text-sm">{formatPrice(payment.amount)}</p>
                    <StatusBadge status={payment.payment_status} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Total {totalCount} payments</p>
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

      <AdminPaymentDetailModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onUpiAction={handleUpiAction}
        onRefundProcess={handleRefundProcess}
      />
    </div>
  );
}