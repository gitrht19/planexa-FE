'use client';
import { useState, useEffect } from 'react';
import { Crown, Check, Zap, X, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import SubscriptionService from '@/services/subscription.service';
import PaymentService from '@/services/payment.service';
import { formatDate, formatPrice, getErrorMessage } from '@/lib/utils';

// ── Plan Card ─────────────────────────────────────────────
function PlanCard({ plan, currentPlan, billingCycle, onSelect, loading }) {
  const isCurrentPlan = currentPlan?.plan_detail?.name === plan.name;
  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  const isFree = plan.price_monthly == 0;
  const isPopular = plan.name === 'pro';

  const features = [
    {
      label: `${plan.max_events_per_month === -1 ? 'Unlimited' : plan.max_events_per_month} events/month`,
      included: true
    },
    {
      label: `${plan.max_tickets_per_event === -1 ? 'Unlimited' : plan.max_tickets_per_event} tickets/event`,
      included: true
    },
    {
      label: `${plan.max_team_members === -1 ? 'Unlimited' : plan.max_team_members} team members`,
      included: true
    },
    { label: 'Custom domain', included: plan.custom_domain },
    { label: 'Analytics', included: plan.analytics },
    { label: 'Priority support', included: plan.priority_support },
  ];

  return (
    <div className={`relative bg-white rounded-2xl border-2 transition-all ${
      isCurrentPlan
        ? 'border-[#e94560] shadow-lg shadow-red-100'
        : isPopular
        ? 'border-[#1a1a2e] shadow-lg'
        : 'border-gray-100 shadow-sm hover:border-gray-200'
    }`}>

      {/* Popular Badge */}
      {isPopular && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-[#1a1a2e] text-white text-xs font-bold px-4 py-1 rounded-full">
            POPULAR
          </span>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-[#e94560] text-white text-xs font-bold px-4 py-1 rounded-full">
            CURRENT PLAN
          </span>
        </div>
      )}

      <div className="p-6">

        {/* Plan Name + Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            plan.name === 'enterprise' ? 'bg-yellow-100' :
            plan.name === 'pro' ? 'bg-[#1a1a2e]' :
            plan.name === 'basic' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Crown size={18} className={
              plan.name === 'enterprise' ? 'text-yellow-600' :
              plan.name === 'pro' ? 'text-white' :
              plan.name === 'basic' ? 'text-blue-600' : 'text-gray-500'
            } />
          </div>
          <div>
            <p className="font-bold text-gray-800 capitalize">{plan.display_name}</p>
            {plan.description && (
              <p className="text-xs text-gray-400">{plan.description}</p>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          {isFree ? (
            <p className="text-3xl font-bold text-gray-800">Free</p>
          ) : (
            <>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-gray-800">
                  ₹{parseFloat(price).toLocaleString('en-IN')}
                </span>
                <span className="text-gray-400 text-sm mb-1">
                  /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>
              {billingCycle === 'yearly' && plan.yearly_savings > 0 && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  💰 ₹{parseFloat(plan.yearly_savings).toLocaleString('en-IN')} bachega yearly
                </p>
              )}
              {billingCycle === 'monthly' && plan.yearly_discount_percent > 0 && (
                <p className="text-xs text-blue-500 mt-1">
                  Yearly pe {plan.yearly_discount_percent}% off
                </p>
              )}
            </>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2.5 mb-6">
          {features.map(feature => (
            <div key={feature.label} className="flex items-center gap-2.5">
              {feature.included ? (
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-green-600" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <X size={10} className="text-gray-400" />
                </div>
              )}
              <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                {feature.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => !isCurrentPlan && !isFree && onSelect(plan)}
          disabled={isCurrentPlan || loading}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-400 cursor-default'
              : isFree
              ? 'bg-gray-100 text-gray-500 cursor-default'
              : isPopular
              ? 'bg-[#1a1a2e] text-white hover:bg-[#2a2a4e]'
              : 'bg-[#e94560] text-white hover:bg-[#d63651]'
          }`}
        >
          {isCurrentPlan ? 'Current Plan' :
           isFree ? 'Default Plan' :
           currentPlan ? 'Upgrade' : 'Subscribe'}
        </button>

      </div>
    </div>
  );
}

// ── Payment Modal ─────────────────────────────────────────
function PaymentModal({ plan, billingCycle, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const price = billingCycle === 'monthly' ? plan?.price_monthly : plan?.price_yearly;

  const handleRazorpay = async () => {
    setLoading(true);
    try {
      const orderData = await SubscriptionService.createPayment(plan.id, billingCycle);

      PaymentService.openRazorpayCheckout(
        orderData,
        async (paymentResponse) => {
          try {
            await SubscriptionService.verifyPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              plan_id: plan.id,
              billing_cycle: billingCycle,
            });
            toast.success(`${plan.display_name} plan activated!`);
            onSuccess();
            onClose();
          } catch (err) {
            toast.error(getErrorMessage(err));
          }
        },
        (err) => toast.error(err || 'Payment cancelled')
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg">Subscription Confirm</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Plan Summary */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800">{plan.display_name} Plan</p>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium capitalize">
              {billingCycle}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm text-gray-500">Total Amount</span>
            <span className="text-xl font-bold text-gray-800">
              ₹{parseFloat(price).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Razorpay Button */}
        <button
          onClick={handleRazorpay}
          disabled={loading}
          className="w-full bg-[#e94560] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#d63651] transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><Zap size={16} /> Pay with Razorpay</>
          }
        </button>

        <p className="text-center text-xs text-gray-400">
          Secure payment powered by Razorpay
        </p>

      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [usage, setUsage] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subRes, usageRes] = await Promise.all([
        SubscriptionService.getPlans(),
        SubscriptionService.getMySubscription().catch(() => null),
        SubscriptionService.getUsage().catch(() => null),
      ]);
      setPlans(plansRes.results || plansRes || []);
      setCurrentSub(subRes?.subscription || null);
      setUsage(usageRes || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Razorpay script load karo
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    fetchData();
    return () => document.body.removeChild(script);
  }, []);

  const handleCancel = async () => {
    if (!confirm('Subscription cancel karna chahte ho? Current period tak access rahega.')) return;
    setCancelling(true);
    try {
      await SubscriptionService.cancelSubscription();
      toast.success('Subscription cancelled.');
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Subscription</h1>
        <p className="text-gray-500 text-sm mt-1">Plan upgrade karo — more events, more features</p>
      </div>

      {/* Current Subscription Card */}
      {currentSub && (
        <div className={`rounded-2xl p-6 ${
          currentSub.plan_detail?.name === 'free'
            ? 'bg-gray-50 border border-gray-200'
            : 'bg-gradient-to-r from-[#1a1a2e] to-[#e94560]'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown size={18} className={currentSub.plan_detail?.name === 'free' ? 'text-gray-500' : 'text-yellow-300'} />
                <p className={`font-bold text-lg ${currentSub.plan_detail?.name === 'free' ? 'text-gray-800' : 'text-white'}`}>
                  {currentSub.plan_detail?.display_name} Plan
                </p>
              </div>
              <p className={`text-sm ${currentSub.plan_detail?.name === 'free' ? 'text-gray-500' : 'text-white/70'}`}>
                {currentSub.is_active ? (
                  <>Active · {currentSub.days_remaining} days remaining</>
                ) : 'Expired'}
              </p>
            </div>

            {/* Cancel Button */}
            {currentSub.plan_detail?.name !== 'free' && currentSub.status !== 'cancelled' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="text-xs text-white/70 hover:text-white border border-white/30 px-3 py-1.5 rounded-lg transition"
              >
                {cancelling ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
          </div>

          {/* Usage Stats */}
          {usage && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Events',
                  used: usage.usage?.events?.used,
                  limit: usage.usage?.events?.limit,
                  remaining: usage.usage?.events?.remaining,
                },
              ].map(stat => (
                <div key={stat.label} className={`rounded-xl p-3 ${currentSub.plan_detail?.name === 'free' ? 'bg-white' : 'bg-white/10'}`}>
                  <p className={`text-xs mb-1 ${currentSub.plan_detail?.name === 'free' ? 'text-gray-400' : 'text-white/60'}`}>
                    {stat.label} This Month
                  </p>
                  <p className={`font-bold ${currentSub.plan_detail?.name === 'free' ? 'text-gray-800' : 'text-white'}`}>
                    {stat.used}
                    <span className={`text-xs font-normal ml-1 ${currentSub.plan_detail?.name === 'free' ? 'text-gray-400' : 'text-white/60'}`}>
                      / {stat.limit === -1 ? '∞' : stat.limit}
                    </span>
                  </p>
                </div>
              ))}

              <div className={`rounded-xl p-3 ${currentSub.plan_detail?.name === 'free' ? 'bg-white' : 'bg-white/10'}`}>
                <p className={`text-xs mb-1 ${currentSub.plan_detail?.name === 'free' ? 'text-gray-400' : 'text-white/60'}`}>
                  Tickets/Event
                </p>
                <p className={`font-bold ${currentSub.plan_detail?.name === 'free' ? 'text-gray-800' : 'text-white'}`}>
                  {usage.usage?.tickets_per_event?.limit === 'unlimited' ? '∞' : usage.usage?.tickets_per_event?.limit}
                </p>
              </div>

              <div className={`rounded-xl p-3 ${currentSub.plan_detail?.name === 'free' ? 'bg-white' : 'bg-white/10'}`}>
                <p className={`text-xs mb-1 ${currentSub.plan_detail?.name === 'free' ? 'text-gray-400' : 'text-white/60'}`}>
                  Team Members
                </p>
                <p className={`font-bold ${currentSub.plan_detail?.name === 'free' ? 'text-gray-800' : 'text-white'}`}>
                  {usage.usage?.team_members?.limit === 'unlimited' ? '∞' : usage.usage?.team_members?.limit}
                </p>
              </div>
            </div>
          )}

          {/* Cancelled Warning */}
          {currentSub.status === 'cancelled' && (
            <div className="mt-4 flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl text-sm">
              <AlertCircle size={14} />
              Subscription cancelled — {formatDate(currentSub.current_period_end)} tak access rahega
            </div>
          )}
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Yearly
            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">
              20% OFF
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={currentSub}
            billingCycle={billingCycle}
            onSelect={setSelectedPlan}
            loading={loading}
          />
        ))}
      </div>

      {/* Features Comparison */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Full Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Feature</th>
                {plans.map(plan => (
                  <th key={plan.id} className="text-center px-4 py-4 text-sm font-semibold text-gray-700 capitalize">
                    {plan.display_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                {
                  label: 'Events/month',
                  getValue: p => p.max_events_per_month === -1 ? '∞' : p.max_events_per_month
                },
                {
                  label: 'Tickets/event',
                  getValue: p => p.max_tickets_per_event === -1 ? '∞' : p.max_tickets_per_event
                },
                {
                  label: 'Team members',
                  getValue: p => p.max_team_members === -1 ? '∞' : p.max_team_members
                },
                {
                  label: 'Custom domain',
                  getValue: p => p.custom_domain ? '✅' : '❌'
                },
                {
                  label: 'Analytics',
                  getValue: p => p.analytics ? '✅' : '❌'
                },
                {
                  label: 'Priority support',
                  getValue: p => p.priority_support ? '✅' : '❌'
                },
              ].map(row => (
                <tr key={row.label} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{row.label}</td>
                  {plans.map(plan => (
                    <td key={plan.id} className="px-4 py-4 text-center text-sm font-medium text-gray-700">
                      {row.getValue(plan)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          billingCycle={billingCycle}
          onClose={() => setSelectedPlan(null)}
          onSuccess={fetchData}
        />
      )}

    </div>
  );
}
