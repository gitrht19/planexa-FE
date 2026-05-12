'use client';
import { useEffect, useState } from 'react';
import AdminService from '@/services/admin.service';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, PauseCircle, PlayCircle } from 'lucide-react';

export default function AllUsersPage() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // loading state per row

  const fetchUsers = () => {
    setLoading(true);
    AdminService.getAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAction = async (action, id, label) => {
    setActionId(id);
    try {
      await action(id);
      toast.success(`${label} successful!`);
      fetchUsers();
    } catch {
      toast.error(`Error: ${label} failed.`);
    } finally {
      setActionId(null);
    }
  };

  const getStatusBadge = (user) => {
    if (user.is_deleted) {
      return (
        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
          <XCircle size={12} /> Rejected
        </span>
      );
    }
    if (user.is_approved && user.is_active) {
      return (
        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
          <CheckCircle size={12} /> Active
        </span>
      );
    }
    if (user.is_approved && !user.is_active) {
      return (
        <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
          <PauseCircle size={12} /> Suspended
        </span>
      );
    }
    return (
      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
        <XCircle size={12} /> Pending
      </span>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1a1a2e] mb-6">All Users</h2>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm">
          Koi user nahi hai
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Username</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Mobile</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Verified</th>
                <th className="px-6 py-4 text-left">Registered</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-[#1a1a2e]">{user.username}</td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 text-slate-500">{user.mobile_number || 'N/A'}</td>
                  <td className="px-6 py-4">{getStatusBadge(user)}</td>
                  <td className="px-6 py-4">
                    {user.is_verified
                      ? <span className="text-green-600 text-xs">✅ Yes</span>
                      : <span className="text-red-400 text-xs">❌ No</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>

                  {/* ── Actions ── */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* Approved + Active → Suspend karo */}
                      {user.is_approved && user.is_active && (
                        <button
                          disabled={actionId === user.id}
                          onClick={() => handleAction(AdminService.suspendUser, user.id, 'Suspend')}
                          className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-orange-600 transition disabled:opacity-50"
                        >
                          <PauseCircle size={14} />
                          {actionId === user.id ? '...' : 'Suspend'}
                        </button>
                      )}

                      {/* Approved + Suspended → Reactivate karo */}
                      {user.is_approved && !user.is_active && (
                        <button
                          disabled={actionId === user.id}
                          onClick={() => handleAction(AdminService.reactivateUser, user.id, 'Reactivate')}
                          className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-600 transition disabled:opacity-50"
                        >
                          <PlayCircle size={14} />
                          {actionId === user.id ? '...' : 'Reactivate'}
                        </button>
                      )}

                      {/* Pending user → approve/reject yahan bhi */}
                      {!user.is_approved && (
                        <span className="text-slate-400 text-xs italic">Pending approval</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}