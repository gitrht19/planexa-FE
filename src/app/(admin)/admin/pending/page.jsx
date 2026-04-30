'use client';
import { useEffect, useState } from 'react';
import AdminService from '@/services/admin.service';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

export default function PendingUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    AdminService.getPendingUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (id) => {
    try {
      await AdminService.approveUser(id);
      toast.success('User approved!');
      fetchUsers();
    } catch { toast.error('Error approving user'); }
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this user?')) return;
    try {
      await AdminService.rejectUser(id);
      toast.success('User rejected.');
      fetchUsers();
    } catch { toast.error('Error rejecting user'); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1a1a2e] mb-6">Pending Approvals</h2>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm">
          ✅ Koi pending user nahi hai
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Username</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Mobile</th>
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
                  <td className="px-6 py-4 text-slate-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-600 transition"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-600 transition"
                    >
                      <XCircle size={14} /> Reject
                    </button>
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