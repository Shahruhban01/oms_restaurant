export const formatCurrency = (amount, currency = '₹') =>
  `${currency}${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const formatTime = (date) =>
  date ? new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

export const statusColor = (status) => {
  const map = {
    pending:   'warning',
    preparing: 'info',
    ready:     'success',
    served:    'success',
    cancelled: 'danger',
    paid:      'success',
    unpaid:    'warning',
    available: 'success',
    occupied:  'danger',
    reserved:  'warning',
  };
  return map[status] || 'default';
};

export const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
