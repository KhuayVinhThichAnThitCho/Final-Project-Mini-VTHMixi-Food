import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { appealController } from '../controllers/appealController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/rbacMiddleware';

const router = Router();

// Tất cả routes Admin đều yêu cầu xác thực JWT + role admin
router.use(authMiddleware);
router.use(authorize(['admin']));

// ============================================================
// DASHBOARD
// GET /api/v1/admin/dashboard
// ============================================================
router.get('/dashboard', adminController.getDashboard);

// ============================================================
// A-01: QUẢN LÝ USER
// ============================================================

// GET /api/v1/admin/users              — Danh sách user (query: role, search, status, page, limit)
router.get('/users', adminController.getAllUsers);

// GET /api/v1/admin/users/:id          — Chi tiết user + lịch sử đơn hàng
router.get('/users/:id', adminController.getUserDetail);

// PATCH /api/v1/admin/users/:id/status — Khóa / Mở khóa tài khoản
router.patch('/users/:id/status', adminController.updateUserStatus);

// POST /api/v1/admin/users/:id/role    — Gán role cho user (A-06)
router.post('/users/:id/role', adminController.assignRole);

// ============================================================
// A-02: QUẢN LÝ VENDOR
// ============================================================

// GET /api/v1/admin/vendors            — Danh sách tất cả vendor (query: search, status, page, limit)
router.get('/vendors', adminController.getAllVendors);

// GET /api/v1/admin/vendors/:id        — Chi tiết vendor + doanh thu + đơn hàng
router.get('/vendors/:id', adminController.getVendorDetail);

// PATCH /api/v1/admin/vendors/:id/status — Override trạng thái nhà hàng
router.patch('/vendors/:id/status', adminController.updateVendorStatus);

// ============================================================
// A-03: QUẢN LÝ SẢN PHẨM
// ============================================================

// GET /api/v1/admin/products           — Toàn bộ sản phẩm (query: search, restaurantId, includeDeleted, page, limit)
router.get('/products', adminController.getAllProducts);

// DELETE /api/v1/admin/products/:id    — Xóa vĩnh viễn sản phẩm vi phạm
router.delete('/products/:id', adminController.permanentDeleteProduct);

// PATCH /api/v1/admin/products/:id/hide — Ẩn / Hiện sản phẩm
router.patch('/products/:id/hide', adminController.toggleProductVisibility);

// ============================================================
// A-04: QUẢN LÝ ĐƠN HÀNG TOÀN HỆ THỐNG
// ============================================================

// GET /api/v1/admin/orders             — Toàn bộ đơn hàng (query: userId, restaurantId, status, dateFrom, dateTo, page, limit)
router.get('/orders', adminController.getAllOrders);

// GET /api/v1/admin/orders/:id         — Chi tiết đơn hàng
router.get('/orders/:id', adminController.getOrderDetail);

// PATCH /api/v1/admin/orders/:id/status — Admin override trạng thái đơn (can thiệp tranh chấp)
router.patch('/orders/:id/status', adminController.overrideOrderStatus);

// ============================================================
// A-05: BÁO CÁO DOANH THU
// ============================================================

// GET /api/v1/admin/analytics/revenue?period=month  — Doanh thu theo period
router.get('/analytics/revenue', adminController.getRevenueAnalytics);

// GET /api/v1/admin/analytics/vendors               — Thống kê top vendor
router.get('/analytics/vendors', adminController.getVendorAnalytics);

// GET /api/v1/admin/analytics/users                 — Thống kê user
router.get('/analytics/users', adminController.getUserAnalytics);

// ============================================================
// LỊCH SỬ HOẠT ĐỘNG
// ============================================================

// GET /api/v1/admin/activity-logs — Lịch sử hành động Admin (query: action, adminId, dateFrom, dateTo, page, limit)
router.get('/activity-logs', adminController.getActivityLogs);

// ============================================================
// A-07: CẤU HÌNH HỆ THỐNG
// ============================================================

// GET  /api/v1/admin/settings           — Lấy toàn bộ config hệ thống
router.get('/settings', adminController.getSystemConfigs);

// POST /api/v1/admin/settings/batch     — Cập nhật nhiều config cùng lúc
router.post('/settings/batch', adminController.batchUpdateConfigs);

// PATCH /api/v1/admin/settings/:key     — Cập nhật một config theo key
router.patch('/settings/:key', adminController.updateSystemConfig);

// ============================================================
// QUẢN LÝ YÊU CẦU MỞ KHÓA (UNBAN APPEALS)
// ============================================================

// GET /api/v1/admin/appeals              — Danh sách đơn yêu cầu mở khóa
router.get('/appeals', appealController.getAppeals);

// POST /api/v1/admin/appeals/:id/resolve  — Xử lý yêu cầu mở khóa (approved/rejected)
router.post('/appeals/:id/resolve', appealController.resolveAppeal);

export default router;
