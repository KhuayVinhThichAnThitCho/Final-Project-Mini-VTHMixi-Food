import api from './api';

export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // A-01 Users
  getUsers: (params?: { role?: string; search?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/admin/users', { params }),
  getUserDetail: (id: string) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id: string, status: 'active' | 'banned') =>
    api.patch(`/admin/users/${id}/status`, { status }),
  assignRole: (id: string, role: string) =>
    api.post(`/admin/users/${id}/role`, { role }),

  // A-02 Vendors
  getVendors: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/admin/vendors', { params }),
  getVendorDetail: (id: string) => api.get(`/admin/vendors/${id}`),
  updateVendorStatus: (id: string, status: string, reason?: string) =>
    api.patch(`/admin/vendors/${id}/status`, { status, reason }),

  // A-03 Products
  getProducts: (params?: { search?: string; restaurantId?: string; includeDeleted?: boolean; page?: number; limit?: number }) =>
    api.get('/admin/products', { params }),
  toggleProductVisibility: (id: string, hide: boolean) =>
    api.patch(`/admin/products/${id}/hide`, { hide }),
  permanentDeleteProduct: (id: string) => api.delete(`/admin/products/${id}`),

  // A-04 Orders
  getOrders: (params?: { userId?: string; restaurantId?: string; status?: string; dateFrom?: string; dateTo?: string; page?: number; limit?: number }) =>
    api.get('/admin/orders', { params }),
  getOrderDetail: (id: string) => api.get(`/admin/orders/${id}`),
  overrideOrderStatus: (id: string, status: string, reason: string) =>
    api.patch(`/admin/orders/${id}/status`, { status, reason }),

  // A-05 Analytics
  getRevenueAnalytics: (period: 'day' | 'week' | 'month' | 'year' = 'month') =>
    api.get('/admin/analytics/revenue', { params: { period } }),
  getVendorAnalytics: (page = 1, limit = 10) =>
    api.get('/admin/analytics/vendors', { params: { page, limit } }),
  getUserAnalytics: () => api.get('/admin/analytics/users'),
};

export default adminApi;
