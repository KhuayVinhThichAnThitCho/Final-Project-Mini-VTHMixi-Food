import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/rbacMiddleware';

const router = Router();

// Yêu cầu đăng nhập cho tất cả các route chat
router.use(authMiddleware);

// ==========================================
// ROUTES CHO NGƯỜI MUA (USER)
// ==========================================

// Lấy danh sách hội thoại của user
router.get('/user', chatController.getUserConversations);

// Lấy hoặc tạo hội thoại với 1 nhà hàng cụ thể (tự động tạo lời chào)
router.get('/restaurant/:restaurantId', chatController.getOrCreateConversation);

// ==========================================
// ROUTES CHO NGƯỜI BÁN (VENDOR)
// ==========================================

// Lấy danh sách hội thoại của nhà hàng mình quản lý
router.get('/vendor', authorize(['vendor', 'admin']), chatController.getVendorConversations);

// ==========================================
// ROUTES CHUNG
// ==========================================

// Lấy tin nhắn của một hội thoại cụ thể
router.get('/:conversationId/messages', chatController.getMessages);

export default router;
