'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar, MapPin, Globe, Users, ArrowLeft,
  Ticket, CreditCard, X, Check, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import PublicService from '@/services/public.service';
import BookingService from '@/services/booking.service';
import PaymentService from '@/services/payment.service';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatPrice, getErrorMessage } from '@/lib/utils';

// ── Booking Modal ─────────────────────────────────────────
function BookingModal({ event, ticket, onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1=details, 2=payment, 3=success
  const [quantity, setQuantity] = useState(1);
  const [guestForm, setGuestForm] = useState({ guest_name: '', guest_email: '', guest_phone: '' });
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const totalPrice = ticket.is_free ? 0 : parseFloat(ticket.price) * quantity;

  const handleBooking = async () => {
    setLoading(true);
    try {
      const payload = {
        event: event.id,
        ticket_type: ticket.id,
        quantity,
        ...(!user ? guestForm : {}),
      };
      const res = await BookingService.createBooking(payload);
      setBooking(res);

      if (ticket.is_free) {
        setStep(3);
      } else {
        setStep(2);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpay = async () => {
    setLoading(true);
    try {
      const orderData = await PaymentService.createRazorpayOrder(booking.id);
      PaymentService.openRazorpayCheckout(
        orderData,
        async (paymentResponse) => {
          try {
            await PaymentService.verifyRazorpayPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });
            setStep(3);
            toast.success('Payment successful!');
          } catch (err) {
            toast.error(getErrorMessage(err));
          }
        },
        (err) => toast.error(err || 'Payment cancelled')
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">
            {step === 1 ? 'Book Ticket' : step === 2 ? 'Payment' : 'Booking Confirmed!'}
          </h3>
          {step !== 3 && (
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100">
              <X size={18} className="text-gray-500" />
            </button>
          )}
        </div>

        <div className="p-5">

          {/* Step 1 — Details */}
          {step === 1 && (
            <div className="space-y-4">

              {/* Ticket Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Selected Ticket</p>
                <p className="font-bold text-gray-800 capitalize">{ticket.name}</p>
                <p className="text-sm text-[#e94560] font-semibold mt-1">
                  {ticket.is_free ? 'FREE' : formatPrice(ticket.price)} per ticket
                </p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold"
                  >
                    −
                  </button>
                  <span className="text-lg font-bold text-gray-800 w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(ticket.per_user_limit, q + 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold"
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-400">Max {ticket.per_user_limit} per user</span>
                </div>
              </div>

              {/* Guest Form — only if not logged in */}
              {!user && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Your Details</p>
                  {[
                    { key: 'guest_name', label: 'Full Name', placeholder: 'Enter your name', required: true },
                    { key: 'guest_email', label: 'Email', placeholder: 'Enter your email', required: true },
                    { key: 'guest_phone', label: 'Phone (optional)', placeholder: 'Enter phone number' },
                  ].map(field => (
                    <input
                      key={field.key}
                      type={field.key === 'guest_email' ? 'email' : 'text'}
                      placeholder={field.placeholder}
                      value={guestForm[field.key]}
                      onChange={e => setGuestForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
                    />
                  ))}
                </div>
              )}

              {/* Total */}
              {!ticket.is_free && (
                <div className="flex items-center justify-between bg-[#1a1a2e] rounded-xl p-4">
                  <span className="text-white/70 text-sm">Total Amount</span>
                  <span className="text-white font-bold text-lg">{formatPrice(totalPrice)}</span>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={loading || (!user && (!guestForm.guest_name || !guestForm.guest_email))}
                className="w-full bg-[#e94560] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#d63651] transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : ticket.is_free ? 'Book Free Ticket' : 'Proceed to Payment'
                }
              </button>

              {!user && (
                <p className="text-center text-xs text-gray-400">
                  Already account hai?{' '}
                  <Link href="/login" className="text-[#e94560] font-semibold hover:underline">Login karo</Link>
                </p>
              )}

            </div>
          )}

          {/* Step 2 — Payment */}
          {step === 2 && booking && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Booking Ref</span>
                  <span className="font-mono font-semibold text-gray-700">{booking.booking_ref}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tickets</span>
                  <span className="font-semibold text-gray-700">{quantity}x {ticket.name}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="font-bold text-gray-800">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={handleRazorpay}
                disabled={loading}
                className="w-full bg-[#e94560] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#d63651] transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><CreditCard size={16} /> Pay ₹{totalPrice}</>
                }
              </button>
            </div>
          )}

          {/* Step 3 — Success */}
          {step === 3 && booking && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check size={32} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">Booking Confirmed!</h4>
                <p className="text-gray-500 text-sm mt-1">
                  Confirmation email bhej diya gaya hai
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Booking Reference</p>
                <p className="font-mono font-bold text-gray-800 text-lg">{booking.booking_ref}</p>
              </div>
              <button
                onClick={() => { onSuccess(); onClose(); }}
                className="w-full bg-[#e94560] text-white py-3 rounded-xl font-bold text-sm"
              >
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [bookingModal, setBookingModal] = useState(false);

  useEffect(() => {
    // Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    PublicService.getEvent(id)
      .then(setEvent)
      .catch(() => router.push('/explore'))
      .finally(() => setLoading(false));

    return () => document.body.removeChild(script);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  const tickets = event.ticket_types || [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Back Nav */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/explore" className="p-2 rounded-xl hover:bg-gray-100 transition">
            <ArrowLeft size={18} className="text-gray-600" />
          </Link>
          <p className="font-semibold text-gray-800 text-sm truncate">{event.title}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Event Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Banner */}
            <div className="w-full h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#e94560]">
              {event.banner_image ? (
                <img src={event.banner_image} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar size={48} className="text-white/30" />
                </div>
              )}
            </div>

            {/* Title + Badges */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium capitalize">
                  {event.event_type}
                </span>
                {event.is_free && (
                  <span className="text-xs bg-green-100 text-green-600 px-2.5 py-1 rounded-full font-medium">
                    Free Event
                  </span>
                )}
                {event.category_name && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    {event.category_name}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
              {[
                { icon: Calendar, label: 'Start', value: formatDate(event.start_datetime) },
                { icon: Clock, label: 'End', value: formatDate(event.end_datetime) },
                ...(event.location ? [{ icon: MapPin, label: 'Location', value: event.location }] : []),
                ...(event.online_link ? [{ icon: Globe, label: 'Online Link', value: event.online_link, isLink: true }] : []),
                ...(event.max_capacity ? [{ icon: Users, label: 'Capacity', value: `${event.max_capacity} seats` }] : []),
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#e94560]/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-[#e94560]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      {item.isLink ? (
                        <a href={item.value} target="_blank" className="text-sm font-medium text-blue-600 hover:underline">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-gray-700">{item.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            {event.description && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">About Event</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
              </div>
            )}

          </div>

          {/* Right — Tickets */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800">Tickets</h3>

            {tickets.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <Ticket size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Koi ticket available nahi</p>
              </div>
            ) : (
              tickets.map(ticket => {
                const isSoldOut = ticket.ticket_status === 'sold_out' || ticket.available_quantity === 0;
                const isSelected = selectedTicket?.id === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    onClick={() => !isSoldOut && setSelectedTicket(isSelected ? null : ticket)}
                    className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all cursor-pointer ${
                      isSoldOut ? 'opacity-50 cursor-not-allowed border-gray-100' :
                      isSelected ? 'border-[#e94560]' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-800 capitalize">{ticket.name}</p>
                          {isSoldOut && (
                            <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">Sold Out</span>
                          )}
                        </div>
                        {ticket.description && (
                          <p className="text-xs text-gray-400 mt-1">{ticket.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {ticket.available_quantity} seats remaining
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-800">
                          {ticket.is_free ? (
                            <span className="text-green-600">FREE</span>
                          ) : formatPrice(ticket.price)}
                        </p>
                        {isSelected && (
                          <div className="w-5 h-5 bg-[#e94560] rounded-full flex items-center justify-center mt-1 ml-auto">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Book Button */}
            <button
              onClick={() => selectedTicket && setBookingModal(true)}
              disabled={!selectedTicket}
              className="w-full bg-[#e94560] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#d63651] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedTicket ? `Book — ${selectedTicket.name}` : 'Ticket Select Karo'}
            </button>

          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal && selectedTicket && (
        <BookingModal
          event={event}
          ticket={selectedTicket}
          onClose={() => setBookingModal(false)}
          onSuccess={() => setSelectedTicket(null)}
        />
      )}

    </div>
  );
}