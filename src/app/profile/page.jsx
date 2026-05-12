'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import {
  User, Mail, Phone, Shield, Lock, Eye, EyeOff,
  Check, X, Pencil, Save, KeyRound, ChevronRight,
  Sparkles, AlertCircle, Award,
  Calendar, Star, Heart, ShieldCheck, Fingerprint,
  Layers, Zap, Camera, Activity,
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

export default function ProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-500 rounded-full animate-ping" />
        </div>
      </div>
    </div>
  );

  const stats = [
    { label: 'Projects', value: '24', icon: Layers, color: 'from-blue-400 to-blue-600', change: '+12%' },
    { label: 'Followers', value: '1.2k', icon: Heart, color: 'from-rose-400 to-rose-600', change: '+23%' },
    { label: 'Following', value: '342', icon: User, color: 'from-emerald-400 to-emerald-600', change: '+5%' },
    { label: 'Contributions', value: '89', icon: Award, color: 'from-amber-400 to-amber-600', change: '+18%' },
  ];

  const recentActivity = [
    { action: 'Completed project "AI Dashboard"', time: '2 hours ago', icon: Check, color: 'emerald' },
    { action: 'Joined team "Design System"', time: 'yesterday', icon: Users, color: 'blue' },
    { action: 'Earned "Expert" badge', time: '3 days ago', icon: Award, color: 'amber' },
  ];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'activity', label: 'Activity', icon: Clock },
    { id: 'achievements', label: 'Achievements', icon: Award },
  ];

  const handleCancelEdit = () => {
    setEditMode(false);
    setForm({
      username: profile?.username || '',
      email: profile?.email || '',
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      mobile_number: profile?.mobile_number || '',
    });
  };

  const currentNavItem = navItems.find(item => item.id === activeSection);
  const CurrentIcon = currentNavItem?.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-4 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Navigation Dropdown */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2">
                {CurrentIcon && <CurrentIcon size={18} className="text-rose-500" />}
                <span className="text-sm font-medium text-gray-700">
                  {currentNavItem?.label}
                </span>
              </div>
              <ChevronRight size={16} className={`text-gray-400 transition-transform ${mobileMenuOpen ? 'rotate-90' : ''}`} />
            </button>
            
            {mobileMenuOpen && (
              <div className="mt-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {navItems.map(item => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                        activeSection === item.id
                          ? 'bg-rose-50 text-rose-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <ItemIcon size={18} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

{/* Hero Profile Section */}
<div className="mb-6 sm:mb-8">
  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
    {/* Cover Image */}
    <div className="h-32 sm:h-40 md:h-48 relative bg-gradient-to-r from-rose-100 via-pink-100 to-purple-100">
      <img 
        src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029" 
        className="w-full h-full object-cover opacity-60"
        alt="Cover"
      />
      <button className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-xs text-gray-700 flex items-center gap-1 hover:bg-white transition shadow-sm">
        <Camera size={12} />
        <span className="hidden sm:inline">Change Cover</span>
      </button>
    </div>

    {/* Profile Info Overlay */}
    <div className="relative px-4 sm:px-6 pb-4 sm:pb-6 -mt-12 sm:-mt-16">
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-pink-400 rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              {profile?.username?.[0]?.toUpperCase() || 'R'}
            </span>
          </div>
          <button className="absolute -bottom-2 -right-2 p-1 sm:p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition">
            <Camera size={10} className="sm:text-xs text-rose-500" />
          </button>
        </div>

        {/* User Details - Fixed Layout */}
        <div className="flex-1 w-full">
          {/* Name and Verification Badge */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              {profile?.username || 'rohit'}
            </h1>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-full">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600">Verified</span>
            </div>
          </div>
          
          {/* Role Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
            <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-medium capitalize">
              {profile?.role || 'Organizer'}
            </span>
            <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium flex items-center gap-1">
              <Sparkles size={10} />
              Premium
            </span>
          </div>
          
          {/* Contact Information - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-sm">
              <Mail size={14} className="text-gray-400 shrink-0" />
              <span className="break-all sm:break-normal">{profile?.email || 'rohitkumarsah1912@gmail.com'}</span>
            </div>
            
            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-sm">
              <Phone size={14} className="text-gray-400 shrink-0" />
              <span>{profile?.mobile_number || '8340662832'}</span>
            </div>
            
            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-sm">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              <span>Joined 2024</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center gap-2 text-gray-700 text-sm">
            <MessageCircle size={16} />
            <span>Message</span>
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 transition flex items-center justify-center gap-2 text-white text-sm shadow-md">
            <User size={16} />
            <span>Follow</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>


          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {stats.map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div key={idx} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${stat.color} shadow-sm`}>
                      <StatIcon size={14} className="sm:text-base text-white" />
                    </div>
                    <span className="text-[10px] sm:text-xs text-emerald-600 font-medium">{stat.change}</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Desktop Navigation */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
                <div className="space-y-2">
                  {navItems.map(item => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          activeSection === item.id
                            ? 'bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 text-rose-700'
                            : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <ItemIcon size={18} />
                        <span className="text-sm font-medium">{item.label}</span>
                        <ChevronRight size={14} className="ml-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-rose-500" />
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Profile Completion</span>
                      <span className="text-rose-600 font-medium">85%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Streak</span>
                      <span className="text-rose-600 font-medium">12 days</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-[60%] bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Star size={16} className="text-amber-500" />
                  Top Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Next.js', 'UI/UX', 'Tailwind', 'Node.js'].map(skill => (
                    <span key={skill} className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Dynamic Content */}
            <div className="lg:col-span-2">
              {activeSection === 'overview' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Activity size={16} className="sm:text-lg text-rose-500" />
                      Recent Activity
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {recentActivity.map((activity, idx) => {
                        const ActivityIcon = activity.icon;
                        return (
                          <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50">
                            <div className={`p-1.5 sm:p-2 rounded-lg bg-${activity.color}-100 shrink-0`}>
                              <ActivityIcon size={12} className={`sm:text-sm text-${activity.color}-600`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-gray-700 truncate">{activity.action}</p>
                              <p className="text-[10px] sm:text-xs text-gray-400">{activity.time}</p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 transition shrink-0">
                              <ThumbsUp size={12} className="sm:text-sm" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Featured Projects</h3>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {[1, 2].map(i => (
                        <div key={i} className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-3 sm:p-4 hover:shadow-md transition">
                          <div className="absolute top-2 right-2 p-1 bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition">
                            <Bookmark size={10} className="sm:text-xs text-gray-600" />
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-2 sm:mb-3 shadow-sm">
                            <Layers size={14} className="sm:text-base text-white" />
                          </div>
                          <h4 className="text-sm sm:text-base font-semibold text-gray-800">AI Analytics Dashboard</h4>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">React • D3 • Tailwind</p>
                          <div className="flex items-center justify-between mt-2 sm:mt-3">
                            <div className="flex -space-x-2">
                              {[...Array(3)].map((_, j) => (
                                <div key={j} className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-300 border border-white" />
                              ))}
                            </div>
                            <span className="text-[10px] sm:text-xs text-emerald-600 font-medium">+24 commits</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Personal Information</h3>
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-medium transition flex items-center justify-center gap-2"
                      >
                        <Pencil size={14} />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={handleCancelEdit} className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition">Cancel</button>
                        <button onClick={handleSaveProfile} disabled={saving} className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-sm">
                          {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { label: 'Username', value: form.username, field: 'username', icon: User },
                        { label: 'Email', value: form.email, field: 'email', icon: Mail, type: 'email' },
                        { label: 'First Name', value: form.first_name, field: 'first_name', icon: User },
                        { label: 'Last Name', value: form.last_name, field: 'last_name', icon: User },
                        { label: 'Mobile Number', value: form.mobile_number, field: 'mobile_number', icon: Phone, type: 'tel' },
                        { label: 'Role', value: profile?.role, field: 'role', icon: Shield, readOnly: true },
                      ].map(field => {
                        const FieldIcon = field.icon;
                        return (
                          <div key={field.label} className="space-y-1">
                            <label className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                              <FieldIcon size={10} className="sm:text-xs" />
                              {field.label}
                            </label>
                            {editMode && !field.readOnly ? (
                              <input
                                type={field.type || 'text'}
                                value={field.value}
                                onChange={e => setForm(f => ({ ...f, [field.field]: e.target.value }))}
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-xs sm:text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
                              />
                            ) : (
                              <p className="text-gray-700 text-xs sm:text-sm py-1.5 sm:py-2 break-all">{field.value || <span className="text-gray-400">Not set</span>}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Shield size={16} className="sm:text-lg text-rose-500" />
                    Security Settings
                  </h3>
                  
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-amber-50 border border-amber-200 flex gap-2 sm:gap-3">
                    <AlertCircle size={16} className="sm:text-lg text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-amber-800">Security Notice</p>
                      <p className="text-[10px] sm:text-xs text-amber-600 mt-0.5">You'll be logged out after changing your password for security reasons.</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { label: 'Current Password', field: 'current_password', icon: Lock },
                      { label: 'New Password', field: 'new_password', icon: KeyRound },
                      { label: 'Confirm Password', field: 'confirm_password', icon: Lock },
                    ].map(field => {
                      const FieldIcon = field.icon;
                      return (
                        <div key={field.label} className="space-y-1">
                          <label className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                            <FieldIcon size={10} className="sm:text-xs" />
                            {field.label}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword[field.field] ? 'text' : 'password'}
                              value={pwForm[field.field]}
                              onChange={e => setPwForm(f => ({ ...f, [field.field]: e.target.value }))}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-xs sm:text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 transition pr-8 sm:pr-10"
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                            />
                            <button
                              onClick={() => setShowPassword(prev => ({ ...prev, [field.field]: !prev[field.field] }))}
                              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                              {showPassword[field.field] ? <EyeOff size={12} className="sm:text-sm" /> : <Eye size={12} className="sm:text-sm" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                    {pwForm.new_password && (
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
                              i <= (pwForm.new_password.length >= 8 ? 1 : 0) + 
                                 (/(?=.*[A-Z])/.test(pwForm.new_password) ? 1 : 0) +
                                 (/(?=.*[0-9])/.test(pwForm.new_password) ? 1 : 0) +
                                 (/(?=.*[^A-Za-z0-9])/.test(pwForm.new_password) ? 1 : 0)
                              ? 'bg-emerald-500' : 'bg-gray-200'
                            }`} />
                          ))}
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500">Use 8+ chars with uppercase, number & special char</p>
                      </div>
                    )}
                    
                    {pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password && (
                      <p className="text-[10px] sm:text-xs text-red-500 flex items-center gap-1">
                        <X size={10} className="sm:text-xs" /> Passwords do not match
                      </p>
                    )}
                    
                    <button
                      onClick={handleChangePassword}
                      disabled={pwSaving || !pwForm.current_password || !pwForm.new_password || pwForm.new_password !== pwForm.confirm_password}
                      className="w-full mt-3 sm:mt-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs sm:text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                      {pwSaving ? <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Fingerprint size={14} className="sm:text-base" />}
                      Update Password
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'activity' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Activity Timeline</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50">
                        <div className="w-px h-full bg-gradient-to-b from-rose-500 to-transparent" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 mb-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-700">Contributed to project</p>
                            <span className="text-[10px] sm:text-xs text-gray-400">{i+1} day{i ? 's' : ''} ago</span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-500 break-words">Added new feature to the dashboard component</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'achievements' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Badges & Achievements</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { name: 'Early Bird', icon: Sun, desc: 'Joined in 2024' },
                      { name: 'Problem Solver', icon: Zap, desc: 'Solved 50 issues' },
                      { name: 'Team Player', icon: Users, desc: '5 team contributions' },
                      { name: 'Code Master', icon: Award, desc: '1k+ commits' },
                      { name: 'Design Guru', icon: Star, desc: 'UI/UX expert' },
                      { name: 'Mentor', icon: Heart, desc: 'Helped 10+ devs' },
                    ].map(badge => {
                      const BadgeIcon = badge.icon;
                      return (
                        <div key={badge.name} className="text-center p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 transition group">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-1 sm:mb-2 group-hover:scale-110 transition shadow-sm">
                            <BadgeIcon size={16} className="sm:text-xl text-white" />
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-gray-800">{badge.name}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">{badge.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function Users(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function Sun(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}