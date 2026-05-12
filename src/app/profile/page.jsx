'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, Shield, Lock, Eye, EyeOff,
  Check, X, Pencil, Save, KeyRound, ChevronRight,
  Sparkles, AlertCircle, Globe, MapPin, Award,
  Calendar, Moon, Star, Heart, ShieldCheck, Fingerprint,
  Layers, Zap, Camera, Bell, Gift, Crown, LogOut,
  Settings, HelpCircle, Share2, Download, Activity,
  TrendingUp, Clock, ThumbsUp, MessageCircle, Bookmark
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.detail || 'Something went wrong');
  return data;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', mobile_number: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    apiFetch('/api/users/profile/')
      .then(data => {
        setProfile(data);
        setForm({
          username: data.username || '',
          email: data.email || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          mobile_number: data.mobile_number || '',
        });
      })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await apiFetch('/api/users/profile/', {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      setProfile(updated);
      setForm({
        username: updated.username || '',
        email: updated.email || '',
        first_name: updated.first_name || '',
        last_name: updated.last_name || '',
        mobile_number: updated.mobile_number || '',
      });
      const stored = JSON.parse(localStorage.getItem('plannexa_user') || '{}');
      const merged = { ...stored, username: updated.username, email: updated.email, role: updated.role };
      localStorage.setItem('plannexa_user', JSON.stringify(merged));
      setEditMode(false);
      toast.success('Profile updated! 🎉');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('New passwords do not match!');
      return;
    }
    if (pwForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setPwSaving(true);
    try {
      await apiFetch('/api/users/profile/change-password/', {
        method: 'POST',
        body: JSON.stringify({
          current_password: pwForm.current_password,
          new_password: pwForm.new_password,
        }),
      });
      toast.success('Password changed! Please login again. 🔐');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => router.push('/login'), 1500);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
        </div>
      </div>
    </div>
  );

  const stats = [
    { label: 'Projects', value: '24', icon: Layers, color: 'from-blue-500 to-cyan-500', change: '+12%' },
    { label: 'Followers', value: '1.2k', icon: Heart, color: 'from-rose-500 to-pink-500', change: '+23%' },
    { label: 'Following', value: '342', icon: User, color: 'from-emerald-500 to-teal-500', change: '+5%' },
    { label: 'Contributions', value: '89', icon: Award, color: 'from-amber-500 to-orange-500', change: '+18%' },
  ];

  const recentActivity = [
    { action: 'Completed project "AI Dashboard"', time: '2 hours ago', icon: Check, color: 'emerald' },
    { action: 'Joined team "Design System"', time: 'yesterday', icon: Users, color: 'blue' },
    { action: 'Earned "Expert" badge', time: '3 days ago', icon: Award, color: 'amber' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072')] bg-cover bg-center opacity-5" />
      </div>

      <div className="relative z-10">
        {/* Header Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Planexa</span>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 rounded-xl hover:bg-white/10 transition-all">
                  <HelpCircle size={18} />
                </button>
                <button className="p-2 rounded-xl hover:bg-white/10 transition-all">
                  <Settings size={18} />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all">
                  <LogOut size={16} />
                  <span className="text-sm font-medium hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Hero Profile Section */}
            <div className="mb-12">
              <div className="relative rounded-3xl overflow-hidden">
                {/* Cover Image */}
                <div className="h-48 md:h-64 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 via-pink-600/50 to-blue-600/50" />
                  <img 
                    src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029" 
                    className="w-full h-full object-cover"
                    alt="Cover"
                  />
                  <button className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-xs flex items-center gap-1 hover:bg-black/70 transition">
                    <Camera size={12} />
                    Change Cover
                  </button>
                </div>

                {/* Profile Info Overlay */}
                <div className="relative px-6 pb-6 -mt-16">
                  <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                      <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <span className="text-4xl md:text-5xl font-bold text-white">
                          {profile?.username?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition">
                        <Camera size={12} className="text-purple-600" />
                      </button>
                    </div>

                    {/* User Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl md:text-4xl font-bold">{profile?.username}</h1>
                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-full">
                          <ShieldCheck size={12} className="text-emerald-400" />
                          <span className="text-xs font-medium text-emerald-400">Verified</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Mail size={14} />
                          <span className="text-sm">{profile?.email}</span>
                        </div>
                        {profile?.mobile_number && (
                          <div className="flex items-center gap-1 text-gray-400">
                            <Phone size={14} />
                            <span className="text-sm">{profile?.mobile_number}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-400">
                          <Calendar size={14} />
                          <span className="text-sm">Joined 2024</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-medium">
                          {profile?.role || 'Member'}
                        </span>
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-medium">
                          Premium
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center gap-2">
                        <MessageCircle size={16} />
                        <span className="text-sm hidden sm:inline">Message</span>
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition flex items-center gap-2">
                        <User size={16} />
                        <span className="text-sm hidden sm:inline">Follow</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {stats.map((stat, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/0 rounded-2xl blur-xl group-hover:blur-2xl transition" />
                  <div className="relative p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${stat.color}`}>
                        <stat.icon size={16} />
                      </div>
                      <span className="text-xs text-emerald-400">{stat.change}</span>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Navigation & Info */}
              <div className="lg:col-span-1 space-y-6">
                {/* Navigation Cards */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
                  <div className="space-y-2">
                    {[
                      { id: 'overview', label: 'Overview', icon: Activity },
                      { id: 'profile', label: 'Profile Info', icon: User },
                      { id: 'security', label: 'Security', icon: Shield },
                      { id: 'activity', label: 'Activity', icon: Clock },
                      { id: 'achievements', label: 'Achievements', icon: Award },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          activeSection === item.id
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white'
                            : 'hover:bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        <item.icon size={18} />
                        <span className="text-sm font-medium">{item.label}</span>
                        <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-purple-400" />
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Profile Completion</span>
                        <span className="text-purple-400">85%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Streak</span>
                        <span className="text-purple-400">12 days</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[60%] bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Star size={16} className="text-amber-400" />
                    Top Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Next.js', 'UI/UX', 'Tailwind', 'Node.js'].map(skill => (
                      <span key={skill} className="px-2 py-1 text-xs rounded-lg bg-white/10 text-gray-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Dynamic Content */}
              <div className="lg:col-span-2">
                {/* Overview Section */}
                {activeSection === 'overview' && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Recent Activity */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-purple-400" />
                        Recent Activity
                      </h3>
                      <div className="space-y-3">
                        {recentActivity.map((activity, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                            <div className={`p-2 rounded-lg bg-${activity.color}-500/20`}>
                              <activity.icon size={14} className={`text-${activity.color}-400`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{activity.action}</p>
                              <p className="text-xs text-gray-500">{activity.time}</p>
                            </div>
                            <button className="text-gray-500 hover:text-white transition">
                              <ThumbsUp size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Featured Projects */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                      <h3 className="text-lg font-semibold mb-4">Featured Projects</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[1, 2].map(i => (
                          <div key={i} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-4 hover:scale-105 transition">
                            <div className="absolute top-2 right-2 p-1 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition">
                              <Bookmark size={12} />
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
                              <Layers size={16} />
                            </div>
                            <h4 className="font-semibold">AI Analytics Dashboard</h4>
                            <p className="text-xs text-gray-400 mt-1">React • D3 • Tailwind</p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex -space-x-2">
                                {[...Array(3)].map((_, j) => (
                                  <div key={j} className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-white/10" />
                                ))}
                              </div>
                              <span className="text-xs text-emerald-400">+24 commits</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Info Section */}
                {activeSection === 'profile' && (
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Personal Information</h3>
                      {!editMode ? (
                        <button
                          onClick={() => setEditMode(true)}
                          className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm font-medium transition flex items-center gap-2"
                        >
                          <Pencil size={14} />
                          Edit Profile
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={handleCancelEdit} className="px-3 py-1.5 rounded-lg bg-white/10 text-sm">Cancel</button>
                          <button onClick={handleSaveProfile} disabled={saving} className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-sm font-medium flex items-center gap-2">
                            {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          { label: 'Username', value: form.username, field: 'username', icon: User },
                          { label: 'Email', value: form.email, field: 'email', icon: Mail, type: 'email' },
                          { label: 'First Name', value: form.first_name, field: 'first_name', icon: User },
                          { label: 'Last Name', value: form.last_name, field: 'last_name', icon: User },
                          { label: 'Mobile Number', value: form.mobile_number, field: 'mobile_number', icon: Phone, type: 'tel' },
                          { label: 'Role', value: profile?.role, field: 'role', icon: Shield, readOnly: true },
                        ].map(field => (
                          <div key={field.label} className="space-y-1">
                            <label className="text-xs text-gray-400 flex items-center gap-1">
                              <field.icon size={10} />
                              {field.label}
                            </label>
                            {editMode && !field.readOnly ? (
                              <input
                                type={field.type || 'text'}
                                value={field.value}
                                onChange={e => setForm(f => ({ ...f, [field.field]: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-purple-500 focus:outline-none transition"
                              />
                            ) : (
                              <p className="text-white text-sm py-2">{field.value || <span className="text-gray-500">Not set</span>}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Section */}
                {activeSection === 'security' && (
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 animate-fadeIn">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Shield size={18} className="text-purple-400" />
                      Security Settings
                    </h3>
                    
                    {/* Warning Card */}
                    <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
                      <AlertCircle size={18} className="text-amber-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-400">Security Notice</p>
                        <p className="text-xs text-gray-400 mt-0.5">You'll be logged out after changing your password for security reasons.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: 'Current Password', field: 'current_password', icon: Lock },
                        { label: 'New Password', field: 'new_password', icon: KeyRound },
                        { label: 'Confirm Password', field: 'confirm_password', icon: Lock },
                      ].map(field => (
                        <div key={field.label} className="space-y-1">
                          <label className="text-xs text-gray-400 flex items-center gap-1">
                            <field.icon size={10} />
                            {field.label}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword[field.field] ? 'text' : 'password'}
                              value={pwForm[field.field]}
                              onChange={e => setPwForm(f => ({ ...f, [field.field]: e.target.value }))}
                              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-purple-500 focus:outline-none transition pr-10"
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                            />
                            <button
                              onClick={() => setShowPassword(prev => ({ ...prev, [field.field]: !prev[field.field] }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                            >
                              {showPassword[field.field] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Password Strength */}
                      {pwForm.new_password && (
                        <div className="space-y-2">
                          <div className="flex gap-1">
                            {[1,2,3,4].map(i => (
                              <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
                                i <= (pwForm.new_password.length >= 8 ? 1 : 0) + 
                                   (/(?=.*[A-Z])/.test(pwForm.new_password) ? 1 : 0) +
                                   (/(?=.*[0-9])/.test(pwForm.new_password) ? 1 : 0) +
                                   (/(?=.*[^A-Za-z0-9])/.test(pwForm.new_password) ? 1 : 0)
                                ? 'bg-emerald-500' : 'bg-white/20'
                              }`} />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400">Use 8+ chars with uppercase, number & special char</p>
                        </div>
                      )}
                      
                      {pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <X size={12} /> Passwords do not match
                        </p>
                      )}
                      
                      <button
                        onClick={handleChangePassword}
                        disabled={pwSaving || !pwForm.current_password || !pwForm.new_password || pwForm.new_password !== pwForm.confirm_password}
                        className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {pwSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Fingerprint size={16} />}
                        Update Password
                      </button>
                    </div>
                  </div>
                )}

                {/* Activity Section */}
                {activeSection === 'activity' && (
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 animate-fadeIn">
                    <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/5">
                          <div className="w-px h-full bg-gradient-to-b from-purple-500 to-transparent" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium">Contributed to project</p>
                              <span className="text-xs text-gray-500">{i+1} day{i ? 's' : ''} ago</span>
                            </div>
                            <p className="text-xs text-gray-400">Added new feature to the dashboard component</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements Section */}
                {activeSection === 'achievements' && (
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 animate-fadeIn">
                    <h3 className="text-lg font-semibold mb-4">Badges & Achievements</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {[
                        { name: 'Early Bird', icon: Sun, desc: 'Joined in 2024' },
                        { name: 'Problem Solver', icon: Zap, desc: 'Solved 50 issues' },
                        { name: 'Team Player', icon: Users, desc: '5 team contributions' },
                        { name: 'Code Master', icon: Award, desc: '1k+ commits' },
                        { name: 'Design Guru', icon: Star, desc: 'UI/UX expert' },
                        { name: 'Mentor', icon: Heart, desc: 'Helped 10+ devs' },
                      ].map(badge => (
                        <div key={badge.name} className="text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition group">
                          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                            <badge.icon size={20} />
                          </div>
                          <p className="text-sm font-medium">{badge.name}</p>
                          <p className="text-xs text-gray-500">{badge.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

// Missing component
function Users(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

function Sun(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}