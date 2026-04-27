import { format } from 'date-fns';

// Date format karo
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'dd MMM yyyy, hh:mm a');
};

// Price format karo
export const formatPrice = (price) => {
  if (!price || price == 0) return 'FREE';
  return `₹${parseFloat(price).toLocaleString('en-IN')}`;
};

// Error message nikalo
export const getErrorMessage = (error) => {
  if (error?.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (data.error) return data.error;
    if (data.message) return data.message;
    // Serializer errors
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const msg = data[firstKey];
      return Array.isArray(msg) ? msg[0] : msg;
    }
  }
  return 'Kuch galat ho gaya. Dobara try karo.';
};

// Status badge color
export const getStatusColor = (status) => {
  const colors = {
    draft:      'bg-gray-100 text-gray-600',
    published:  'bg-green-100 text-green-600',
    cancelled:  'bg-red-100 text-red-600',
    completed:  'bg-blue-100 text-blue-600',
    postponed:  'bg-yellow-100 text-yellow-600',
    active:     'bg-green-100 text-green-600',
    expired:    'bg-red-100 text-red-600',
    sold_out:   'bg-orange-100 text-orange-600',
    pending:    'bg-yellow-100 text-yellow-600',
    confirmed:  'bg-green-100 text-green-600',
    refunded:   'bg-purple-100 text-purple-600',
    success:    'bg-green-100 text-green-600',
    failed:     'bg-red-100 text-red-600',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
};