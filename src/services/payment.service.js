import api from '@/lib/api';

const PaymentService = {

  // ── Razorpay ───────────────────────────────────────────

  // Create order
  createRazorpayOrder: async (bookingId) => {
    const res = await api.post('/api/payments/razorpay/create-order/', {
      booking_id: bookingId,
    });
    return res.data;
  },

  // Verify payment
  verifyRazorpayPayment: async (data) => {
    const res = await api.post('/api/payments/razorpay/verify/', data);
    return res.data;
  },

  // Open Razorpay checkout popup
  openRazorpayCheckout: (orderData, onSuccess, onError) => {
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.razorpay_order_id,
      name: 'Plannexa',
      description: 'Event Ticket Payment',
      handler: (response) => onSuccess(response),
      modal: { ondismiss: () => onError('Payment cancelled') },
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (e) => onError(e.error?.description || 'Payment failed'));
    rzp.open();
  },

  // ── UPI ───────────────────────────────────────────────

  submitUpiPayment: async (data) => {
    const res = await api.post('/api/payments/upi/pay/', data);
    return res.data;
  },

  // ── Refund ────────────────────────────────────────────

  // User-side refund request (booking ref se)
  requestRefund: async (paymentRef, reason = '') => {
    const res = await api.post(`/api/payments/refund/request/${paymentRef}/`, { reason });
    return res.data;
  },

  // Admin/organizer refund initiate (payment ID se) — payments page ke liye
  initiateRefund: async (paymentId) => {
    const res = await api.post(`/api/payments/${paymentId}/refund/`);
    return res.data;
  },

  // ── Payments List (Dashboard) ─────────────────────────

  getAllPayments: async (params = {}) => {
    const res = await api.get('/api/payments/', { params });
    return res.data;
  },

  getPaymentStats: async () => {
    const res = await api.get('/api/payments/stats/');
    return res.data;
  },
};

export default PaymentService;