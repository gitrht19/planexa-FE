'use client';
import { useEffect, useState } from 'react';
import AdminService from '@/services/admin.service';
import { Building2 } from 'lucide-react';

export default function OrganizersPage() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminService.getOrganizers()
      .then(setOrganizers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1a1a2e] mb-6">Organizers</h2>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : organizers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          Koi organizer nahi hai abhi
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Org Number</th>
                <th className="px-6 py-4 text-left">Subdomain</th>
                <th className="px-6 py-4 text-left">Domain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {organizers.map(org => (
                <tr key={org.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-[#1a1a2e]">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-100 p-1.5 rounded-lg">
                        <Building2 size={14} className="text-purple-600" />
                      </div>
                      {org.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{org.customuser__email || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[#e94560] text-xs font-bold">
                      {org.org_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{org.subdomain}</td>
                  <td className="px-6 py-4">
                    <span className="text-green-600 text-xs font-medium">{org.domain}</span>
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