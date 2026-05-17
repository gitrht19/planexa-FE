
// src/app/(admin)/admin/subscriptions/plans/[id]/edit/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminService from '@/services/admin.service';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Crown, Save, ArrowLeft, CheckCircle } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
      {title}
    </h3>
    {children}
  </div>
);

const InputField = ({ label, name, value, onChange, type = 'text', hint, required }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type} name={name} value={value}
      onChange={onChange} required={required}
      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition"
    />
    {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
  </div>
);

const ToggleField = ({ label, name, checked, onChange, hint }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
    </label>
  </div>
);

const INITIAL_FORM = {
  name: 'free', display_name: '', billing_cycle: 'monthly',
  price: 0, description: '', is_popular: false, is_active: true,
  // Limits
  max_events: 1, max_attendees_event: 100, max_attendees_month: 100,
  max_ticket_types: 1, manual_approval: true, max_team_members: 0,
  // Features
  custom_branding: false, white_label: false, custom_domain: false,
  custom_registration_form: false, discount_coupons: false,
  qr_checkin: true, email_notifications: true, email_automation: false,
  payment_gateway: false, basic_analytics: false, advanced_analytics: false,
  export_reports: false, basic_api_webhooks: false, full_api_access: false,
  social_media_integration: false, ai_recommendations: false,
  role_based_access: false, multi_team: false, advanced_automation: false,
  audit_logs: false, sso_login: false, multi_language: false,
  multi_currency: false, priority_support: false, dedicated_manager: false,
  sla_support: false, powered_by_branding: true,
};

