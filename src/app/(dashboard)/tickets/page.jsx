'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Ticket, Edit, Trash2, ToggleLeft, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import TicketService from '@/services/ticket.service';
import EventService from '@/services/event.service';
import { formatDate, formatPrice, getStatusColor, getErrorMessage } from '@/lib/utils';

// ── Create/Edit Modal ─────────────────────────────────────
function TicketModal({ isOpen, onClose, onSuccess, eventId, ticket }) {
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg">
            {ticket ? 'Edit Ticket' : 'New Ticket Type'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Ticket Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Type *</label>
            <select
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm bg-white"
              required
            >
              <option value="general">General</option>
              <option value="vip">VIP</option>
              <option value="student">Student</option>
              <option value="early_bird">Early Bird</option>
              <option value="group">Group</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Ticket ke baare mein..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm resize-none"
            />
          </div>

          {/* Quantity + Per User Limit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity *</label>
              <input
                type="number"
                value={form.total_quantity}
                onChange={e => setForm(f => ({ ...f, total_quantity: e.target.value }))}
                placeholder="e.g. 100"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label>
              <input
                type="number"
                value={form.per_user_limit}
                onChange={e => setForm(f => ({ ...f, per_user_limit: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
              />
            </div>
          </div>

          {/* Free Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_free_ticket"
              checked={form.is_free}
              onChange={e => setForm(f => ({ ...f, is_free: e.target.checked, price: '' }))}
              className="w-4 h-4 accent-[#e94560]"
            />
            <label htmlFor="is_free_ticket" className="text-sm font-medium text-gray-700">
              Free ticket hai
            </label>
          </div>

          {/* Price */}
          {!form.is_free && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="e.g. 999"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
                required
              />
            </div>
          )}

          {/* Valid From / To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
              <input
                type="datetime-local"
                value={form.valid_from}
                onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
              <input
                type="datetime-local"
                value={form.valid_to}
                onChange={e => setForm(f => ({ ...f, valid_to: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#e94560] text-white py-3 rounded-xl font-semibold hover:bg-[#d63651] transition text-sm disabled:opacity-60 flex items-center justify-center"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : ticket ? 'Update' : 'Create'
              }
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
  const [expandedTicket, setExpandedTicket] = useState(null);

  // Load events list
  useEffect(() => {
    EventService.getEvents({ page_size: 100 })
      .then(res => setEvents(res.results || []))
      .catch(() => {});
  }, []);

  // Load tickets when event selected
  useEffect(() => {
    if (!selectedEventId) { setTickets([]); return; }
    fetchTickets();
  }, [selectedEventId]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await TicketService.getTicketsByEvent(selectedEventId);
      setTickets(res.results || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Ticket delete karna chahte ho?')) return;
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
      toast.success(`Status updated!`);
      fetchTickets();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openCreate = () => { setEditingTicket(null); setModalOpen(true); };
  const openEdit = (ticket) => { setEditingTicket(ticket); setModalOpen(true); };

  const ticketStatusOptions = ['active', 'sold_out', 'cancelled', 'expired'];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">Event ke ticket types manage karo</p>
        </div>
        <button
          onClick={openCreate}
          disabled={!selectedEventId}
          className="flex items-center gap-2 bg-[#e94560] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d63651] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {/* Event Selector */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Event Select Karo
        </label>
        <select
          value={selectedEventId}
          onChange={e => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm bg-white"
        >
          <option value="">-- Event choose karo --</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>{event.title}</option>
          ))}
        </select>
      </div>

      {/* Tickets List */}
      {!selectedEventId ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Ticket size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Pehle ek event select karo</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Ticket size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-4">Is event mein koi ticket nahi hai</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-[#e94560] text-white px-4 py-2 rounded-xl text-sm font-semibold"
          >
            <Plus size={14} /> Pehla Ticket Banao
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Ticket Header */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  {/* Ticket Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e94560] to-[#1a1a2e] flex items-center justify-center flex-shrink-0">
                    <Ticket size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800 capitalize">{ticket.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(ticket.ticket_status)}`}>
                        {ticket.ticket_status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {ticket.is_free ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        <span className="font-semibold text-gray-700">{formatPrice(ticket.price)}</span>
                      )}
                      <span className="mx-2">·</span>
                      <span>{ticket.sold_quantity}/{ticket.total_quantity} sold</span>
                    </p>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(ticket)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    className="p-2 rounded-xl hover:bg-red-50 transition text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400"
                  >
                    {expandedTicket === ticket.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-5 pb-4">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>{ticket.sold_quantity} sold</span>
                  <span>{ticket.available_quantity} remaining</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#e94560] to-[#c23152] rounded-full transition-all"
                    style={{ width: `${Math.min((ticket.sold_quantity / ticket.total_quantity) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              {expandedTicket === ticket.id && (
                <div className="border-t border-gray-100 p-5 space-y-4">

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Per User Limit', value: ticket.per_user_limit },
                      { label: 'Valid From', value: ticket.valid_from ? formatDate(ticket.valid_from) : 'N/A' },
                      { label: 'Valid To', value: ticket.valid_to ? formatDate(ticket.valid_to) : 'N/A' },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-700">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {ticket.description && (
                    <p className="text-sm text-gray-500">{ticket.description}</p>
                  )}

                  {/* Change Status */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                      <ToggleLeft size={12} /> Change Status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ticketStatusOptions.map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(ticket.id, s)}
                          disabled={s === ticket.ticket_status}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                            s === ticket.ticket_status
                              ? 'bg-[#e94560] text-white cursor-default'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <TicketModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTicket(null); }}
        onSuccess={fetchTickets}
        eventId={selectedEventId}
        ticket={editingTicket}
      />

    </div>
  );
}