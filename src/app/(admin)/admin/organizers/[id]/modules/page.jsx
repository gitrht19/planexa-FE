// src/app/(admin)/admin/organizers/[id]/modules/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminService from '@/services/admin.service';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Building2, LayoutGrid, ArrowLeft, Plus, Trash2,
  ToggleLeft, ToggleRight, Search, XCircle, CheckCircle,
  PauseCircle, Sparkles, AlertCircle, ChevronRight
} from 'lucide-react';

// ─── Assign Modal ────────────────────────────────────────────
const AssignModal = ({ allModules, assignedModuleIds, onAssign, onClose }) => {
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);

  const available = allModules.filter(m =>
    !assignedModuleIds.includes(m.id) &&
    m.is_active &&
    (m.name.toLowerCase().includes(search.toLowerCase()) ||
     m.module_code.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAssign = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      await onAssign(selected);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-5 rounded-t-2xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutGrid size={20} />
              <div>
                <h3 className="font-bold text-lg">Assign Module</h3>
                <p className="text-purple-200 text-xs mt-0.5">
                  {available.length} modules available
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="text-white/70 hover:text-white transition">
              <XCircle size={22} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search modules..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition"
            />
          </div>

          {/* Module List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {available.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <LayoutGrid size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  {search ? 'No modules match your search' : 'All modules already assigned'}
                </p>
              </div>
            ) : (
              available.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id === selected ? null : m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition
                    ${selected === m.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${selected === m.id ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <LayoutGrid size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{m.path}</p>
                  </div>
                  {selected === m.id && (
                    <CheckCircle size={16} className="text-purple-500 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

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
                : <Plus size={15} />
              }
              {loading ? 'Assigning...' : 'Assign Module'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Remove Confirm Modal ────────────────────────────────────
const RemoveModal = ({ module, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Remove Module?</h3>
      <p className="text-sm text-gray-500 text-center mb-6">
        <span className="font-semibold text-gray-700">"{module?.module_detail?.name}"</span> is
        organizer ke liye remove ho jayega.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition">
          Remove
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────
export default function OrganizerModulesPage() {
  const params = useParams();
  const orgId  = params?.id;

  const [organizer,     setOrganizer]     = useState(null);
  const [orgModules,    setOrgModules]    = useState([]);   // assigned modules
  const [allModules,    setAllModules]    = useState([]);   // global modules
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [showAssign,    setShowAssign]    = useState(false);
  const [removeTarget,  setRemoveTarget]  = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // ── Fetch all data ──────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [orgs, modules, orgMods] = await Promise.all([
        AdminService.getOrganizers(),
        AdminService.getModules(),
        AdminService.getOrgModules(orgId),
      ]);
      const org = Array.isArray(orgs) ? orgs.find(o => String(o.id) === String(orgId)) : null;
      setOrganizer(org);
      setAllModules(Array.isArray(modules) ? modules : []);
      setOrgModules(Array.isArray(orgMods) ? orgMods : []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Data load karne mein error aaya');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [orgId]);

  // ── Assign module ───────────────────────────────────────────
  const handleAssign = async (moduleId) => {
    try {
      await AdminService.assignOrgModule({ organizer: orgId, module: moduleId });
      toast.success('Module assign ho gaya!');
      await fetchData();
    } catch (err) {
      console.error('Assign error:', err);
      toast.error('Module assign nahi ho saka');
    }
  };

  // ── Toggle enable/disable ───────────────────────────────────
  const handleToggle = async (orgModule) => {
    try {
      setActionLoading(orgModule.id);
      await AdminService.toggleOrgModule(orgModule.id, !orgModule.is_enabled);
      setOrgModules(prev =>
        prev.map(m => m.id === orgModule.id
          ? { ...m, is_enabled: !m.is_enabled }
          : m
        )
      );
      toast.success(orgModule.is_enabled ? 'Module disable ho gaya' : 'Module enable ho gaya');
    } catch (err) {
      console.error('Toggle error:', err);
      toast.error('Status update nahi ho saka');
      // Revert on error
      setOrgModules(prev =>
        prev.map(m => m.id === orgModule.id
          ? { ...m, is_enabled: orgModule.is_enabled }
          : m
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ── Remove module ───────────────────────────────────────────
  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      setActionLoading(removeTarget.id);
      await AdminService.removeOrgModule(removeTarget.id);
      setOrgModules(prev => prev.filter(m => m.id !== removeTarget.id));
      setRemoveTarget(null);
      toast.success('Module remove ho gaya');
    } catch (err) {
      console.error('Remove error:', err);
      toast.error('Module remove nahi ho saka');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filtered list ───────────────────────────────────────────
  const filtered = orgModules.filter(m =>
    m.module_detail?.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.module_detail?.module_code?.toLowerCase().includes(search.toLowerCase())
  );

  const assignedModuleIds = orgModules.map(m => m.module_detail?.id || m.module);

  const stats = {
    total:    orgModules.length,
    enabled:  orgModules.filter(m => m.is_enabled).length,
    disabled: orgModules.filter(m => !m.is_enabled).length,
  };

  // ── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin" />
            <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500" />
          </div>
          <p className="text-gray-500 text-sm mt-4">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-900 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />

        <div className="relative p-6">
          {/* Back + Title */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
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
                <h2 className="text-2xl font-bold text-white">Module Access</h2>
                <p className="text-purple-100 text-sm mt-1">
                  Is organizer ke liye modules assign aur manage karo
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAssign(true)}
              className="flex items-center gap-2 bg-white text-purple-700 hover:bg-purple-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg"
            >
              <Plus size={16} />
              Assign Module
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <LayoutGrid size={13} className="text-pink-300" />
                <p className="text-[10px] text-purple-200 uppercase tracking-wider">Total</p>
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={13} className="text-green-300" />
                <p className="text-[10px] text-purple-200 uppercase tracking-wider">Enabled</p>
              </div>
              <p className="text-2xl font-bold text-green-300">{stats.enabled}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <PauseCircle size={13} className="text-orange-300" />
                <p className="text-[10px] text-purple-200 uppercase tracking-wider">Disabled</p>
              </div>
              <p className="text-2xl font-bold text-orange-300">{stats.disabled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assigned modules..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition"
            />
          </div>
          <p className="text-xs text-gray-400 whitespace-nowrap">
            {filtered.length} of {orgModules.length} modules
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[11px] tracking-wider">
                <th className="text-left px-6 py-3 font-semibold">Module</th>
                <th className="text-left px-6 py-3 font-semibold">Path</th>
                <th className="text-left px-6 py-3 font-semibold">Icon</th>
                <th className="text-left px-6 py-3 font-semibold">Parent</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
                <th className="text-right px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <LayoutGrid size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                      {search
                        ? `"${search}" se koi module nahi mila`
                        : 'Koi module assign nahi hai abhi'
                      }
                    </p>
                    {!search && (
                      <button
                        onClick={() => setShowAssign(true)}
                        className="inline-flex items-center gap-1 mt-3 text-xs text-purple-500 hover:underline"
                      >
                        <Plus size={12} /> Pehla module assign karo
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map(orgModule => (
                  <tr key={orgModule.id} className="hover:bg-gray-50/80 transition group">
                    {/* Name + module_code */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {orgModule.module_detail?.name}
                      </p>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {orgModule.module_detail?.module_code}
                      </p>
                    </td>
                    {/* Path */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        {orgModule.module_detail?.path}
                      </span>
                    </td>
                    {/* Icon */}
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500 font-mono">
                        {orgModule.module_detail?.icon}
                      </span>
                    </td>
                    {/* Parent */}
                    <td className="px-6 py-4">
                      {orgModule.module_detail?.parent ? (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <ChevronRight size={12} />
                          {orgModule.module_detail.parent?.name || orgModule.module_detail.parent}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border
                        ${orgModule.is_enabled
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-orange-100 text-orange-700 border-orange-200'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${orgModule.is_enabled ? 'bg-emerald-500' : 'bg-orange-400'}`} />
                        {orgModule.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(orgModule)}
                          disabled={actionLoading === orgModule.id}
                          title={orgModule.is_enabled ? 'Disable' : 'Enable'}
                          className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700 disabled:opacity-50"
                        >
                          {actionLoading === orgModule.id
                            ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            : orgModule.is_enabled
                              ? <ToggleRight size={18} className="text-emerald-500" />
                              : <ToggleLeft size={18} />
                          }
                        </button>
                        {/* Remove */}
                        <button
                          onClick={() => setRemoveTarget(orgModule)}
                          disabled={actionLoading === orgModule.id}
                          title="Remove"
                          className="p-2 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-500 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ── */}
      {showAssign && (
        <AssignModal
          allModules={allModules}
          assignedModuleIds={assignedModuleIds}
          onAssign={handleAssign}
          onClose={() => setShowAssign(false)}
        />
      )}

      {removeTarget && (
        <RemoveModal
          module={removeTarget}
          onConfirm={handleRemove}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}