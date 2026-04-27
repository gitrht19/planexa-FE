'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Calendar, MapPin, Users, MoreVertical, Edit, Trash2, Eye, ToggleLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import EventService from '@/services/event.service';
import { formatDate, formatPrice, getStatusColor, getErrorMessage } from '@/lib/utils';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState(null);

  const fetchEvents = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await EventService.getEvents(params);
      setEvents(res.results || []);
      setPagination(res.pagination || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(currentPage); }, [currentPage, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents(1);
  };

  const handleDelete = async (id) => {
    if (!confirm('Event delete karna chahte ho?')) return;
    try {
      await EventService.deleteEvent(id);
      toast.success('Event deleted!');
      fetchEvents(currentPage);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setActiveMenu(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await EventService.changeStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchEvents(currentPage);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setActiveMenu(null);
  };

  const statusOptions = ['draft', 'published', 'cancelled', 'postponed'];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Events</h1>
          <p className="text-gray-500 text-sm mt-1">Apne events manage karo</p>
        </div>
        <Link
          href="/events/create"
          className="flex items-center gap-2 bg-[#e94560] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d63651] transition"
        >
          <Plus size={16} /> New Event
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#1a1a2e] text-white rounded-xl text-sm font-medium hover:bg-[#2a2a4e] transition"
            >
              Search
            </button>
          </form>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560] bg-white"
          >
            <option value="">All Status</option>
            {statusOptions.map(s => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Calendar size={40} className="text-gray-300" />
            <p className="text-gray-500 text-sm">Koi event nahi mila</p>
            <Link
              href="/events/create"
              className="flex items-center gap-2 bg-[#e94560] text-white px-4 py-2 rounded-xl text-sm font-semibold"
            >
              <Plus size={14} /> Event Banao
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Event</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {events.map(event => (
                    <tr key={event.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e94560] to-[#1a1a2e] flex items-center justify-center flex-shrink-0">
                            <Calendar size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{event.title}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} /> {event.location || 'Online'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(event.start_datetime)}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 capitalize font-medium">
                          {event.event_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {event.is_free ? (
                          <span className="text-green-600 font-medium">FREE</span>
                        ) : formatPrice(event.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === event.id ? null : event.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          >
                            <MoreVertical size={16} className="text-gray-500" />
                          </button>

                          {activeMenu === event.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                              <Link
                                href={`/events/${event.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                onClick={() => setActiveMenu(null)}
                              >
                                <Eye size={14} /> View Detail
                              </Link>
                              <Link
                                href={`/events/${event.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                onClick={() => setActiveMenu(null)}
                              >
                                <Edit size={14} /> Edit
                              </Link>

                              {/* Status Change */}
                              <div className="border-t border-gray-100 mt-1 pt-1">
                                <p className="px-4 py-1 text-xs text-gray-400 font-medium">Change Status</p>
                                {statusOptions
                                  .filter(s => s !== event.status)
                                  .map(s => (
                                    <button
                                      key={s}
                                      onClick={() => handleStatusChange(event.id, s)}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 capitalize"
                                    >
                                      <ToggleLeft size={14} /> → {s}
                                    </button>
                                  ))}
                              </div>

                              <div className="border-t border-gray-100 mt-1 pt-1">
                                <button
                                  onClick={() => handleDelete(event.id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {events.map(event => (
                <div key={event.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e94560] to-[#1a1a2e] flex items-center justify-center flex-shrink-0">
                        <Calendar size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{event.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(event.start_datetime)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize flex-shrink-0 ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Link href={`/events/${event.id}`} className="flex-1 text-center py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                      View
                    </Link>
                    <Link href={`/events/${event.id}/edit`} className="flex-1 text-center py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="flex-1 text-center py-1.5 text-xs font-medium border border-red-200 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Total {pagination.total} events
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={!pagination.previous}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">
                    {pagination.current_page} / {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!pagination.next}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}