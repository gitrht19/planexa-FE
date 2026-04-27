'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import AuthService from '@/services/auth.service';
import { getErrorMessage } from '@/lib/utils';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputs = useRef([]);
  const username = typeof window !== 'undefined'
    ? localStorage.getItem('pending_username') : '';

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // OTP input handling
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // sirf numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto focus next
    if (value && index < 5) inputs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    // Backspace par previous focus
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(pasted)) {
      setOtp(pasted.split(''));
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('6 digit OTP daalo');
      return;
    }
    setLoading(true);
    try {
      await AuthService.verifyOtp({ username, otp: otpString });
      toast.success('Account created! Login karo.');
      localStorage.removeItem('pending_username');
      router.push('/login');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await AuthService.register({
        username,
        // Note: sirf resend ke liye — baaki data localStorage mein store karo
      });
      toast.success('OTP dobara bheja gaya!');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-widest">PLANNEXA</h1>
          <p className="text-slate-400 mt-2 text-sm">Email verify karo</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <ShieldCheck size={32} className="text-[#e94560]" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#1a1a2e] text-center mb-2">OTP Verify Karo</h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            6-digit OTP aapki email par bheja gaya hai
          </p>

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputs.current[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:border-[#e94560] transition"
              />
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#e94560] text-white py-3 rounded-xl font-semibold hover:bg-[#d63651] transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Verify Karo'
            )}
          </button>

          {/* Resend */}
          <div className="text-center mt-4">
            {timer > 0 ? (
              <p className="text-gray-400 text-sm">
                OTP resend in{' '}
                <span className="text-[#e94560] font-semibold">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-[#e94560] font-semibold text-sm hover:underline disabled:opacity-60"
              >
                OTP Dobara Bhejo
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}