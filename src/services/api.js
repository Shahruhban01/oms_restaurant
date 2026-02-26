import axios from 'axios';

// const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// const api = axios.create({
//   baseURL: BASE_URL,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/backend/public';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// export default api;


// ── Request interceptor — attach JWT token to every request ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // ← must match what login saves
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 globally ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (data)      => api.post('/auth/login', data),
  register:       (data)      => api.post('/auth/register', data),
  me:             ()          => api.get('/auth/me'),
  setupSuperAdmin:(data)      => api.post('/auth/superadmin/setup', data),
};

// ── SuperAdmin ────────────────────────────────────────────────────────────────
export const superAdminApi = {
  dashboard:          ()          => api.get('/superadmin/dashboard'),
  listRestaurants:    ()          => api.get('/superadmin/restaurants'),
  getRestaurant:      (id)        => api.get(`/superadmin/restaurants/${id}`),
  createRestaurant:   (data)      => api.post('/superadmin/restaurants', data),
  toggleRestaurant:   (id)        => api.put(`/superadmin/restaurants/${id}/toggle`),
  updatePlan:         (id, data)  => api.put(`/superadmin/restaurants/${id}/plan`, data),
  resetAdminPassword: (id, data)  => api.post(`/superadmin/restaurants/${id}/reset-password`, data),
  activityLogs:       ()          => api.get('/superadmin/activity-logs'),
  listUsers:          ()          => api.get('/superadmin/users'),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  dashboard:    ()      => api.get('/admin/dashboard'),
  activityLogs: ()      => api.get('/admin/activity-logs'),
  planUsage:    ()      => api.get('/admin/plan-usage'),
};

// ── Staff ─────────────────────────────────────────────────────────────────────
export const staffApi = {
  list:          ()          => api.get('/admin/staff'),
  create:        (data)      => api.post('/admin/staff', data),
  update:        (id, data)  => api.put(`/admin/staff/${id}`, data),
  toggle:        (id)        => api.put(`/admin/staff/${id}/toggle`),
  resetPassword: (id, data)  => api.post(`/admin/staff/${id}/reset-password`, data),
  delete:        (id)        => api.delete(`/admin/staff/${id}`),
};

// ── Tables ────────────────────────────────────────────────────────────────────
export const tableApi = {
  list:   ()          => api.get('/tables'),
  create: (data)      => api.post('/tables', data),
  update: (id, data)  => api.put(`/tables/${id}`, data),
  delete: (id)        => api.delete(`/tables/${id}`),
};

// ── Menu ──────────────────────────────────────────────────────────────────────
export const menuApi = {
  categories:     ()          => api.get('/menu/categories'),
  createCategory: (data)      => api.post('/menu/categories', data),
  updateCategory: (id, data)  => api.put(`/menu/categories/${id}`, data),
  deleteCategory: (id)        => api.delete(`/menu/categories/${id}`),
  items:          (catId)     => api.get(`/menu/items?category_id=${catId}`),
  createItem:     (data)      => api.post('/menu/items', data),
  updateItem:     (id, data)  => api.put(`/menu/items/${id}`, data),
  toggleItem:     (id)        => api.put(`/menu/items/${id}/toggle`),
  deleteItem:     (id)        => api.delete(`/menu/items/${id}`),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderApi = {
  list:         (params)    => api.get('/orders', { params }),
  active:       ()          => api.get('/orders/active'),
  poll:         (since)     => api.get(`/orders/poll?since=${since}`),
  myOrders:     ()          => api.get('/orders/my'),
  get:          (id)        => api.get(`/orders/${id}`),
  create:       (data)      => api.post('/orders', data),
  updateItems:  (id, data)  => api.put(`/orders/${id}/items`, data),
  updateStatus: (id, data)  => api.put(`/orders/${id}/status`, data),
};

// ── Kitchen ───────────────────────────────────────────────────────────────────
export const kitchenApi = {
  board:             ()         => api.get('/kitchen/board'),
  poll:              (since)    => api.get(`/kitchen/poll?since=${since}`),
  updateOrderStatus: (id, data) => api.put(`/kitchen/orders/${id}/status`, data),
  updateItemStatus:  (id, data) => api.put(`/kitchen/items/${id}/status`, data),
};

// ── Billing ───────────────────────────────────────────────────────────────────
export const billingApi = {
  preview:      (orderId)       => api.get(`/billing/${orderId}/preview`),
  pay:          (orderId, data) => api.post(`/billing/${orderId}/pay`, data),
  dailySummary: ()              => api.get('/billing/daily-summary'),
};

// ── Inventory ─────────────────────────────────────────────────────────────────
export const inventoryApi = {
  list:   ()          => api.get('/inventory'),
  low:    ()          => api.get('/inventory/low-stock'),
  create: (data)      => api.post('/inventory', data),
  update: (id, data)  => api.put(`/inventory/${id}`, data),
  adjust: (id, data)  => api.put(`/inventory/${id}/adjust`, data),
  logs:   (id)        => api.get(`/inventory/${id}/logs`),
  delete: (id)        => api.delete(`/inventory/${id}`),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportApi = {
  daily:            (date)        => api.get(`/reports/daily?date=${date}`),
  weekly:           ()            => api.get('/reports/weekly'),
  monthly:          (year, month) => api.get(`/reports/monthly?year=${year}&month=${month}`),
  bestSelling:      (limit = 10)  => api.get(`/reports/best-selling?limit=${limit}`),
  staffPerformance: ()            => api.get('/reports/staff-performance'),
};

export default api;
