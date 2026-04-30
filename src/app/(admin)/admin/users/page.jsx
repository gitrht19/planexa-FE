'use client';
import { useEffect, useState } from 'react';
import AdminService from '@/services/admin.service';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AllUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminService.getAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-[#1a1a2e]">{user.username}</td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 text-slate-500">{user.mobile_number || 'N/A'}</td>
                  <td className="px-6 py-4">
                    {user.is_approved ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                        <CheckCircle size={12} /> Approved
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                        <XCircle size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.is_verified ? (
                      <span className="text-green-600 text-xs">✅ Yes</span>
                    ) : (
                      <span className="text-red-400 text-xs">❌ No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
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