'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  Eye, EyeOff, UserPlus, Sparkles, ArrowRight, Crown, 
  Calendar, Users, Ticket, Target, Shield, Star, TrendingUp, Zap
} from 'lucide-react';
import AuthService from '@/services/auth.service';
import { getErrorMessage } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await AuthService.register(data);
      toast.success('OTP sent successfully! Check your email.');
      localStorage.setItem('pending_username', data.username);
      router.push('/verify-otp');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    { icon: Calendar, name: 'Concerts', color: 'rose' },
    { icon: Users, name: 'Workshops', color: 'amber' },
    { icon: Ticket, name: 'Exhibitions', color: 'blue' },
    { icon: Target, name: 'Charity', color: 'green' },
  ];

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] overflow-hidden">
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-rose-500/20 to-pink-500/20 blur-3xl animate-pulse"
          style={{ 
            left: mousePosition.x * 0.02,
            top: mousePosition.y * 0.02,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 blur-3xl animate-pulse delay-1000"
          style={{ 
            right: mousePosition.x * 0.01,
            bottom: mousePosition.y * 0.01,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative h-full w-full flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
        <div className="w-full max-w-6xl">
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 animate-bounce-slow opacity-30 pointer-events-none">
            <Sparkles size={24} className="text-rose-400" />
          </div>
          <div className="absolute bottom-20 right-10 animate-bounce-slow delay-1000 opacity-30 pointer-events-none">
            <Zap size={20} className="text-yellow-400" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Side - Interactive Event Cards */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
                  <Zap size={14} className="text-rose-400" />
                  <span className="text-xs text-white/80 font-mono">EVENT PLATFORM</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    PLANNEXA
                  </span>
                </h1>
                <p className="text-gray-400 text-lg mb-8">
                  Join the community ✨
                </p>
              </div>

              {/* Interactive Event Cards */}
              <div className="grid grid-cols-2 gap-4">
                {eventTypes.map((event, idx) => {
                  const Icon = event.icon;
                  const textColors = {
                    rose: 'text-rose-400',
                    amber: 'text-amber-400',
                    blue: 'text-blue-400',
                    green: 'text-green-400',
                  };
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setActiveCard(idx)}
                      onMouseLeave={() => setActiveCard(-1)}
                      className={`relative group p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        activeCard === idx 
                          ? `border-${event.color}-500/50 bg-${event.color}-500/10 scale-105`
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl bg-${event.color}-500/20 flex items-center justify-center group-hover:scale-110 transition`}>
                          <Icon size={18} className={textColors[event.color]} />
                        </div>
                        <h3 className={`font-bold text-white group-hover:${textColors[event.color]} transition`}>
                          {event.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-400 italic">
                        {idx === 0 && "Experience the energy"}
                        {idx === 1 && "Learn new skills"}
                        {idx === 2 && "Discover creativity"}
                        {idx === 3 && "Make an impact"}
                      </p>
                      {activeCard === idx && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center animate-ping-slow">
                          <Sparkles size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <TrendingUp size={18} className="text-rose-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">10K+</p>
                  <p className="text-[10px] text-gray-400">Events Hosted</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <Users size={18} className="text-amber-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">50K+</p>
                  <p className="text-[10px] text-gray-400">Happy Attendees</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <Star size={18} className="text-yellow-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">4.9⭐</p>
                  <p className="text-[10px] text-gray-400">User Rating</p>
                </div>
              </div>
            </div>

            {/* Right Side - Register Card */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-2xl blur-lg opacity-30 animate-pulse" />
              <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                
                {/* Decorative top bar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent rounded-full" />
                
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 mb-2">
                    <UserPlus size={10} className="text-rose-400" />
                    <span className="text-[8px] text-rose-400 font-mono">GET STARTED</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-0.5">Create account</h2>
                  <p className="text-gray-400 text-xs">Join the event revolution</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  {/* Username Field */}
                  <div className="group">
                    <label className="block text-[8px] font-mono text-gray-400 mb-1 uppercase tracking-wider">
                      👤 USERNAME
                    </label>
                    <div className="relative">
                      <input
                        {...register('username', {
                          required: 'Username is required',
                          minLength: { value: 3, message: 'Min 3 characters' },
                          pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, underscore' }
                        })}
                        type="text"
                        placeholder="johndoe"
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                    </div>
                    {errors.username && (
                      <p className="text-rose-400 text-[9px] mt-0.5">{errors.username.message}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="group">
                    <label className="block text-[8px] font-mono text-gray-400 mb-1 uppercase tracking-wider">
                      📧 EMAIL
                    </label>
                    <div className="relative">
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Valid email required' }
                        })}
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                    </div>
                    {errors.email && (
                      <p className="text-rose-400 text-[9px] mt-0.5">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Mobile Field */}
                  <div className="group">
                    <label className="block text-[8px] font-mono text-gray-400 mb-1 uppercase tracking-wider">
                      📱 MOBILE NUMBER
                    </label>
                    <div className="relative">
                      <input
                        {...register('mobile_number', {
                          required: 'Mobile number is required',
                          pattern: { value: /^[0-9]{10}$/, message: '10 digit number required' }
                        })}
                        type="tel"
                        placeholder="9876543210"
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                    </div>
                    {errors.mobile_number && (
                      <p className="text-rose-400 text-[9px] mt-0.5">{errors.mobile_number.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="group">
                    <label className="block text-[8px] font-mono text-gray-400 mb-1 uppercase tracking-wider">
                      🔒 PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Min 8 characters' },
                        })}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-400 transition"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                    </div>
                    {errors.password && (
                      <p className="text-rose-400 text-[9px] mt-0.5">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full group overflow-hidden mt-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg opacity-80 group-hover:opacity-100 transition" />
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 rounded-lg translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="relative flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-white text-sm">
                      {loading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[9px]">
                    <span className="px-2 bg-black/40 text-gray-500">Already have an account?</span>
                  </div>
                </div>

                {/* Login Button */}
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/20 text-gray-300 font-medium text-xs hover:border-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300 group"
                >
                  <Crown size={12} className="group-hover:scale-110 transition" />
                  Sign In
                </Link>

                {/* Security Footer */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-[7px] text-gray-500">✓ SSL Secure</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-gray-600" />
                    <span className="text-[7px] text-gray-500">✓ 24/7 Support</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-gray-600" />
                    <span className="text-[7px] text-gray-500">✓ Safe Payments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 2s ease-in-out infinite;
        }
        
        body {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}