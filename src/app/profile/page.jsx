'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import {
  User, Mail, Phone, Shield, Lock, Eye, EyeOff,
  Check, X, Pencil, Save, KeyRound, ChevronRight,
  Sparkles, AlertCircle, Award,
  Calendar, Star, Heart, ShieldCheck, Fingerprint,
  Layers, Zap, Camera, Activity,
  TrendingUp, Clock, ThumbsUp, MessageCircle, Bookmark
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();

  // ── State ────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);   // user profile
  const [organizer, setOrganizer] = useState(null);   // organizer profile
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '', mobile_number: ''
  });
  const [pwForm, setPwForm] = useState({
    current_password: '', new_password: '', confirm_password: ''
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false, new: false, confirm: false
  });

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // ── Fetch user + organizer profile ───────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, orgRes] = await Promise.all([
          api.get('/api/users/profile/'),
          api.get('/org/profile/').catch(() => null),
        ]);

        setProfile(userRes.data);
        setForm({
          username: userRes.data.username || '',
          email: userRes.data.email || '',
          first_name: userRes.data.first_name || '',
          last_name: userRes.data.last_name || '',
          mobile_number: userRes.data.mobile_number || '',
        });

        if (orgRes) setOrganizer(orgRes.data);
      } catch (e) {
        toast.error('Profile load nahi hua.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);
  // page.jsx mein temporarily add karo
  useEffect(() => {
    if (organizer) console.log('organizer data:', organizer);
  }, [organizer]);
  // ── Save user profile (text fields) ──────────────────────
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/api/users/profile/', form);
      setProfile(res.data);
      setForm({
        username: res.data.username || '',
        email: res.data.email || '',
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        mobile_number: res.data.mobile_number || '',
      });
      // localStorage sync
      const stored = JSON.parse(localStorage.getItem('plannexa_user') || '{}');
      localStorage.setItem('plannexa_user', JSON.stringify({
        ...stored,
        username: res.data.username,
        email: res.data.email,
        role: res.data.role,
      }));
      setEditMode(false);
      toast.success('Profile updated! 🎉');
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Image upload (logo / cover_image) ────────────────────
  const handleImageUpload = async (file, field) => {
    if (!file) return;
    const setter = field === 'logo' ? setUploadingLogo : setUploadingCover;
    setter(true);
    try {
      const formData = new FormData();
      formData.append(field, file);
      const res = await api.patch('/org/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOrganizer(res.data);
      toast.success(field === 'logo' ? 'Profile picture updated!' : 'Cover updated!');
    } catch {
      toast.error('Image upload failed.');
    } finally {
      setter(false);
    }
  };

  // ── Change password ───────────────────────────────────────
  const handleChangePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('Passwords do not match!'); return;
    }
    if (pwForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters.'); return;
    }
    setPwSaving(true);
    try {
      await api.post('/api/users/profile/change-password/', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      toast.success('Password changed! Logging out... 🔐');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => router.push('/login'), 1500);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Password change failed.');
    } finally {
      setPwSaving(false);
    }
  };

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

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
        </div>
      </div>
    </div>
  );

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'activity', label: 'Activity', icon: Clock },
    { id: 'achievements', label: 'Achievements', icon: Award },
  ];

  const stats = [
    { label: 'Projects', value: '24', icon: Layers, color: 'from-blue-400 to-blue-600', change: '+12%' },
    { label: 'Followers', value: '1.2k', icon: Heart, color: 'from-rose-400 to-rose-600', change: '+23%' },
    { label: 'Following', value: '342', icon: User, color: 'from-emerald-400 to-emerald-600', change: '+5%' },
    { label: 'Contributions', value: '89', icon: Award, color: 'from-amber-400 to-amber-600', change: '+18%' },
  ];

  const recentActivity = [
    { action: 'Completed project "AI Dashboard"', time: '2 hours ago', icon: Check, color: 'emerald' },
    { action: 'Joined team "Design System"', time: 'yesterday', icon: UsersIcon, color: 'blue' },
    { action: 'Earned "Expert" badge', time: '3 days ago', icon: Award, color: 'amber' },
  ];

  const currentNavItem = navItems.find(i => i.id === activeSection);
  const CurrentIcon = currentNavItem?.icon;

  const isOrganizer = profile?.role === 'organizer';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-4 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Mobile nav dropdown */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2">
                {CurrentIcon && <CurrentIcon size={18} className="text-rose-500" />}
                <span className="text-sm font-medium text-gray-700">{currentNavItem?.label}</span>
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
                      onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition ${activeSection === item.id ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
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

          {/* ── Hero Profile Section ── */}
          <div className="mb-6 sm:mb-8">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">

              {/* Cover Image */}
              <div className="h-32 sm:h-40 md:h-48 relative bg-gradient-to-r from-rose-100 via-pink-100 to-purple-100">

                {/* img absolute karo taaki button uske upar rahe */}
                {organizer?.cover_image ? (
                  <img src={organizer.cover_image} className="absolute inset-0 w-full h-full object-cover" alt="Cover" />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    alt="Cover"
                  />
                )}

                {/* Cover upload button */}
                {isOrganizer && (
                  <>
                    <button
                      onClick={() => coverInputRef.current.click()}
                      disabled={uploadingCover}
                      className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-xs text-gray-700 flex items-center gap-1 hover:bg-white transition shadow-sm disabled:opacity-60"
                    >
                      {uploadingCover
                        ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        : <Camera size={12} />
                      }
                      <span className="hidden sm:inline">Change Cover</span>
                    </button>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleImageUpload(e.target.files[0], 'cover_image')}
                    />
                  </>
                )}
              </div>

              {/* Profile Info */}
              <div className="relative px-4 sm:px-6 pb-4 sm:pb-6 -mt-12 sm:-mt-16">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">

                  {/* Avatar */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-pink-400 rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg overflow-hidden">
                      {organizer?.logo ? (
                        <img src={organizer.logo} className="w-full h-full object-cover" alt="Logo" />
                      ) : (
                        <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                          {profile?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>

                    {isOrganizer && (
                      <>
                        <button
                          onClick={() => avatarInputRef.current.click()}
                          disabled={uploadingLogo}
                          className="absolute -bottom-2 -right-2 z-10 p-1 sm:p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition disabled:opacity-60"
                        >
                          {uploadingLogo
                            ? <div className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                            : <Camera size={10} className="text-rose-500" />
                          }
                        </button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageUpload(e.target.files[0], 'logo')}
                        />
                      </>
                    )}
                  </div>

                  {/* User Details */}
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                        {profile?.username || 'User'}
                      </h1>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-full">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-600">Verified</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-medium capitalize">
                        {profile?.role || 'User'}
                      </span>
                      {isOrganizer && organizer?.name && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                          {organizer.name}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-sm">
                        <Mail size={14} className="text-gray-400 shrink-0" />
                        <span className="break-all sm:break-normal">{profile?.email || '—'}</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-sm">
                        <Phone size={14} className="text-gray-400 shrink-0" />
                        <span>{profile?.mobile_number || '—'}</span>
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
                      <StatIcon size={14} className="text-white" />
                    </div>
                    <span className="text-[10px] sm:text-xs text-emerald-600 font-medium">{stat.change}</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">

            {/* Left Sidebar — Desktop */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
                <div className="space-y-2">
                  {navItems.map(item => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === item.id
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
                </div>
              </div>
            </div>

            {/* Right — Dynamic Content */}
            <div className="lg:col-span-2">

              {/* Overview */}
              {activeSection === 'overview' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-rose-500" />
                      Recent Activity
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {recentActivity.map((activity, idx) => {
                        const ActivityIcon = activity.icon;
                        return (
                          <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50">
                            <div className={`p-1.5 sm:p-2 rounded-lg bg-${activity.color}-100 shrink-0`}>
                              <ActivityIcon size={12} className={`text-${activity.color}-600`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-gray-700 truncate">{activity.action}</p>
                              <p className="text-[10px] sm:text-xs text-gray-400">{activity.time}</p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 transition shrink-0">
                              <ThumbsUp size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Info */}
              {activeSection === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
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
                        <button onClick={handleCancelEdit} className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition">
                          Cancel
                        </button>
                        <button onClick={handleSaveProfile} disabled={saving} className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-sm disabled:opacity-60">
                          {saving
                            ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            : <Save size={14} />
                          }
                          Save
                        </button>
                      </div>
                    )}
                  </div>

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
                            <FieldIcon size={10} />
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
                            <p className="text-gray-700 text-xs sm:text-sm py-1.5 sm:py-2 break-all">
                              {field.value || <span className="text-gray-400">Not set</span>}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Organizer info — read only */}
                  {isOrganizer && organizer && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Organizer Details</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { label: 'Org Name', value: organizer.name },
                          { label: 'Subdomain', value: organizer.subdomain },
                          { label: 'Domain', value: organizer.domain },
                          { label: 'Org Number', value: organizer.org_number },
                        ].map(item => (
                          <div key={item.label} className="space-y-1">
                            <label className="text-[10px] text-gray-500">{item.label}</label>
                            <p className="text-gray-700 text-xs sm:text-sm py-1.5 break-all">
                              {item.value || <span className="text-gray-400">Not set</span>}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Security */}
              {activeSection === 'security' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Shield size={16} className="text-rose-500" />
                    Security Settings
                  </h3>

                  <div className="mb-4 p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-2 sm:gap-3">
                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-amber-800">Security Notice</p>
                      <p className="text-[10px] sm:text-xs text-amber-600 mt-0.5">You'll be logged out after changing your password.</p>
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
                            <FieldIcon size={10} />
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
                              {showPassword[field.field] ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {pwForm.new_password && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= (
                              (pwForm.new_password.length >= 8 ? 1 : 0) +
                              (/(?=.*[A-Z])/.test(pwForm.new_password) ? 1 : 0) +
                              (/(?=.*[0-9])/.test(pwForm.new_password) ? 1 : 0) +
                              (/(?=.*[^A-Za-z0-9])/.test(pwForm.new_password) ? 1 : 0)
                            ) ? 'bg-emerald-500' : 'bg-gray-200'
                              }`} />
                          ))}
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500">Use 8+ chars with uppercase, number & special char</p>
                      </div>
                    )}

                    {pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password && (
                      <p className="text-[10px] sm:text-xs text-red-500 flex items-center gap-1">
                        <X size={10} /> Passwords do not match
                      </p>
                    )}

                    <button
                      onClick={handleChangePassword}
                      disabled={pwSaving || !pwForm.current_password || !pwForm.new_password || pwForm.new_password !== pwForm.confirm_password}
                      className="w-full mt-2 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs sm:text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                      {pwSaving
                        ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <Fingerprint size={14} />
                      }
                      Update Password
                    </button>
                  </div>
                </div>
              )}

              {/* Activity */}
              {activeSection === 'activity' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Activity Timeline</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-gray-50">
                        <div className="w-px bg-gradient-to-b from-rose-500 to-transparent" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-700">Contributed to project</p>
                            <span className="text-[10px] sm:text-xs text-gray-400">{i + 1} day{i ? 's' : ''} ago</span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-500">Added new feature to the dashboard component</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {activeSection === 'achievements' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Badges & Achievements</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { name: 'Early Bird', icon: SunIcon, desc: 'Joined in 2024' },
                      { name: 'Problem Solver', icon: Zap, desc: 'Solved 50 issues' },
                      { name: 'Team Player', icon: UsersIcon, desc: '5 team contributions' },
                      { name: 'Code Master', icon: Award, desc: '1k+ commits' },
                      { name: 'Design Guru', icon: Star, desc: 'UI/UX expert' },
                      { name: 'Mentor', icon: Heart, desc: 'Helped 10+ devs' },
                    ].map(badge => {
                      const BadgeIcon = badge.icon;
                      return (
                        <div key={badge.name} className="text-center p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition group">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2 group-hover:scale-110 transition shadow-sm">
                            <BadgeIcon size={16} className="text-white" />
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

// ── Helper SVG components ─────────────────────────────────
function UsersIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SunIcon(props) {
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