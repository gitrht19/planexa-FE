'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Calendar, MapPin, ArrowRight, Star,
  Shield, Zap, BarChart3, Globe,
  ChevronRight, Menu, X, Crown, Sparkles,
  TrendingUp, Users, Ticket
} from 'lucide-react';
import PublicService from '@/services/public.service';
import { formatDate, formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// ── Animated Counter ──────────────────────────────────────
function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const duration = 1800;
        const step = Math.ceil(end / (duration / 16));
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(start);
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Particle Background ───────────────────────────────────
// ── Particle Background ───────────────────────────────────
function ParticleField() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(
      [...Array(24)].map((_, i) => ({
        width: Math.random() * 3 + 1,
        height: Math.random() * 3 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        background: i % 3 === 0 ? '#e94560' : i % 3 === 1 ? '#4f8ef7' : '#a855f7',
        opacity: Math.random() * 0.6 + 0.2,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle absolute rounded-full"
          style={{
            width: `${p.width}px`,
            height: `${p.height}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: p.background,
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────
function HomeNavbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(8px); }
          66% { transform: translateY(10px) translateX(-6px); }
        }
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.15); opacity: 0.25; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes glow-line {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-slide-up-2 { animation: slide-up 0.8s 0.15s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-slide-up-3 { animation: slide-up 0.8s 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-slide-up-4 { animation: slide-up 0.8s 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-fade-in { animation: fade-in 1.2s 0.6s both; }

        .shimmer-text {
          background: linear-gradient(90deg, #e94560, #f97316, #e94560, #f97316);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-card:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(233,69,96,0.3);
        }

        .glow-btn {
          position: relative;
          overflow: hidden;
        }
        .glow-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(255,255,255,0.15), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .glow-btn:hover::after { opacity: 1; }

        .nav-link {
          position: relative;
          color: rgba(255,255,255,0.6);
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0; right: 0;
          height: 1px;
          background: #e94560;
          transform: scaleX(0);
          transition: transform 0.3s;
        }
        .nav-link:hover { color: white; }
        .nav-link:hover::after { transform: scaleX(1); }

        .feature-icon-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1px solid rgba(233,69,96,0.3);
          animation: rotate-slow 8s linear infinite;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .glass-card:hover .feature-icon-ring { opacity: 1; }

        .grid-bg {
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent);
        }

        .pricing-glow {
          box-shadow: 0 0 60px rgba(233,69,96,0.15), 0 20px 60px rgba(0,0,0,0.4);
        }

        .event-card:hover .event-image {
          transform: scale(1.08);
        }

        .tag-chip {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .section-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 600;
          color: #e94560;
        }
      `}</style>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-[#080810]/90 backdrop-blur-2xl border-b border-white/[0.06]'
          : 'bg-transparent'
        }`}>
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">

          <Link href="/" className="font-display text-xl font-800 text-white tracking-[0.15em]">
            PLANNEXA
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { href: '/explore', label: 'Explore' },
              { href: '#features', label: 'Features' },
              { href: '#pricing', label: 'Pricing' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="nav-link">{item.label}</Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="glow-btn flex items-center gap-2 bg-[#e94560] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d63651] transition-all">
                Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="nav-link px-4 py-2.5">Login</Link>
                <Link href="/register" className="glow-btn flex items-center gap-2 bg-[#e94560] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d63651] transition-all shadow-lg shadow-red-900/20">
                  Get Started <ArrowRight size={13} />
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/70 hover:text-white transition p-2">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#080810]/98 backdrop-blur-2xl border-t border-white/[0.06] px-6 py-5 space-y-4">
            {[
              { href: '/explore', label: 'Explore Events' },
              { href: '#features', label: 'Features' },
              { href: '#pricing', label: 'Pricing' },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className="block text-white/60 hover:text-white text-sm py-2 transition">
                {item.label}
              </Link>
            ))}
            <div className="pt-2 flex gap-3">
              <Link href="/login" className="flex-1 text-center border border-white/10 text-white/80 py-3 rounded-xl text-sm font-medium hover:border-white/30 transition">Login</Link>
              <Link href="/register" className="flex-1 text-center bg-[#e94560] text-white py-3 rounded-xl text-sm font-semibold">Get Started</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

// ── Hero Section ──────────────────────────────────────────
function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen bg-[#020617] flex items-center overflow-hidden">

      {/* Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(233,69,96,0.18) 0%, transparent 70%)', animation: 'orb-pulse 6s ease-in-out infinite' }}
        />
        <div style={{ background: 'radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)', animation: 'orb-pulse 8s 2s ease-in-out infinite' }}
          className="absolute bottom-[15%] left-[10%] w-[400px] h-[400px] rounded-full" />
        <div style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', animation: 'orb-pulse 10s 1s ease-in-out infinite' }}
          className="absolute top-[50%] left-[40%] w-[300px] h-[300px] rounded-full" />
      </div>

      <ParticleField />

      {/* Decorative line */}
      <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, transparent, rgba(233,69,96,0.4) 50%, transparent)', animation: 'glow-line 3s ease-in-out infinite' }} />

      <div className="relative max-w-6xl mx-auto px-6 py-32 w-full">
        <div className="max-w-4xl">

          {/* Eyebrow */}
          <div className="animate-slide-up inline-flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
              <div className="relative">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full" style={{ animation: 'ping-slow 2s ease-out infinite' }} />
              </div>
              <span className="tag-chip text-green-400">Live Platform</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
              <Sparkles size={12} className="text-yellow-400" />
              <span className="tag-chip text-white/60">India ka #1 Event Platform</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-display animate-slide-up-2 text-5xl sm:text-6xl md:text-7xl font-800 text-white leading-[1.05] tracking-tight mb-6">
            Events Create Karo.
            <br />
            <span className="shimmer-text">Professional Tarike Se.</span>
          </h1>

          <p className="animate-slide-up-3 text-white/50 text-lg md:text-xl max-w-xl leading-relaxed mb-10 font-light">
            Tickets, bookings, payments — sab kuch ek powerful platform par.
            <span className="text-white/70"> Free mein shuru karo.</span>
          </p>

          {/* CTAs */}
          <div className="animate-slide-up-4 flex flex-col sm:flex-row gap-4 mb-16">
            {user ? (
              <Link href="/dashboard" className="glow-btn group inline-flex items-center gap-3 bg-[#e94560] text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-[#d63651] transition-all shadow-xl shadow-red-900/30">
                Dashboard Open Karo
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link href="/register" className="glow-btn group inline-flex items-center gap-3 bg-[#e94560] text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-[#d63651] transition-all shadow-xl shadow-red-900/30">
                  Free Mein Shuru Karo
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/explore" className="group inline-flex items-center gap-3 glass-card text-white/80 px-8 py-4 rounded-2xl font-medium text-base hover:text-white transition-all">
                  Events Explore Karo
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="animate-fade-in flex items-center gap-10 flex-wrap">
            {[
              { value: 10000, suffix: '+', label: 'Events Created', icon: Calendar },
              { value: 50000, suffix: '+', label: 'Tickets Sold', icon: Ticket },
              { value: 5000, suffix: '+', label: 'Organizers', icon: Users },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-4">
                  {i > 0 && <div className="stat-divider" />}
                  <div>
                    <p className="font-display text-3xl font-800 text-white">
                      <Counter end={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-white/40 text-xs mt-0.5 tracking-wide">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Floating card decoration */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-72 animate-fade-in">
          <div className="glass-card rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={14} className="text-green-400" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Revenue Today</p>
                <p className="text-white font-semibold font-display">₹1,24,500</p>
              </div>
            </div>
            <div className="flex gap-1">
              {[60, 40, 80, 55, 90, 70, 85, 95, 65, 75].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${h * 0.5}px`, background: `rgba(233,69,96,${0.3 + h / 200})` }} />
              ))}
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#e94560]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Ticket size={14} className="text-[#e94560]" />
            </div>
            <div>
              <p className="text-white/40 text-xs">New booking</p>
              <p className="text-white text-sm font-medium">Tech Summit 2025</p>
            </div>
            <div className="ml-auto">
              <span className="tag-chip text-green-400 bg-green-400/10 px-2 py-1 rounded-md">+₹999</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080810] to-transparent" />
    </section>
  );
}