export default function PlanFormPage() {
  const router  = useRouter();
  const params  = useParams();
  const isEdit  = !!params?.id;

  const [form,     setForm]     = useState(INITIAL_FORM);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    AdminService.getPlan(params.id)
      .then(data => setForm(prev => ({ ...prev, ...data })))
      .catch(() => toast.error('Plan load nahi ho saka'))
      .finally(() => setFetching(false));
  }, [isEdit, params?.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.display_name.trim()) {
      toast.error('Display name required');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        ...form,
        price:               Number(form.price),
        max_events:          Number(form.max_events),
        max_attendees_event: Number(form.max_attendees_event),
        max_attendees_month: Number(form.max_attendees_month),
        max_ticket_types:    Number(form.max_ticket_types),
        max_team_members:    Number(form.max_team_members),
      };
      if (isEdit) {
        await AdminService.updatePlan(params.id, payload);
        toast.success('Plan updated!');
      } else {
        await AdminService.createPlan(payload);
        toast.success('Plan created!');
      }
      router.push('/admin/subscriptions');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save nahi ho saka');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 rounded-2xl p-6 text-white">
        <div className="relative flex items-center gap-4">
          <Link href="/admin/subscriptions"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown size={14} className="text-yellow-300" />
              <span className="text-xs font-medium text-yellow-200 uppercase tracking-wider">
                {isEdit ? 'Edit Plan' : 'New Plan'}
              </span>
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? `Edit: ${form.display_name}` : 'Create Subscription Plan'}
            </h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Section title="Basic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Plan Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Plan Type <span className="text-rose-500">*</span>
              </label>
              <select name="name" value={form.name} onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition">
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Display Name */}
            <InputField
              label="Display Name" name="display_name" value={form.display_name}
              onChange={handleChange} placeholder="e.g. Pro Plan" required
            />

            {/* Billing Cycle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Billing Cycle</label>
              <select name="billing_cycle" value={form.billing_cycle} onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Price */}
            <InputField
              label="Price (₹)" name="price" value={form.price}
              onChange={handleChange} type="number"
              hint="0 for free plan"
            />

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea
                name="description" value={form.description || ''} onChange={handleChange}
                rows={2} placeholder="Plan description..."
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition resize-none"
              />
            </div>

            {/* Flags */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_popular" checked={form.is_popular} onChange={handleChange} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 relative" />
                <span className="text-sm font-medium text-gray-700">Most Popular</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>
        </Section>

        {/* Limits */}
        <Section title="Usage Limits">
          <p className="text-xs text-gray-400 mb-4">-1 = Unlimited</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <InputField label="Max Events"           name="max_events"          value={form.max_events}          onChange={handleChange} type="number" hint="-1 for unlimited" />
            <InputField label="Max Attendees/Event"  name="max_attendees_event" value={form.max_attendees_event} onChange={handleChange} type="number" hint="-1 for unlimited" />
            <InputField label="Max Attendees/Month"  name="max_attendees_month" value={form.max_attendees_month} onChange={handleChange} type="number" hint="-1 for unlimited" />
            <InputField label="Max Ticket Types"     name="max_ticket_types"    value={form.max_ticket_types}    onChange={handleChange} type="number" />
            <InputField label="Max Team Members"     name="max_team_members"    value={form.max_team_members}    onChange={handleChange} type="number" hint="0 = no team, -1 = unlimited" />
          </div>
        </Section>

        {/* Features */}
        <Section title="Features">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Branding & Domain</p>
              <ToggleField label="Custom Branding"     name="custom_branding"     checked={form.custom_branding}     onChange={handleChange} />
              <ToggleField label="White Label"         name="white_label"         checked={form.white_label}         onChange={handleChange} />
              <ToggleField label="Custom Domain"       name="custom_domain"       checked={form.custom_domain}       onChange={handleChange} />
              <ToggleField label="Powered By Branding" name="powered_by_branding" checked={form.powered_by_branding} onChange={handleChange} hint="Show 'Powered by' footer" />

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Events & Tickets</p>
              <ToggleField label="Manual Approval"         name="manual_approval"         checked={form.manual_approval}         onChange={handleChange} />
              <ToggleField label="Custom Registration Form" name="custom_registration_form" checked={form.custom_registration_form} onChange={handleChange} />
              <ToggleField label="Discount Coupons"        name="discount_coupons"        checked={form.discount_coupons}        onChange={handleChange} />
              <ToggleField label="QR Check-in"             name="qr_checkin"              checked={form.qr_checkin}              onChange={handleChange} />

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Communication</p>
              <ToggleField label="Email Notifications" name="email_notifications" checked={form.email_notifications} onChange={handleChange} />
              <ToggleField label="Email Automation"    name="email_automation"    checked={form.email_automation}    onChange={handleChange} />
              <ToggleField label="Social Media Integration" name="social_media_integration" checked={form.social_media_integration} onChange={handleChange} />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Analytics & Reports</p>
              <ToggleField label="Basic Analytics"    name="basic_analytics"    checked={form.basic_analytics}    onChange={handleChange} />
              <ToggleField label="Advanced Analytics" name="advanced_analytics" checked={form.advanced_analytics} onChange={handleChange} />
              <ToggleField label="Export Reports"     name="export_reports"     checked={form.export_reports}     onChange={handleChange} />

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">API & Integrations</p>
              <ToggleField label="Payment Gateway"    name="payment_gateway"    checked={form.payment_gateway}    onChange={handleChange} />
              <ToggleField label="Basic API/Webhooks" name="basic_api_webhooks" checked={form.basic_api_webhooks} onChange={handleChange} />
              <ToggleField label="Full API Access"    name="full_api_access"    checked={form.full_api_access}    onChange={handleChange} />

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Enterprise</p>
              <ToggleField label="Role Based Access"    name="role_based_access"    checked={form.role_based_access}    onChange={handleChange} />
              <ToggleField label="Multi Team"           name="multi_team"           checked={form.multi_team}           onChange={handleChange} />
              <ToggleField label="Advanced Automation"  name="advanced_automation"  checked={form.advanced_automation}  onChange={handleChange} />
              <ToggleField label="AI Recommendations"   name="ai_recommendations"   checked={form.ai_recommendations}   onChange={handleChange} />
              <ToggleField label="Audit Logs"           name="audit_logs"           checked={form.audit_logs}           onChange={handleChange} />
              <ToggleField label="SSO Login"            name="sso_login"            checked={form.sso_login}            onChange={handleChange} />
              <ToggleField label="Multi Language"       name="multi_language"       checked={form.multi_language}       onChange={handleChange} />
              <ToggleField label="Multi Currency"       name="multi_currency"       checked={form.multi_currency}       onChange={handleChange} />
              <ToggleField label="Priority Support"     name="priority_support"     checked={form.priority_support}     onChange={handleChange} />
              <ToggleField label="Dedicated Manager"    name="dedicated_manager"    checked={form.dedicated_manager}    onChange={handleChange} />
              <ToggleField label="SLA Support"          name="sla_support"          checked={form.sla_support}          onChange={handleChange} />
            </div>
          </div>
        </Section>

        {/* Submit */}
        <div className="flex gap-3">
          <Link href="/admin/subscriptions"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 px-4 py-3 rounded-xl text-sm font-medium text-white transition shadow-lg shadow-amber-500/25">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={15} />
            }
            {loading ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}