// src/app/(admin)/admin/organizers/[id]/subscription/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminService from '@/services/admin.service';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Crown, ArrowLeft, Building2, CheckCircle, XCircle,
  Calendar, Users, Zap, RefreshCw, AlertCircle,
  Clock, TrendingUp, Shield, Star, Sparkles
} from 'lucide-react';

const PLAN_COLORS = {
  free:       { bg: 'from-gray-500 to-gray-700',     light: 'bg-gray-50 border-gray-200',     text: 'text-gray-700',   badge: 'bg-gray-100 text-gray-600' },
  basic:      { bg: 'from-blue-500 to-blue-700',     light: 'bg-blue-50 border-blue-200',     text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-600' },
  pro:        { bg: 'from-purple-500 to-purple-700', light: 'bg-purple-50 border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-600' },
  enterprise: { bg: 'from-amber-500 to-orange-600',  light: 'bg-amber-50 border-amber-200',   text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-600' },
};

const STATUS_COLORS = {
  active:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  expired:   'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  trial:     'bg-blue-100 text-blue-700 border-blue-200',
};

// ── Assign Modal ─────────────────────────────────────────────
const AssignModal = ({ plans, currentPlanId, onAssign, onClose }) => {
  const [selected,     setSelected]     = useState(currentPlanId || null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [amountPaid,   setAmountPaid]   = useState('');
  const [startDate,    setStartDate]    = useState(new Date().toISOString().split('T')[0]);
  const [notes,        setNotes]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const filteredPlans = plans.filter(p => p.billing_cycle === billingCycle && p.is_active);
  const selectedPlan  = plans.find(p => p.id === selected);

  const handleAssign = async () => {
    if (!selected) { toast.error('Plan select karo'); return; }
    try {
      setLoading(true);
      await onAssign({
        plan:       selected,
        start_date: startDate,
        amount_paid: amountPaid || selectedPlan?.price || 0,
        notes,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-5 rounded-t-2xl text-white sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown size={20} className="text-yellow-300" />
              <div>
                <h3 className="font-bold text-lg">Assign Subscription Plan</h3>
                <p className="text-purple-200 text-xs mt-0.5">Select a plan for this organizer</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition">
              <XCircle size={22} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Billing Cycle Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {['monthly', 'yearly'].map(cycle => (
              <button
                key={cycle}
                onClick={() => { setBillingCycle(cycle); setSelected(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition
                  ${billingCycle === cycle
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {cycle}
                {cycle === 'yearly' && (
                  <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">
                    Save 20%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPlans.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-400">
                <Crown size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No {billingCycle} plans available</p>
              </div>
            ) : (
              filteredPlans.map(plan => {
                const colors     = PLAN_COLORS[plan.name] || PLAN_COLORS.free;
                const isSelected = selected === plan.id;
                const isCurrent  = currentPlanId === plan.id;

                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelected(plan.id)}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all
                      ${isSelected
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                  >
                    {isCurrent && (
                      <span className="absolute top-2 right-2 text-[9px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">
                        Current
                      </span>
                    )}
                    {plan.is_popular && !isCurrent && (
                      <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">
                        <Star size={8} fill="currentColor" /> Popular
                      </span>
                    )}

                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                        <Crown size={12} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{plan.display_name}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${colors.badge}`}>
                          {plan.name}
                        </span>
                      </div>
                    </div>

                    <p className="text-xl font-black text-gray-900 mb-1">
                      {plan.price == 0 ? 'Free' : `₹${Number(plan.price).toLocaleString()}`}
                    </p>

                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Calendar size={9} />
                        {plan.max_events === -1 ? 'Unlimited' : plan.max_events} events
                      </p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Users size={9} />
                        {plan.max_attendees_event === -1 ? 'Unlimited' : plan.max_attendees_event} attendees/event
                      </p>
                    </div>

                    {isSelected && (
                      <CheckCircle size={16} className="absolute bottom-3 right-3 text-purple-500" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Additional Fields */}
          {selected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
                <input
                  type="date" value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Amount Paid (₹)
                  <span className="text-gray-400 font-normal ml-1 text-xs">
                    (default: ₹{selectedPlan?.price || 0})
                  </span>
                </label>
                <input
                  type="number" value={amountPaid}
                  onChange={e => setAmountPaid(e.target.value)}
                  placeholder={selectedPlan?.price || '0'}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  rows={2} placeholder="e.g. Special discount, trial period..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition resize-none"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selected || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 transition"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Crown size={15} />
              }
              {loading ? 'Assigning...' : 'Assign Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Cancel Modal ─────────────────────────────────────────────
const CancelModal = ({ subscription, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm(reason);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Cancel Subscription?</h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          Organizer ka access immediately restricted ho jaayega.
        </p>
        <textarea
          value={reason} onChange={e => setReason(e.target.value)}
          placeholder="Cancellation reason (optional)..."
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 mb-4 resize-none"
        />
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            Keep
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Cancel Subscription'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
export default function OrganizerSubscriptionPage() {
  const params = useParams();
  const orgId  = params?.id;

  const [organizer,     setOrganizer]     = useState(null);
  const [subscription,  setSubscription]  = useState(null);
  const [plans,         setPlans]         = useState([]);
  const [history,       setHistory]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showAssign,    setShowAssign]    = useState(false);
  const [showCancel,    setShowCancel]    = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orgs, plansData, historyData] = await Promise.all([
        AdminService.getOrganizers(),
        AdminService.getPlans(),
        AdminService.getSubHistory(orgId),
      ]);

      const org = Array.isArray(orgs) ? orgs.find(o => String(o.id) === String(orgId)) : null;
      setOrganizer(org);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setHistory(Array.isArray(historyData) ? historyData : []);

      // Subscription — 404 aaye toh null set karo
      try {
        const subData = await AdminService.getOrgSubscription(orgId);
        setSubscription(subData);
      } catch {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Data load nahi ho saka');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [orgId]);

  const handleAssign = async (data) => {
    try {
      await AdminService.assignSubscription({ organizer: orgId, ...data });
      toast.success('Plan assign ho gaya!');
      await fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Assign nahi ho saka');
      throw err;
    }
  };

  const handleCancel = async (reason) => {
    try {
      await AdminService.cancelSubscription(subscription.id, reason);
      toast.success('Subscription cancel ho gaya');
      setShowCancel(false);
      await fetchData();
    } catch {
      toast.error('Cancel nahi ho saka');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin" />
            <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500" />
          </div>
          <p className="text-gray-500 text-sm mt-4">Loading subscription...</p>
        </div>
      </div>
    );
  }

  const currentPlan   = subscription?.plan_detail;
  const planColors    = currentPlan ? (PLAN_COLORS[currentPlan.name] || PLAN_COLORS.free) : null;
  const statusColor   = subscription ? (STATUS_COLORS[subscription.subscription_status] || STATUS_COLORS.active) : null;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-900 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />

        <div className="relative p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/organizers"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white">
                <ArrowLeft size={18} />
              </Link>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={14} className="text-pink-300" />
                  <span className="text-xs font-semibold text-pink-300 uppercase tracking-wider">
                    {organizer?.name || `Organizer #${orgId}`}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">Subscription Management</h2>
                <p className="text-purple-100 text-sm mt-1">
                  Is organizer ke liye subscription plan manage karo
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={fetchData}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/30 transition">
                <RefreshCw size={14} />
                Refresh
              </button>
              <button onClick={() => setShowAssign(true)}
                className="flex items-center gap-2 bg-white text-purple-700 hover:bg-purple-50 px-5 py-2 rounded-xl text-sm font-semibold transition shadow-lg">
                <Crown size={14} />
                {subscription ? 'Change Plan' : 'Assign Plan'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Current Subscription Card ── */}
      {subscription ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-amber-500" />
              <h3 className="font-bold text-gray-900">Current Subscription</h3>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${statusColor}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {subscription.subscription_status}
            </span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Plan Info */}
              <div className={`lg:col-span-1 rounded-2xl border p-5 ${planColors?.light}`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${planColors?.bg} flex items-center justify-center mb-4 shadow-lg`}>
                  <Crown size={22} className="text-white" />
                </div>
                <p className="text-xl font-black text-gray-900">{currentPlan?.display_name}</p>
                <span className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${planColors?.badge}`}>
                  {currentPlan?.name} · {currentPlan?.billing_cycle}
                </span>
                <p className="text-2xl font-black text-gray-900 mt-3">
                  {currentPlan?.price == 0 ? 'Free' : `₹${Number(currentPlan?.price).toLocaleString()}`}
                </p>
                {currentPlan?.price > 0 && (
                  <p className="text-xs text-gray-500">per {currentPlan?.billing_cycle === 'monthly' ? 'month' : 'year'}</p>
                )}
              </div>

              {/* Details */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {[
                  { label: 'Start Date',    value: subscription.start_date     ? new Date(subscription.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—', icon: Calendar },
                  { label: 'End Date',      value: subscription.end_date       ? new Date(subscription.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No expiry', icon: Clock },
                  { label: 'Days Remaining', value: subscription.days_remaining != null ? `${subscription.days_remaining} days` : 'N/A', icon: TrendingUp },
                  { label: 'Amount Paid',   value: `₹${Number(subscription.amount_paid || 0).toLocaleString()}`, icon: Shield },
                  { label: 'Max Events',    value: currentPlan?.max_events === -1 ? 'Unlimited' : currentPlan?.max_events, icon: Zap },
                  { label: 'Max Attendees', value: currentPlan?.max_attendees_event === -1 ? 'Unlimited' : `${currentPlan?.max_attendees_event}/event`, icon: Users },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <item.icon size={12} className="text-gray-400" />
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.label}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {subscription.notes && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700"><span className="font-semibold">Notes:</span> {subscription.notes}</p>
              </div>
            )}

            {/* Actions */}
            {subscription.subscription_status === 'active' && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowCancel(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition"
                >
                  <XCircle size={14} />
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // No subscription
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown size={28} className="text-purple-300" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-500 text-sm mb-6">Is organizer ko abhi koi plan assign nahi kiya gaya.</p>
          <button onClick={() => setShowAssign(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition">
            <Crown size={15} />
            Assign Plan
          </button>
        </div>
      )}

      {/* ── Subscription History ── */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <h3 className="font-bold text-gray-900">Subscription History</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {history.map(h => {
              const colors = PLAN_COLORS[h.plan_detail?.name] || PLAN_COLORS.free;
              const actionColors = {
                subscribed:  'bg-emerald-100 text-emerald-700',
                upgraded:    'bg-blue-100 text-blue-700',
                downgraded:  'bg-orange-100 text-orange-700',
                cancelled:   'bg-red-100 text-red-700',
                renewed:     'bg-purple-100 text-purple-700',
              };
              return (
                <div key={h.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    <Crown size={13} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{h.plan_detail?.display_name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${actionColors[h.action] || 'bg-gray-100 text-gray-600'}`}>
                        {h.action}
                      </span>
                    </div>
                    {h.note && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{h.note}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">₹{Number(h.amount || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showAssign && (
        <AssignModal
          plans={plans}
          currentPlanId={subscription?.plan}
          onAssign={handleAssign}
          onClose={() => setShowAssign(false)}
        />
      )}

      {showCancel && (
        <CancelModal
          subscription={subscription}
          onConfirm={handleCancel}
          onCancel={() => setShowCancel(false)}
        />
      )}
    </div>
  );
}