'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import AuthService from '@/services/auth.service';
import { getErrorMessage } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await AuthService.register(data);
      toast.success('OTP bhej diya gaya! Email check karo.');
      // Username next page par chahiye
      localStorage.setItem('pending_username', data.username);
      router.push('/verify-otp');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-widest">PLANNEXA</h1>
          <p className="text-slate-400 mt-2 text-sm">Create your organizer account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-[#1a1a2e] mb-6">Register</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                {...register('username', {
                  required: 'Username required hai',
                  minLength: { value: 3, message: 'Min 3 characters' },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, underscore' }
                })}
                type="text"
                placeholder="Enter username"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] transition"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register('email', {
                  required: 'Email required hai',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Valid email daalo' }
                })}
                type="email"
                placeholder="Enter email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] transition"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                {...register('mobile_number', {
                  required: 'Mobile required hai',
                  pattern: { value: /^[0-9]{10}$/, message: '10 digit number daalo' }
                })}
                type="tel"
                placeholder="Enter mobile number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] transition"
              />
              {errors.mobile_number && <p className="text-red-500 text-xs mt-1">{errors.mobile_number.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password required hai',
                    minLength: { value: 8, message: 'Min 8 characters' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e94560] text-white py-3 rounded-xl font-semibold hover:bg-[#d63651] transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><UserPlus size={18} /> Register</>
              )}
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already account hai?{' '}
            <Link href="/login" className="text-[#e94560] font-semibold hover:underline">
              Login karo
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}