'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Calendar, X, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import PublicService from '@/services/public.service';
import { formatDate, formatPrice, getErrorMessage } from '@/lib/utils';

// ── Event Card ────────────────────────────────────────────
function EventCard({ event }) {
  return (
    <Link href={`/explore/${event.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all">

      {/* Banner */}
      <div className="relative h-44 bg-gradient-to-br from-[#1a1a2e] to-[#e94560] overflow-hidden">
        {event.banner_image ? (
          <img
            src={event.banner_image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar size={40} className="text-white/30" />
          </div>
        )}
        {/* Type Badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-full capitalize text-gray-700">
          {event.event_type}
        </span>
        {/* Free Badge */}
        {event.is_free && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            FREE
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-[#e94560] transition-colors">
          {event.title}
        </h3>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={12} className="text-[#e94560] flex-shrink-0" />
            {formatDate(event.start_datetime)}
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={12} className="text-[#e94560] flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-gray-800 text-sm">
            {event.is_free ? (
              <span className="text-green-600">Free</span>
            ) : formatPrice(event.price)}
          </span>
          <span className="text-xs bg-[#e94560]/10 text-[#e94560] px-3 py-1 rounded-full font-medium">
            Book Now →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Filter Drawer ─────────────────────────────────────────
function FilterDrawer({ filters, setFilters, categories, onClose, onApply }) {
  const [local, setLocal] = useState(filters);

  const handleApply = () => {
    setFilters(local);
    onApply();
    onClose();
  };

  const handleReset = () => {
    const empty = {
      search: '', category: '', event_type: '', location: '',
      date_from: '', date_to: '', min_price: '', max_price: '',
      is_free: '', ordering: '-start_datetime',
    };
    setLocal(empty);
    setFilters(empty);
    onApply();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="w-80 bg-white h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-[#e94560]" />
            Filters
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={local.category}
              onChange={e => setLocal(f => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560] bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['', 'physical', 'online', 'hybrid'].map(type => (
                <button
                  key={type}
                  onClick={() => setLocal(f => ({ ...f, event_type: type }))}
                  className={`py-2 rounded-xl text-xs font-semibold capitalize transition ${
                    local.event_type === type
                      ? 'bg-[#e94560] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Free Only */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_free"
              checked={local.is_free === 'true'}
              onChange={e => setLocal(f => ({ ...f, is_free: e.target.checked ? 'true' : '' }))}
              className="w-4 h-4 accent-[#e94560]"
            />
            <label htmlFor="is_free" className="text-sm font-medium text-gray-700">
              Free events only
            </label>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={local.location}
              onChange={e => setLocal(f => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Mumbai"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
            <div className="space-y-2">
              <input
                type="date"
                value={local.date_from}
                onChange={e => setLocal(f => ({ ...f, date_from: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
              />
              <input
                type="date"
                value={local.date_to}
                onChange={e => setLocal(f => ({ ...f, date_to: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
              />
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={local.min_price}
                onChange={e => setLocal(f => ({ ...f, min_price: e.target.value }))}
                placeholder="Min"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
              />
              <input
                type="number"
                value={local.max_price}
                onChange={e => setLocal(f => ({ ...f, max_price: e.target.value }))}
                placeholder="Max"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
              />
            </div>
          </div>

          {/* Ordering */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={local.ordering}
              onChange={e => setLocal(f => ({ ...f, ordering: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560] bg-white"
            >
              <option value="-start_datetime">Latest First</option>
              <option value="start_datetime">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl bg-[#e94560] text-white font-semibold text-sm hover:bg-[#d63651]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function ExplorePage() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '', category: '', event_type: '', location: '',
    date_from: '', date_to: '', min_price: '', max_price: '',
    is_free: '', ordering: '-start_datetime',
  });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    PublicService.getCategories()
      .then(res => setCategories(res.results || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchEvents(1);
  }, [filters]);

  const fetchEvents = async (page = 1) => {
    setLoading(true);
    setCurrentPage(page);
    try {
      const params = { page, page_size: 12 };
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      const res = await PublicService.getEvents(params);
      setEvents(res.results || []);
      setPagination(res.pagination || null);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(f => ({ ...f, search: searchInput }));
  };

  const activeFilterCount = Object.entries(filters)
    .filter(([k, v]) => v && k !== 'ordering' && k !== 'search')
    .length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top Bar */}
      <div className="bg-[#1a1a2e] py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white text-center mb-2">Explore Events</h1>
          <p className="text-slate-400 text-center text-sm mb-6">
            Apne sheher mein best events dhundo
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Event, location ya category search karo..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#e94560] text-white rounded-2xl font-semibold text-sm hover:bg-[#d63651] transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <p className="text-gray-600 text-sm">
              {pagination ? (
                <span><span className="font-bold text-gray-800">{pagination.total}</span> events mile</span>
              ) : 'Events load ho rahe hain...'}
            </p>

            {/* Active Filter Tags */}
            {filters.search && (
              <span className="flex items-center gap-1 bg-[#e94560]/10 text-[#e94560] text-xs px-3 py-1 rounded-full font-medium">
                "{filters.search}"
                <button onClick={() => { setFilters(f => ({ ...f, search: '' })); setSearchInput(''); }}>
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.event_type && (
              <span className="flex items-center gap-1 bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full font-medium capitalize">
                {filters.event_type}
                <button onClick={() => setFilters(f => ({ ...f, event_type: '' }))}>
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.is_free && (
              <span className="flex items-center gap-1 bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full font-medium">
                Free
                <button onClick={() => setFilters(f => ({ ...f, is_free: '' }))}>
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-[#e94560] hover:text-[#e94560] transition"
          >
            <Filter size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#e94560] text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            <button
              onClick={() => setFilters(f => ({ ...f, category: '' }))}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                !filters.category
                  ? 'bg-[#e94560] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#e94560]'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilters(f => ({ ...f, category: cat.id.toString() }))}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                  filters.category === cat.id.toString()
                    ? 'bg-[#e94560] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#e94560]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Koi event nahi mila</p>
            <p className="text-gray-400 text-sm mt-1">Filters change karo ya baad mein try karo</p>
            <button
              onClick={() => setFilters({
                search: '', category: '', event_type: '', location: '',
                date_from: '', date_to: '', min_price: '', max_price: '',
                is_free: '', ordering: '-start_datetime',
              })}
              className="mt-4 text-[#e94560] text-sm font-semibold hover:underline"
            >
              Sab filters clear karo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => fetchEvents(currentPage - 1)}
              disabled={!pagination.previous}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-white transition"
            >
              ← Prev
            </button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.total_pages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === pagination.total_pages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => fetchEvents(page)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                        page === currentPage
                          ? 'bg-[#e94560] text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-white'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-gray-400 text-sm">...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => fetchEvents(currentPage + 1)}
              disabled={!pagination.next}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-white transition"
            >
              Next →
            </button>
          </div>
        )}

      </div>

      {/* Filter Drawer */}
      {filterOpen && (
        <FilterDrawer
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          onClose={() => setFilterOpen(false)}
          onApply={() => fetchEvents(1)}
        />
      )}

    </div>
  );
}