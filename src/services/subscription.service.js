import api from '@/lib/api';

const SubscriptionService = {

  // All plans
  getPlans: async () => {
    const res = await api.get('/api/subscriptions/plans/');
    return res.data;
  },

  // My subscription
  getMySubscription: async () => {
    const res = await api.get('/api/subscriptions/subscriptions/my-subscription/');
    return res.data;
  },

  // Usage
  getUsage: async () => {
    const res = await api.get('/api/subscriptions/subscriptions/usage/');
    return res.data;
  },

  // Create payment
  createPayment: async (planId, billingCycle) => {
    const res = await api.post('/api/subscriptions/subscriptions/create-payment/', {
      plan_id: planId,
      billing_cycle: billingCycle
    });
    return res.data;
  },

  // Verify payment
  verifyPayment: async (data) => {
    const res = await api.post('/api/subscriptions/subscriptions/verify-payment/', data);
    return res.data;
  },

  // Cancel
  cancelSubscription: async () => {
    const res = await api.post('/api/subscriptions/subscriptions/cancel/');
    return res.data;
  },
};

export default SubscriptionService;
