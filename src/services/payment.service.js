import api from '@/lib/api';

const PaymentService = {

  // ── Razorpay ───────────────────────────────────────────

  createRazorpayOrder: async (bookingId) => {
    const res = await api.post('/api/payments/razorpay/create-order/', {
      booking_id: bookingId,
    });
    return res.data;
  },

  verifyRazorpayPayment: async (data) => {
    const res = await api.post('/api/payments/razorpay/verify/', data);
    return res.data;
  },

  openRazorpayCheckout: (orderData, userInfo = {}, onSuccess, onError) => {
    const options = {
      key:      orderData.key,
      amount:   orderData.amount,
      currency: orderData.currency,
      order_id: orderData.razorpay_order_id,
      name:     'Plannexa',
      description: 'Event Ticket Payment',
      prefill: {
        name:    userInfo.name    || '',
        email:   userInfo.email   || '',
        contact: userInfo.phone   || '',
      },
      handler: (response) => onSuccess(response),
      modal:   { ondismiss: () => onError('Payment cancelled') },
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

  // Admin — UPI confirm/reject
  confirmUpiPayment: async (paymentRef, action) => {
    const res = await api.post(`/api/payments/upi/confirm/${paymentRef}/`, { action });
    return res.data;
  },

  // ── Refund ────────────────────────────────────────────

  // User — refund request karo
  requestRefund: async (paymentRef, reason = '') => {
    const res = await api.post(`/api/payments/refund/request/${paymentRef}/`, { reason });
    return res.data;
  },

  // Admin — refund approve/reject karo
  processRefund: async (refundRef, action) => {
    const res = await api.post(`/api/payments/refund/process/${refundRef}/`, { action });
    return res.data;
  },

  // ── Admin Payments ────────────────────────────────────

  getAdminPayments: async (params = {}) => {
    const res = await api.get('/api/payments/admin/list/', { params });
    return res.data;
  },

  getAdminStats: async () => {
    const res = await api.get('/api/payments/admin/stats/');
    return res.data;
  },

  // ── Organizer Payments ────────────────────────────────

  getOrganizerPayments: async (params = {}) => {
    const res = await api.get('/api/payments/organizer/list/', { params });
    return res.data;
  },

  getOrganizerStats: async () => {
    const res = await api.get('/api/payments/organizer/stats/');
    return res.data;
  },
};

export default PaymentService;