// ── Features Section ──────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: Calendar, title: 'Event Management',
      desc: 'Physical, online ya hybrid — har type ka event create karo. Banner, description, capacity sab set karo.',
      color: '#4f8ef7', bg: 'rgba(79,142,247,0.1)',
    },
    {
      icon: Shield, title: 'Secure Payments',
      desc: 'Razorpay integration se secure payments. UPI, card, netbanking sab accept karo. Auto refund bhi.',
      color: '#22c55e', bg: 'rgba(34,197,94,0.1)',
    },
    {
      icon: BarChart3, title: 'Real-time Analytics',
      desc: 'Real-time booking stats, revenue tracking, attendee insights. Dashboard par sab kuch ek nazar mein.',
      color: '#a855f7', bg: 'rgba(168,85,247,0.1)',
    },
    {
      icon: Globe, title: 'Custom Domain',
      desc: 'Apna brand domain use karo. yourcompany.plannexa.com ya fully custom domain — Pro plan mein.',
      color: '#f97316', bg: 'rgba(249,115,22,0.1)',
    },
    {
      icon: Zap, title: 'Instant Tickets',
      desc: 'Multiple ticket types — General, VIP, Student, Early Bird. Per-user limits aur validity dates sab.',
      color: '#eab308', bg: 'rgba(234,179,8,0.1)',
    },
    {
      icon: Star, title: 'Guest Checkout',
      desc: 'Login ke bina bhi ticket book ho sakti hai. Guest checkout with email confirmation support.',
      color: '#e94560', bg: 'rgba(233,69,96,0.1)',
    },
  ];

  return (
    <section id="features" className="py-28 bg-[#080810] relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* Orb accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(233,69,96,0.05) 0%, transparent 60%)' }} />

      <div className="relative max-w-6xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="section-label mb-4">Platform Features</p>
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-white leading-tight">
            Sab Kuch Ek Platform Par
          </h2>
          <p className="text-white/40 mt-4 text-lg max-w-lg mx-auto font-light">
            Create se lekar payment tak — complete event lifecycle management
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="glass-card group rounded-2xl p-6 transition-all duration-300 cursor-default">
                <div className="relative inline-flex mb-5">
                  <div className="feature-icon-ring" />
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: feature.bg }}>
                    <Icon size={20} style={{ color: feature.color }} />
                  </div>
                </div>
                <h3 className="font-display font-700 text-white text-base mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed font-light">{feature.desc}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: feature.color }}>
                  <span>Learn more</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

