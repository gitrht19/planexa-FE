'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Calendar, MapPin, Users, MoreVertical, Edit, Trash2, 
  Eye, ToggleLeft, Sparkles, Filter, X, Clock, DollarSign, 
  CheckCircle, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'published': return <CheckCircle size={12} />;
      case 'draft': return <Clock size={12} />;
      case 'cancelled': return <X size={12} />;
      default: return <AlertCircle size={12} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-yellow-400" />
              <span className="text-xs font-medium text-yellow-400/90 uppercase tracking-wider">
                Event Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Events</h1>
            <p className="text-gray-300 text-sm mt-1">
              Manage and organize all your events
            </p>
          </div>
          <Link
            href="/events/create"
            className="flex items-center justify-center gap-2 bg-rose-500 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition shadow-lg shadow-rose-500/25"
          >
            <Plus size={16} />
            Create Event
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events by title or location..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition"
              >
                Search
              </button>
            </form>

            {/* Status Filter */}
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                {statusOptions.map(s => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
              <Sparkles size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500" />
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Calendar size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg">No events found</p>
            <p className="text-gray-400 text-sm mt-1 text-center">
              {search || statusFilter ? 'Try adjusting your filters' : 'Create your first event to get started'}
            </p>
            {!search && !statusFilter && (
              <Link
                href="/events/create"
                className="inline-flex items-center gap-2 mt-4 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-600 transition"
              >
                <Plus size={14} /> Create Event
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {events.map(event => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition">
                            <Calendar size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{event.title}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} /> {event.location || 'Online Event'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-700">{formatDate(event.start_datetime)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">to {formatDate(event.end_datetime)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-600 capitalize font-medium">
                          {event.event_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {event.is_free ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm">
                            <DollarSign size={14} /> FREE
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-gray-700">{formatPrice(event.price)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusColor(event.status)}`}>
                          {getStatusIcon(event.status)}
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === event.id ? null : event.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition group-hover:bg-gray-100"
                          >
                            <MoreVertical size={16} className="text-gray-500" />
                          </button>

                          {activeMenu === event.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveMenu(null)}
                              />
                              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <Link
                                  href={`/events/${event.id}`}
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition group"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <Eye size={14} className="group-hover:scale-110 transition" />
                                  View Details
                                </Link>
                                <Link
                                  href={`/events/${event.id}/edit`}
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition group"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <Edit size={14} className="group-hover:scale-110 transition" />
                                  Edit Event
                                </Link>

                                <div className="border-t border-gray-100 my-1">
                                  <p className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Change Status</p>
                                  {statusOptions
                                    .filter(s => s !== event.status)
                                    .map(s => (
                                      <button
                                        key={s}
                                        onClick={() => handleStatusChange(event.id, s)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-rose-50 capitalize"
                                      >
                                        <ToggleLeft size={14} />
                                        Set as {s}
                                      </button>
                                    ))}
                                </div>

                                <div className="border-t border-gray-100 mt-1 pt-1">
                                  <button
                                    onClick={() => handleDelete(event.id)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition group"
                                  >
                                    <Trash2 size={14} className="group-hover:scale-110 transition" />
                                    Delete Event
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {events.map(event => (
                <div key={event.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <Calendar size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{event.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin size={10} /> {event.location || 'Online'}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                      {event.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} />
                      <span>{formatDate(event.start_datetime)}</span>
                    </div>
                    <div>
                      {event.is_free ? (
                        <span className="text-emerald-600 font-semibold">FREE</span>
                      ) : (
                        <span className="font-semibold">{formatPrice(event.price)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/events/${event.id}`} className="flex-1 text-center py-2 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                      View
                    </Link>
                    <Link href={`/events/${event.id}/edit`} className="flex-1 text-center py-2 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="flex-1 text-center py-2 text-xs font-medium border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-500 order-2 sm:order-1">
                  Showing {events.length} of {pagination.total} events
                </p>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={!pagination.previous}
                    className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                      let pageNum;
                      if (pagination.total_pages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.total_pages - 2) {
                        pageNum = pagination.total_pages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 text-sm rounded-lg transition ${
                            currentPage === pageNum
                              ? 'bg-rose-500 text-white font-semibold'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!pagination.next}
                    className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Next
                    <ChevronRight size={14} />
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