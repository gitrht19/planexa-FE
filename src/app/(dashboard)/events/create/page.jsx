'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import EventService from '@/services/event.service';
import { getErrorMessage } from '@/lib/utils';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [bannerPreview, setBannerPreview] = useState(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { event_type: 'physical', is_free: false }
  });

  const eventType = watch('event_type');
  const isFree = watch('is_free');

  useEffect(() => {
    EventService.getCategories()
      .then(res => setCategories(res.results || []))
      .catch(() => {});
  }, []);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) setBannerPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.keys(data).forEach(key => {
        if (key === 'banner_image') {
          if (data[key]?.[0]) formData.append(key, data[key][0]);
        } else if (key === 'is_free') {
          formData.append(key, data[key] ? 'true' : 'false');
        } else if (data[key] !== '' && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      await EventService.createEvent(formData);
      toast.success('Event created successfully!');
      router.push('/events');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/events" className="p-2 rounded-xl hover:bg-gray-100 transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create Event</h1>
          <p className="text-gray-500 text-sm mt-0.5">Naya event banao</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-800">Basic Information</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
            <input
              {...register('title', { required: 'Title required hai' })}
              placeholder="e.g. Tech Conference 2025"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Event ke baare mein batao..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm resize-none"
            />
          </div>

          {/* Category + Event Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm bg-white"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
              <select
                {...register('event_type', { required: true })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm bg-white"
              >
                <option value="physical">Physical</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
            <div className="relative">
              {bannerPreview ? (
                <div className="relative">
                  <img src={bannerPreview} alt="Banner" className="w-full h-40 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => setBannerPreview(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#e94560] transition">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-400">Banner upload karo</p>
                  <input
                    {...register('banner_image')}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Date & Location */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-800">Date & Location</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
              <input
                {...register('start_datetime', { required: 'Start time required hai' })}
                type="datetime-local"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
              />
              {errors.start_datetime && <p className="text-red-500 text-xs mt-1">{errors.start_datetime.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
              <input
                {...register('end_datetime', { required: 'End time required hai' })}
                type="datetime-local"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
              />
              {errors.end_datetime && <p className="text-red-500 text-xs mt-1">{errors.end_datetime.message}</p>}
            </div>
          </div>

          {/* Location — Physical/Hybrid */}
          {(eventType === 'physical' || eventType === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                {...register('location', {
                  required: eventType !== 'online' ? 'Location required hai' : false
                })}
                placeholder="e.g. Mumbai Convention Center"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>
          )}

          {/* Online Link — Online/Hybrid */}
          {(eventType === 'online' || eventType === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Online Link *</label>
              <input
                {...register('online_link', {
                  required: eventType !== 'physical' ? 'Online link required hai' : false
                })}
                placeholder="e.g. https://meet.google.com/xyz"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
              />
              {errors.online_link && <p className="text-red-500 text-xs mt-1">{errors.online_link.message}</p>}
            </div>
          )}
        </div>

        {/* Capacity & Pricing */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-800">Capacity & Pricing</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
            <input
              {...register('max_capacity')}
              type="number"
              placeholder="e.g. 500"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            />
          </div>

          {/* Free Toggle */}
          <div className="flex items-center gap-3">
            <input
              {...register('is_free')}
              type="checkbox"
              id="is_free"
              className="w-4 h-4 accent-[#e94560]"
            />
            <label htmlFor="is_free" className="text-sm font-medium text-gray-700">
              Ye event free hai
            </label>
          </div>

          {/* Price — only if not free */}
          {!isFree && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                {...register('price')}
                type="number"
                step="0.01"
                placeholder="e.g. 999"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link
            href="/events"
            className="flex-1 text-center py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#e94560] text-white py-3 rounded-xl font-semibold hover:bg-[#d63651] transition text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : 'Create Event'}
          </button>
        </div>

      </form>
    </div>
  );
}