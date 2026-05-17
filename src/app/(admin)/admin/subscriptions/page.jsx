// src/app/(admin)/admin/subscriptions/page.jsx
'use client';
import { useEffect, useState } from 'react';
import AdminService from '@/services/admin.service';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Crown, Plus, Pencil, Trash2, Search, Sparkles,
  AlertCircle, CheckCircle, XCircle, Star, Zap,
  Users, Calendar, ToggleLeft, ToggleRight
} from 'lucide-react';

const PLAN_COLORS = {
  free:       { bg: 'from-gray-500 to-gray-700',       badge: 'bg-gray-100 text-gray-700 border-gray-200' },
  basic:      { bg: 'from-blue-500 to-blue-700',       badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  pro:        { bg: 'from-purple-500 to-purple-700',   badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  enterprise: { bg: 'from-amber-500 to-orange-600',   badge: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const DeleteModal = ({ plan, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Plan?</h3>
      <p className="text-sm text-gray-500 text-center mb-6">
        <span className="font-semibold text-gray-700">"{plan?.display_name}"</span> delete hoga.
        Active subscriptions wale plans delete nahi honge.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition">
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default function SubscriptionsPage() {
  const [plans,        setPlans]        = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getPlans();
      const list = Array.isArray(data) ? data : [];
      setPlans(list);
      setFiltered(list);
    } catch (err) {
      toast.error('Plans load nahi ho sake');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(plans.filter(p =>
      p.display_name?.toLowerCase().includes(q) ||
      p.name?.toLowerCase().includes(q) ||
      p.billing_cycle?.toLowerCase().includes(q)
    ));
  }, [search, plans]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(deleteTarget.id);
      await AdminService.deletePlan(deleteTarget.id);
      setPlans(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Plan deleted!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete nahi ho saka');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (plan) => {
    try {
      setActionLoading(plan.id);
      await AdminService.updatePlan(plan.id, { is_active: !plan.is_active });
      setPlans(prev => prev.map(p =>
        p.id === plan.id ? { ...p, is_active: !p.is_active } : p
      ));
      toast.success(plan.is_active ? 'Plan deactivated' : 'Plan activated');
    } catch {
      toast.error('Status update nahi ho saka');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
            <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500" />
          </div>
          <p className="text-gray-500 text-sm mt-4">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown size={16} className="text-yellow-300" />
              <span className="text-xs font-medium text-yellow-200 uppercase tracking-wider">
                Subscription Plans
              </span>
            </div>
            <h2 className="text-2xl font-bold">Plan Management</h2>
            <p className="text-orange-100 text-sm mt-1">
              {plans.length} total plans · {plans.filter(p => p.is_active).length} active
            </p>
          </div>
          <Link
            href="/admin/subscriptions/plans/create"
            className="flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg"
          >
            <Plus size={16} />
            New Plan
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/20">
          {['free', 'basic', 'pro', 'enterprise'].map(name => (
            <div key={name} className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm text-center">
              <p className="text-[10px] text-orange-100 uppercase tracking-wider capitalize">{name}</p>
              <p className="text-lg font-bold mt-0.5">
                {plans.filter(p => p.name === name).length}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition"
            />
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Crown size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No plans found</p>
              {!search && (
                <Link href="/admin/subscriptions/plans/create"
                  className="inline-flex items-center gap-1 mt-3 text-xs text-amber-500 hover:underline">
                  <Plus size={12} /> Create first plan
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {filtered.map(plan => {
                const colors = PLAN_COLORS[plan.name] || PLAN_COLORS.free;
                return (
                  <div key={plan.id}
                    className="relative bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">

                    {/* Popular badge */}
                    {plan.is_popular && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="flex items-center gap-1 px-2 py-1 bg-amber-400 text-white text-[10px] font-bold rounded-full">
                          <Star size={9} fill="white" /> Popular
                        </span>
                      </div>
                    )}

                    {/* Top color bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${colors.bg}`} />

                    <div className="p-4">
                      {/* Plan name + badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                          <Crown size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{plan.display_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize ${colors.badge}`}>
                              {plan.name}
                            </span>
                            <span className="text-[10px] text-gray-400 capitalize">{plan.billing_cycle}</span>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-3">
                        <p className="text-2xl font-black text-gray-900">
                          {plan.price == 0 ? 'Free' : `₹${Number(plan.price).toLocaleString()}`}
                        </p>
                        {plan.price > 0 && (
                          <p className="text-[11px] text-gray-400">per {plan.billing_cycle === 'monthly' ? 'month' : 'year'}</p>
                        )}
                      </div>

                      {/* Key limits */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-2 text-[11px] text-gray-600">
                          <Calendar size={11} className="text-gray-400" />
                          {plan.max_events === -1 ? 'Unlimited events' : `${plan.max_events} events`}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-600">
                          <Users size={11} className="text-gray-400" />
                          {plan.max_attendees_event === -1 ? 'Unlimited attendees' : `${plan.max_attendees_event} attendees/event`}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-600">
                          <Zap size={11} className="text-gray-400" />
                          {plan.max_team_members === -1 ? 'Unlimited team' : plan.max_team_members === 0 ? 'No team members' : `${plan.max_team_members} team members`}
                        </div>
                      </div>

                      {/* Feature pills */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {plan.custom_branding     && <span className="text-[9px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-100">Custom Branding</span>}
                        {plan.payment_gateway     && <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">Payment Gateway</span>}
                        {plan.advanced_analytics  && <span className="text-[9px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full border border-purple-100">Advanced Analytics</span>}
                        {plan.white_label         && <span className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100">White Label</span>}
                        {plan.full_api_access     && <span className="text-[9px] px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-full border border-rose-100">Full API</span>}
                      </div>

                      {/* Status + Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(plan)}
                          disabled={actionLoading === plan.id}
                          className="text-gray-400 hover:text-gray-700 transition disabled:opacity-50"
                          title={plan.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {actionLoading === plan.id
                            ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            : plan.is_active
                              ? <ToggleRight size={20} className="text-emerald-500" />
                              : <ToggleLeft size={20} />
                          }
                        </button>

                        <div className="flex gap-1.5">
                          {/* Edit */}
                          <Link
                            href={`/admin/subscriptions/plans/${plan.id}/edit`}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </Link>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(plan)}
                            disabled={actionLoading === plan.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <DeleteModal
          plan={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}