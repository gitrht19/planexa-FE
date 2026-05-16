// src/app/(admin)/admin/modules/create/page.jsx
// src/app/(admin)/admin/modules/[id]/edit/page.jsx

'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminService from '@/services/admin.service';
import Link from 'next/link';
import { LayoutGrid, Save, ArrowLeft } from 'lucide-react';

const InputField = ({ label, name, value, onChange, placeholder, type = 'text', required, hint }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition"
    />
    {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
  </div>
);

export default function ModuleFormPage() {
  const router  = useRouter();
  const params  = useParams();
  const isEdit  = !!params?.id;

  const [form, setForm] = useState({
    name: '', module_code: '', icon: '', path: '',
    order: 0, parent: '', is_active: true,
  });
  const [modules,  setModules]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [errors,   setErrors]   = useState({});

  // ✅ Fix: service already returns data directly, no .data needed
  useEffect(() => {
    AdminService.getModules()
      .then(data => setModules(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    AdminService.getModule(params.id)
      .then(m => {
        // ✅ Fix: m is already the module object
        setForm({
          name:      m.name      || '',
          module_code:      m.module_code      || '',
          icon:      m.icon      || '',
          path:      m.path      || '',
          order:     m.order     || 0,
          parent:    m.parent    || '',
          is_active: m.is_active ?? true,
        });
      })
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [isEdit, params?.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'name') {
      // Auto-generate module_code from name
      setForm(prev => ({
        ...prev,
        name: value,
        module_code: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }));
      return;
    }

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required';
    if (!form.module_code.trim()) err.module_code = 'module_code is required';
    if (!form.path.trim()) err.path = 'Path is required';
    if (!form.icon.trim()) err.icon = 'Icon name is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const payload = {
        ...form,
        order:  Number(form.order),
        parent: form.parent || null,   // ✅ empty string → null
      };
      if (isEdit) {
        await AdminService.updateModule(params.id, payload);
      } else {
        await AdminService.createModule(payload);
      }
      router.push('/admin/modules');
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500 rounded-full blur-3xl" />
        </div>
        <div className="relative flex items-center gap-4">
          <Link href="/admin/modules"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid size={14} className="text-rose-400" />
              <span className="text-xs font-medium text-rose-400 uppercase tracking-wider">
                {isEdit ? 'Edit Module' : 'New Module'}
              </span>
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? `Edit: ${form.name}` : 'Create Module'}
            </h2>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Name */}
            <div>
              <InputField
                label="Module Name" name="name" value={form.name}
                onChange={handleChange} placeholder="e.g. User Management" required
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* module_code */}
            <div>
              <InputField
                label="module_code" name="module_code" value={form.module_code}
                onChange={handleChange} placeholder="e.g. user-management"
                hint="Auto-generated from name. Must be unique." required
              />
              {errors.module_code && <p className="text-xs text-rose-500 mt-1">{errors.module_code}</p>}
            </div>

            {/* Path */}
            <div>
              <InputField
                label="Path" name="path" value={form.path}
                onChange={handleChange} placeholder="e.g. /users"
                hint="Frontend route path" required
              />
              {errors.path && <p className="text-xs text-rose-500 mt-1">{errors.path}</p>}
            </div>

            {/* Icon */}
            <div>
              <InputField
                label="Icon" name="icon" value={form.icon}
                onChange={handleChange} placeholder="e.g. Users"
                hint="Lucide icon name (case-sensitive)" required
              />
              {errors.icon && <p className="text-xs text-rose-500 mt-1">{errors.icon}</p>}
            </div>

            {/* Order */}
            <InputField
              label="Order" name="order" value={form.order}
              onChange={handleChange} type="number" placeholder="0"
              hint="Display order in sidebar"
            />

            {/* Parent Module */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Parent Module
              </label>
              <select
                name="parent"
                value={form.parent}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition"
              >
                <option value="">None (Top-level)</option>
                {modules
                  .filter(m => !isEdit || m.id !== Number(params.id))
                  .map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))
                }
              </select>
              <p className="text-[11px] text-gray-400 mt-1">Leave empty for top-level module</p>
            </div>
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-700">Active Status</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Inactive modules won't show in any sidebar
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox" name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Link href="/admin/modules"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition shadow-lg shadow-rose-500/25"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Save size={15} />
              }
              {loading ? 'Saving...' : isEdit ? 'Update Module' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}