export const getToken  = ()        => localStorage.getItem('token');
export const getUser   = ()        => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } };
export const setAuth   = (token, user) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); };
export const clearAuth = ()        => { localStorage.removeItem('token'); localStorage.removeItem('user'); };
export const isLoggedIn= ()        => !!getToken();

export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN:      'admin',
  WAITER:     'waiter',
  KITCHEN:    'kitchen',
  CASHIER:    'cashier',
};

export const getDashboardRoute = (role) => {
  const map = {
    superadmin: '/superadmin/dashboard',
    admin:      '/admin/dashboard',
    waiter:     '/waiter/dashboard',
    kitchen:    '/kitchen/board',
    cashier:    '/cashier/billing',
  };
  return map[role] || '/login';
};


