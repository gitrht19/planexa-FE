'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';

export default function PendingApprovalPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-widest">PLANNEXA</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-4 rounded-full">
              <Clock size={40} className="text-yellow-500" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#1a1a2e] mb-3">
            Approval Pending
          </h2>

          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Aapka account admin ke paas review ke liye bheja gaya hai.
            Approve hone ke baad aapko email milega aur aap platform
            use kar sakte hain.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 text-yellow-800 text-sm">
            ⚠️ Is process mein <strong>24-48 hours</strong> lag sakte hain.
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-[#e94560] text-white py-3 rounded-xl font-semibold hover:bg-[#d63651] transition"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}