// src/app/(dashboard)/subscription/page.jsx
'use client';
import { useEffect, useState } from 'react';
import SubscriptionService from '@/services/subscription.service';
import Link from 'next/link';
import {
  Crown, Zap, CheckCircle, XCircle, Calendar,
  Clock, TrendingUp, Users, Shield, Star,
  RefreshCw, AlertCircle, Sparkles, ChevronRight
} from 'lucide-react';

const PLAN_COLORS = {
  free:       { gradient: 'from-gray-500 to-gray-700',     light: 'from-gray-50 to-gray-100',     accent: 'text-gray-600',   border: 'border-gray-200' },
  basic:      { gradient: 'from-blue-500 to-blue-700',     light: 'from-blue-50 to-indigo-50',     accent: 'text-blue-600',   border: 'border-blue-200' },
  pro:        { gradient: 'from-purple-500 to-purple-700', light: 'from-purple-50 to-pink-50',     accent: 'text-purple-600', border: 'border-purple-200' },
  enterprise: { gradient: 'from-amber-500 to-orange-600',  light: 'from-amber-50 to-orange-50',    accent: 'text-amber-600',  border: 'border-amber-200' },
};

const STATUS_CONFIG = {
  active:    { label: 'Active',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  expired:   { label: 'Expired',   color: 'bg-red-100 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  trial:     { label: 'Trial',     color: 'bg-blue-100 text-blue-700 border-blue-200' },
};

const FeatureItem = ({ label, enabled }) => (
  <div className="flex items-center gap-2.5 py-1.5">
    {enabled
      ? <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
      : <XCircle    size={14} className="text-gray-300 flex-shrink-0" />
    }
    <span className={`text-sm ${enabled ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
  </div>
);

const UsageBar = ({ label, used, limit, unlimited }) => {
  const percent = unlimited || limit === -1 ? 0 : limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isHigh  = percent >= 80;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-500">
          {unlimited || limit === -1
            ? <span className="text-emerald-600 font-semibold">Unlimited</span>
            : `${used} / ${limit}`
          }
        </span>
      </div>
      {!unlimited && limit !== -1 && (
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'bg-rose-500' : 'bg-emerald-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      {(unlimited || limit === -1) && (
        <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [usage,        setUsage]        = useState(null);
  const [plans,        setPlans]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('current'); // 'current' | 'plans'
  const [billingTab, setBillingTab] = useState('monthly');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData] = await Promise.all([
        SubscriptionService.getPlans(),
      ]);
      setPlans(Array.isArray(plansData) ? plansData : []);

      try {
        const [subData, usageData] = await Promise.all([
          SubscriptionService.getMySubscription(),
          SubscriptionService.getUsage(),
        ]);
        setSubscription(subData);
        setUsage(usageData);
      } catch {
        setSubscription(null);
        setUsage(null);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
          <Sparkles size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500" />
        </div>
      </div>
    );
  }

  const currentPlan   = subscription?.plan_detail;
  const planColors    = currentPlan ? (PLAN_COLORS[currentPlan.name] || PLAN_COLORS.free) : null;
  const statusConfig  = subscription ? (STATUS_CONFIG[subscription.subscription_status] || STATUS_CONFIG.active) : null;

  // Group plans by type for display
  const monthlyPlans = plans.filter(p => p.billing_cycle === 'monthly');
  const yearlyPlans  = plans.filter(p => p.billing_cycle === 'yearly');
  const displayPlans = billingTab === 'monthly' ? monthlyPlans : yearlyPlans;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Subscription</h1>
          <p className="text-gray-500 text-xs mt-0.5">Apna plan manage karo</p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-medium transition">
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex bg-gray-100 rounded-xl p-1 max-w-xs">
        {[
          { key: 'current', label: 'Current Plan' },
          { key: 'plans',   label: 'All Plans' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
              ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TAB 1: Current Plan
      ══════════════════════════════════════════ */}
      {activeTab === 'current' && (
        <div className="space-y-5">
          {subscription && currentPlan ? (
            <>
              {/* Current Plan Hero */}
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${planColors.gradient} p-6 text-white shadow-xl`}>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl" />

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Crown size={16} className="text-yellow-300" />
                      <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                        Current Plan
                      </span>
                    </div>
                    <h2 className="text-2xl font-black">{currentPlan.display_name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {statusConfig.label}
                      </span>
                      {subscription.days_remaining != null && (
                        <span className="text-white/70 text-xs flex items-center gap-1">
                          <Clock size={11} />
                          {subscription.days_remaining} days remaining
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black">
                      {currentPlan.price == 0 ? 'Free' : `₹${Number(currentPlan.price).toLocaleString()}`}
                    </p>
                    {currentPlan.price > 0 && (
                      <p className="text-white/60 text-sm">per {currentPlan.billing_cycle === 'monthly' ? 'month' : 'year'}</p>
                    )}
                  </div>
                </div>

                {/* Date info */}
                <div className="relative mt-5 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-wider">Start Date</p>
                    <p className="text-sm font-semibold mt-0.5">
                      {subscription.start_date
                        ? new Date(subscription.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-wider">End Date</p>
                    <p className="text-sm font-semibold mt-0.5">
                      {subscription.end_date
                        ? new Date(subscription.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'No expiry'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-wider">Billing</p>
                    <p className="text-sm font-semibold capitalize mt-0.5">{currentPlan.billing_cycle}</p>
                  </div>
                </div>
              </div>

              {/* Usage + Features Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Usage */}
                {usage && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp size={16} className="text-rose-500" />
                      <h3 className="font-bold text-gray-900">Usage</h3>
                    </div>
                    <div className="space-y-4">
                      <UsageBar
                        label="Active Events"
                        used={usage.usage?.events?.used || 0}
                        limit={usage.usage?.events?.limit}
                        unlimited={usage.usage?.events?.unlimited}
                      />
                      <UsageBar
                        label="Attendees per Event"
                        used={0}
                        limit={usage.usage?.attendees_per_event?.limit}
                        unlimited={usage.usage?.attendees_per_event?.unlimited}
                      />
                      <UsageBar
                        label="Team Members"
                        used={0}
                        limit={usage.usage?.team_members?.limit}
                        unlimited={usage.usage?.team_members?.unlimited}
                      />
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={16} className="text-purple-500" />
                    <h3 className="font-bold text-gray-900">Features</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    {[
                      { label: 'Custom Branding',     key: 'custom_branding' },
                      { label: 'White Label',          key: 'white_label' },
                      { label: 'Custom Domain',        key: 'custom_domain' },
                      { label: 'Discount Coupons',     key: 'discount_coupons' },
                      { label: 'QR Check-in',          key: 'qr_checkin' },
                      { label: 'Email Automation',     key: 'email_automation' },
                      { label: 'Payment Gateway',      key: 'payment_gateway' },
                      { label: 'Basic Analytics',      key: 'basic_analytics' },
                      { label: 'Advanced Analytics',   key: 'advanced_analytics' },
                      { label: 'Export Reports',       key: 'export_reports' },
                      { label: 'Full API Access',      key: 'full_api_access' },
                      { label: 'Priority Support',     key: 'priority_support' },
                    ].map(f => (
                      <FeatureItem
                        key={f.key}
                        label={f.label}
                        enabled={usage?.features?.[f.key] ?? currentPlan?.[f.key] ?? false}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Upgrade CTA */}
              {currentPlan.name !== 'enterprise' && (
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                      <Zap size={18} className="text-rose-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Unlock more features</p>
                      <p className="text-gray-500 text-xs mt-0.5">Upgrade your plan to get advanced features</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('plans')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition shadow-md shadow-rose-500/25">
                    View Plans <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            // No subscription
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown size={28} className="text-amber-400" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">No Active Plan</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                Abhi koi plan active nahi hai. Neeche se plan select karo ya admin se contact karo.
              </p>
              <button onClick={() => setActiveTab('plans')}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition">
                <Crown size={15} /> View Plans
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 2: All Plans
      ══════════════════════════════════════════ */}
      {activeTab === 'plans' && (
        <div className="space-y-5">
          {/* Billing Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 max-w-xs mx-auto">
            {['monthly', 'yearly'].map(cycle => (
              <button key={cycle} onClick={() => setBillingTab(cycle)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition
                  ${billingTab === cycle ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {displayPlans.map(plan => {
              const colors    = PLAN_COLORS[plan.name] || PLAN_COLORS.free;
              const isCurrent = currentPlan?.id === plan.id;

              return (
                <div key={plan.id}
                  className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-lg
                    ${isCurrent ? 'border-emerald-400 shadow-emerald-100 shadow-lg' : plan.is_popular ? 'border-purple-300' : 'border-gray-100'}`}>

                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-[10px] font-bold text-center py-1 tracking-wider uppercase">
                      ✓ Current Plan
                    </div>
                  )}
                  {plan.is_popular && !isCurrent && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold text-center py-1 tracking-wider uppercase flex items-center justify-center gap-1">
                      <Star size={9} fill="white" /> Most Popular
                    </div>
                  )}

                  <div className={`h-1.5 bg-gradient-to-r ${colors.gradient} ${(isCurrent || plan.is_popular) ? 'mt-6' : ''}`} />

                  <div className="p-5">
                    {/* Plan Name */}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-3 shadow-md`}>
                      <Crown size={18} className="text-white" />
                    </div>
                    <p className="font-black text-gray-900 text-lg">{plan.display_name}</p>
                    <p className="text-2xl font-black text-gray-900 mt-2">
                      {plan.price == 0 ? 'Free' : `₹${Number(plan.price).toLocaleString()}`}
                    </p>
                    {plan.price > 0 && (
                      <p className="text-xs text-gray-400">per {plan.billing_cycle === 'monthly' ? 'month' : 'year'}</p>
                    )}

                    {plan.description && (
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{plan.description}</p>
                    )}

                    {/* Key limits */}
                    <div className="mt-4 space-y-2 pb-4 border-b border-gray-50">
                      {[
                        { label: plan.max_events === -1 ? 'Unlimited events' : `${plan.max_events} events` },
                        { label: plan.max_attendees_event === -1 ? 'Unlimited attendees' : `${plan.max_attendees_event} attendees/event` },
                        { label: plan.max_team_members === -1 ? 'Unlimited team' : plan.max_team_members === 0 ? 'No team members' : `${plan.max_team_members} team members` },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle size={11} className="text-emerald-500 flex-shrink-0" />
                          {item.label}
                        </div>
                      ))}
                    </div>

                    {/* Feature highlights */}
                    <div className="mt-3 space-y-1.5">
                      {[
                        plan.custom_branding     && 'Custom Branding',
                        plan.payment_gateway     && 'Payment Gateway',
                        plan.advanced_analytics  && 'Advanced Analytics',
                        plan.white_label         && 'White Label',
                        plan.full_api_access     && 'Full API Access',
                        plan.priority_support    && 'Priority Support',
                      ].filter(Boolean).slice(0, 4).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle size={11} className="text-emerald-500 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-5">
                      {isCurrent ? (
                        <div className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-semibold text-center border border-emerald-200">
                          ✓ Active Plan
                        </div>
                      ) : (
                        <div className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-500 text-sm font-medium text-center border border-gray-200 flex items-center justify-center gap-1">
                          <AlertCircle size={13} />
                          Contact Admin to Upgrade
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact note */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 text-sm font-semibold">Plan upgrade ke liye admin se contact karo</p>
              <p className="text-amber-600 text-xs mt-0.5">
                Plan change karne ke liye apne system administrator ko request bhejo.
                Woh aapke account pe plan assign kar denge.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}