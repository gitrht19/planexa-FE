'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, Ticket, Edit, Trash2, ToggleLeft, Sparkles, Filter, 
  Calendar, DollarSign, Clock, CheckCircle, XCircle, 
  TrendingUp, Users, BadgeCheck, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import TicketService from '@/services/ticket.service';
import EventService from '@/services/event.service';
import { formatDate, formatPrice, getStatusColor, getErrorMessage } from '@/lib/utils';

// ── Create/Edit Modal ─────────────────────────────────────
function TicketModal({ isOpen, onClose, onSuccess, eventId, ticket, events }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    event: eventId || '',
    name: 'general',
    description: '',
    is_free: false,
    price: '',
    total_quantity: '',
    per_user_limit: 1,
    valid_from: '',
    valid_to: '',
  });

  useEffect(() => {
    if (ticket) {
      setForm({
        event: ticket.event,
        name: ticket.name,
        description: ticket.description || '',
        is_free: ticket.is_free,
        price: ticket.price || '',
        total_quantity: ticket.total_quantity,
        per_user_limit: ticket.per_user_limit,
        valid_from: ticket.valid_from?.slice(0, 16) || '',
        valid_to: ticket.valid_to?.slice(0, 16) || '',
      });
    } else {
      setForm(f => ({ ...f, event: eventId || '' }));
    }
  }, [ticket, eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: form.is_free ? '0.00' : form.price,
        valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
        valid_to: form.valid_to ? new Date(form.valid_to).toISOString() : null,
      };
      if (ticket) {
        await TicketService.updateTicket(ticket.id, payload);
        toast.success('Ticket updated!');
      } else {
        await TicketService.createTicket(payload);
        toast.success('Ticket created!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                <Ticket size={14} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-800">
                {ticket ? 'Edit Ticket' : 'New Ticket'}
              </h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!ticket && events && events.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">EVENT *</label>
              <select
                value={form.event}
                onChange={e => setForm(f => ({ ...f, event: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm bg-white"
                required
              >
                <option value="">Select event</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">TYPE *</label>
              <select
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm bg-white"
                required
              >
                <option value="general">🎟️ General</option>
                <option value="vip">👑 VIP</option>
                <option value="student">🎓 Student</option>
                <option value="early_bird">🐦 Early Bird</option>
                <option value="group">👥 Group</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">QUANTITY *</label>
              <input
                type="number"
                value={form.total_quantity}
                onChange={e => setForm(f => ({ ...f, total_quantity: e.target.value }))}
                placeholder="Total"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">DESCRIPTION</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Ticket description..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm resize-none"
            />
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-rose-50 rounded-xl">
            <input
              type="checkbox"
              id="is_free_ticket"
              checked={form.is_free}
              onChange={e => setForm(f => ({ ...f, is_free: e.target.checked, price: '' }))}
              className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
            />
            <label htmlFor="is_free_ticket" className="text-xs font-medium text-gray-700">Free ticket</label>
          </div>

          {!form.is_free && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">PRICE (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">VALID FROM</label>
              <input
                type="datetime-local"
                value={form.valid_from}
                onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">VALID TO</label>
              <input
                type="datetime-local"
                value={form.valid_to}
                onChange={e => setForm(f => ({ ...f, valid_to: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition disabled:opacity-60 flex items-center justify-center">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (ticket ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function TicketsPage() {
  const searchParams = useSearchParams();
  const preselectedEventId = searchParams.get('event_id');

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(preselectedEventId || '');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  const eventMap = events.reduce((map, event) => {
    map[event.id] = event;
    return map;
  }, {});

  useEffect(() => {
    EventService.getEvents({ page_size: 100 })
      .then(res => setEvents(res.results || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [selectedEventId]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = selectedEventId
        ? await TicketService.getTicketsByEvent(selectedEventId)
        : await TicketService.getTickets();
      setTickets(res.results || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this ticket?')) return;
    try {
      await TicketService.deleteTicket(id);
      toast.success('Ticket deleted!');
      fetchTickets();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleStatusChange = async (id, ticket_status) => {
    try {
      await TicketService.changeStatus(id, ticket_status);
      toast.success('Status updated!');
      fetchTickets();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openCreate = () => { setEditingTicket(null); setModalOpen(true); };
  const openEdit = (ticket) => { setEditingTicket(ticket); setModalOpen(true); };

  const ticketStatusOptions = ['active', 'sold_out', 'cancelled', 'expired'];

  const getTicketIcon = (type) => {
    switch(type) {
      case 'vip': return '👑';
      case 'student': return '🎓';
      case 'early_bird': return '🐦';
      case 'group': return '👥';
      default: return '🎟️';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-5 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-yellow-400" />
              <span className="text-[10px] font-medium text-yellow-400/90 uppercase tracking-wider">Ticket Management</span>
            </div>
            <h1 className="text-xl font-bold">Tickets</h1>
            <p className="text-gray-300 text-xs mt-0.5">{tickets.length} tickets total</p>
          </div>
          <button
            onClick={openCreate}
            disabled={!selectedEventId}
            className="flex items-center gap-1.5 bg-rose-500 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-rose-600 transition shadow-lg shadow-rose-500/25 disabled:opacity-50"
          >
            <Plus size={14} /> New Ticket
          </button>
        </div>
      </div>

      {/* Event Filter - Compact */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-rose-500" />
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm bg-white"
          >
            <option value="">All Events ({tickets.length})</option>
            {events.map(event => {
              const count = tickets.filter(t => t.event === event.id).length;
              return <option key={event.id} value={event.id}>{event.title} ({count})</option>;
            })}
          </select>
        </div>
      </div>

      {/* Tickets Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="relative">
            <div className="w-10 h-10 border-3 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
            <Sparkles size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500" />
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Ticket size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No tickets found</p>
          <p className="text-gray-400 text-xs mt-1">
            {selectedEventId ? 'Create your first ticket' : 'Select an event to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map(ticket => {
            const event = eventMap[ticket.event];
            const soldPercent = Math.round((ticket.sold_quantity / ticket.total_quantity) * 100);
            
            return (
              <div key={ticket.id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                {/* Ticket Header */}
                <div className="relative p-4 pb-3 border-b border-gray-100">
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${getStatusColor(ticket.ticket_status)}`}>
                      {ticket.ticket_status === 'active' && <CheckCircle size={10} />}
                      {ticket.ticket_status === 'expired' && <Clock size={10} />}
                      {ticket.ticket_status === 'cancelled' && <XCircle size={10} />}
                      {ticket.ticket_status}
                    </span>
                  </div>
                  
                  {/* Ticket Type & Event */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                      <span className="text-lg">{getTicketIcon(ticket.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-base capitalize">{ticket.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Calendar size={10} className="text-rose-400" />
                        <p className="text-[11px] font-medium text-gray-600 truncate">{event?.title || 'Unknown Event'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket Stats */}
                <div className="p-4 space-y-3">
                  {/* Price & Sales */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign size={12} className="text-gray-400" />
                      {ticket.is_free ? (
                        <span className="text-emerald-600 font-bold text-sm">FREE</span>
                      ) : (
                        <span className="font-bold text-gray-800 text-sm">{formatPrice(ticket.price)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-600">
                        <span className="font-semibold">{ticket.sold_quantity}</span>/{ticket.total_quantity}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                      <span>Sold {soldPercent}%</span>
                      <span className="text-emerald-600 font-medium">{ticket.available_quantity} left</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-600 rounded-full transition-all duration-500"
                        style={{ width: `${soldPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Limit Info */}
                  <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <BadgeCheck size={10} /> Limit: {ticket.per_user_limit}/user
                    </span>
                    {ticket.valid_from && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> Valid until: {formatDate(ticket.valid_from).slice(0, 10)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-50 mt-1">
                    <button
                      onClick={() => openEdit(ticket)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      <Edit size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                    <button
                      onClick={() => {
                        const newStatus = ticket.ticket_status === 'active' ? 'cancelled' : 'active';
                        handleStatusChange(ticket.id, newStatus);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition"
                    >
                      <ToggleLeft size={12} /> {ticket.ticket_status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <TicketModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTicket(null); }}
        onSuccess={fetchTickets}
        eventId={selectedEventId}
        ticket={editingTicket}
        events={events}
      />
    </div>
  );
}