// ── Events Section ────────────────────────────────────────
function EventsSection({ events, loading }) {
  return (
    <section className="py-28 bg-[#06060e] relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative max-w-6xl mx-auto px-6">

        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="section-label mb-3">Upcoming</p>
            <h2 className="font-display text-4xl font-800 text-white">Live Events</h2>
          </div>
          <Link href="/explore" className="hidden sm:flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition group">
            Sab dekho <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl">
            <p className="text-white/30 text-lg">Koi upcoming event nahi hai abhi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Link key={event.id} href={`/explore/${event.id}`}
                className="event-card group glass-card rounded-2xl overflow-hidden hover:border-[#e94560]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-900/20">

                <div className="relative h-48 overflow-hidden bg-[#1a1a2e]">
                  {event.banner_image ? (
                    <img src={event.banner_image} alt={event.title}
                      className="event-image w-full h-full object-cover transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #1a1a2e, #e94560/20)' }}>
                      <Calendar size={32} className="text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute top-3 left-3 glass-card tag-chip text-white/80 px-3 py-1.5 rounded-full capitalize">
                    {event.event_type}
                  </span>
                  {event.is_free && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white tag-chip px-3 py-1.5 rounded-full">
                      FREE
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-display font-700 text-white text-sm leading-snug line-clamp-2 group-hover:text-[#e94560] transition-colors mb-3">
                    {event.title}
                  </h3>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Calendar size={11} className="text-[#e94560] flex-shrink-0" />
                      {formatDate(event.start_datetime)}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <MapPin size={11} className="text-[#e94560] flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <span className="font-display font-700 text-sm text-white">
                      {event.is_free ? <span className="text-green-400">Free</span> : formatPrice(event.price)}
                    </span>
                    <span className="tag-chip text-[#e94560] flex items-center gap-1">
                      Book Now <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="sm:hidden mt-8 text-center">
          <Link href="/explore" className="inline-flex items-center gap-2 text-[#e94560] text-sm font-semibold">
            Sab events dekho <ChevronRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}

// ── Pricing Section ───────────────────────────────────────
function PricingSection() {
  const plans = [
    {
      name: 'Free', price: '₹0', period: '/month',
      desc: 'Shuru karne ke liye perfect',
      features: ['2 events/month', '50 tickets/event', '1 team member', 'Basic support'],
      cta: 'Get Started Free', href: '/register', highlight: false,
      accent: 'rgba(255,255,255,0.1)',
    },
    {
      name: 'Pro', price: '₹2,499', period: '/month',
      desc: 'Growing organizers ke liye',
      features: ['20 events/month', '1,000 tickets/event', '10 team members', 'Custom domain', 'Advanced analytics', 'Priority support'],
      cta: 'Start Pro Trial', href: '/register', highlight: true,
      accent: '#e94560',
    },
    {
      name: 'Enterprise', price: '₹9,999', period: '/month',
      desc: 'Large scale events ke liye',
      features: ['Unlimited events', 'Unlimited tickets', 'Unlimited members', 'Custom domain', 'Full analytics suite', 'Dedicated manager'],
      cta: 'Contact Sales', href: '/register', highlight: false,
      accent: 'rgba(255,255,255,0.1)',
    },
  ];

  return (
    <section id="pricing" className="py-28 bg-[#080810] relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(233,69,96,0.08) 0%, transparent 70%)' }} />

      <div className="relative max-w-5xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="section-label mb-4">Pricing</p>
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-white/40 mt-4 text-lg max-w-md mx-auto font-light">
            Free se shuru karo — jab chahao upgrade karo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {plans.map((plan, i) => (
            <div key={i} className={`relative rounded-3xl p-7 transition-all duration-300 ${plan.highlight
                ? 'bg-gradient-to-b from-[#1a0a10] to-[#0d0d1a] border-2 border-[#e94560]/60 pricing-glow md:scale-[1.04]'
                : 'glass-card'
              }`}>
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#e94560] text-white tag-chip px-5 py-2 rounded-full shadow-lg shadow-red-900/40">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Crown size={14} className={plan.highlight ? 'text-[#e94560]' : 'text-white/30'} />
                  <p className="font-display font-700 text-white">{plan.name}</p>
                </div>
                <p className="text-white/40 text-xs mb-5">{plan.desc}</p>
                <div className="flex items-end gap-1">
                  <span className="font-display text-4xl font-800 text-white">{plan.price}</span>
                  <span className="text-white/30 text-sm mb-1.5">{plan.period}</span>
                </div>
              </div>

              <div className="h-px bg-white/[0.06] mb-6" />

              <ul className="space-y-3 mb-7">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-[#e94560]/20' : 'bg-white/10'
                      }`}>
                      <svg className={`w-2.5 h-2.5 ${plan.highlight ? 'text-[#e94560]' : 'text-white/50'}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href} className={`glow-btn block text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${plan.highlight
                  ? 'bg-[#e94560] text-white hover:bg-[#d63651] shadow-lg shadow-red-900/30'
                  : 'border border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// ── CTA Section ───────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-28 bg-[#06060e] relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(233,69,96,0.12) 0%, transparent 65%)' }} />
      </div>

      {/* Horizontal glowing line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #e94560, transparent)', animation: 'glow-line 3s ease-in-out infinite' }} />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <p className="section-label mb-5">Start Today</p>
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-800 text-white mb-5 leading-tight">
          Aaj Hi Shuru Karo —
          <br /><span className="shimmer-text">Free Hai!</span>
        </h2>
        <p className="text-white/40 text-xl mb-10 font-light">
          5 minute mein account banao aur apna pehla event launch karo
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="glow-btn group inline-flex items-center gap-3 bg-[#e94560] text-white px-9 py-4 rounded-2xl font-semibold text-base hover:bg-[#d63651] transition-all shadow-2xl shadow-red-900/40">
            Free Account Banao
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/explore" className="group inline-flex items-center gap-3 glass-card text-white/70 px-9 py-4 rounded-2xl font-medium text-base hover:text-white transition-all">
            Events Browse Karo
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex items-center justify-center gap-6 flex-wrap">
          {['No credit card required', 'Cancel anytime', 'Free forever plan'].map((text, i) => (
            <div key={i} className="flex items-center gap-2 text-white/30 text-xs">
              <div className="w-3 h-3 rounded-full bg-green-500/30 flex items-center justify-center">
                <svg className="w-2 h-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#040408] border-t border-white/[0.04] py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="font-display text-xl font-800 text-white tracking-[0.15em]">PLANNEXA</p>
          <div className="flex items-center gap-6">
            {[
              { href: '/explore', label: 'Explore' },
              { href: '/login', label: 'Login' },
              { href: '/register', label: 'Register' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="text-white/30 hover:text-white/70 text-sm transition">
                {item.label}
              </Link>
            ))}
          </div>
          <p className="text-white/20 text-xs">© 2025 Plannexa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    PublicService.getEvents({ page_size: 6, ordering: '-start_datetime' })
      .then(res => setEvents(res.results || []))
      .catch(() => { })
      .finally(() => setLoadingEvents(false));
  }, []);

  return (
    <div className="overflow-x-hidden">
      <HomeNavbar />
      <HeroSection />
      <FeaturesSection />
      <EventsSection events={events} loading={loadingEvents} />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}