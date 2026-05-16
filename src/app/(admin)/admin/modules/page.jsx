// src/app/(admin)/admin/modules/page.jsx
'use client';
import { useEffect, useState } from 'react';
import AdminService from '@/services/admin.service';
import Link from 'next/link';
import {
  LayoutGrid, Plus, Pencil, Trash2, Search,
  ToggleLeft, ToggleRight, ChevronRight, Sparkles, AlertCircle
} from 'lucide-react';

const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider
    ${isActive
      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      : 'bg-gray-100 text-gray-500 border border-gray-200'
    }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const DeleteModal = ({ module, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Module?</h3>
      <p className="text-sm text-gray-500 text-center mb-6">
        <span className="font-semibold text-gray-700">"{module?.name}"</span> ko delete karne se
        yeh sab organizers ke liye remove ho jayega.
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

export default function ModuleListPage() {
  const [modules,      setModules]      = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchModules = async () => {
    try {
      setLoading(true);
      // ✅ Fix: service already returns data directly
      const data = await AdminService.getModules();
      const list = Array.isArray(data) ? data : [];
      setModules(list);
      setFiltered(list);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setModules([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModules(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      modules.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.module_code?.toLowerCase().includes(q) ||
        m.path?.toLowerCase().includes(q)
      )
    );
  }, [search, modules]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(deleteTarget.id);
      // ✅ Fix: no .data needed
      await AdminService.deleteModule(deleteTarget.id);
      setModules(prev => prev.filter(m => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (module) => {
    try {
      setActionLoading(module.id);
      // ✅ Fix: no .data needed
      await AdminService.updateModule(module.id, { is_active: !module.is_active });
      // Optimistic update
      setModules(prev =>
        prev.map(m => m.id === module.id ? { ...m, is_active: !m.is_active } : m)
      );
    } catch (err) {
      console.error('Toggle error:', err);
      // ✅ Revert on error
      setModules(prev =>
        prev.map(m => m.id === module.id ? { ...m, is_active: module.is_active } : m)
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
            <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500" />
          </div>
          <p className="text-gray-500 text-sm mt-4">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayoutGrid size={16} className="text-rose-400" />
              <span className="text-xs font-medium text-rose-400/90 uppercase tracking-wider">
                System Modules
              </span>
            </div>
            <h2 className="text-2xl font-bold">Module Management</h2>
            <p className="text-gray-300 text-sm mt-1">
              {modules.length} total · {modules.filter(m => m.is_active).length} active
            </p>
          </div>
          <Link
            href="/admin/modules/create"
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-rose-500/25"
          >
            <Plus size={16} />
            New Module
          </Link>
        </div>
      </div>

      {/* Search + Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="p-5 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, module_code, path..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[11px] tracking-wider">
                <th className="text-left px-6 py-3 font-semibold">Module</th>
                <th className="text-left px-6 py-3 font-semibold">Path</th>
                <th className="text-left px-6 py-3 font-semibold">Icon</th>
                <th className="text-left px-6 py-3 font-semibold">Order</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
                <th className="text-left px-6 py-3 font-semibold">Parent</th>
                <th className="text-right px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    <LayoutGrid size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                      {search ? `"${search}" se koi module nahi mila` : 'No modules found'}
                    </p>
                    {!search && (
                      <Link href="/admin/modules/create"
                        className="inline-flex items-center gap-1 mt-3 text-xs text-rose-500 hover:underline">
                        <Plus size={12} /> Create first module
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map(module => (
                  <tr key={module.id} className="hover:bg-gray-50/80 transition group">
                    {/* Name + module_code */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{module.name}</p>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">{module.module_code}</p>
                    </td>
                    {/* Path */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        {module.path}
                      </span>
                    </td>
                    {/* Icon */}
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500 font-mono">{module.icon}</span>
                    </td>
                    {/* Order */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{module.order}</span>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge isActive={module.is_active} />
                    </td>
                    {/* Parent */}
                    <td className="px-6 py-4">
                      {module.parent ? (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <ChevronRight size={12} />
                          {/* ✅ parent object se name nikalo */}
                          {module.parent?.name || module.parent}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(module)}
                          disabled={actionLoading === module.id}
                          title={module.is_active ? 'Deactivate' : 'Activate'}
                          className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700 disabled:opacity-50"
                        >
                          {actionLoading === module.id
                            ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            : module.is_active
                              ? <ToggleRight size={18} className="text-emerald-500" />
                              : <ToggleLeft size={18} />
                          }
                        </button>
                        {/* Edit */}
                        <Link
                          href={`/admin/modules/${module.id}/edit`}
                          className="p-2 rounded-lg hover:bg-blue-50 transition text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </Link>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(module)}
                          disabled={actionLoading === module.id}
                          title="Delete"
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

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          module={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}