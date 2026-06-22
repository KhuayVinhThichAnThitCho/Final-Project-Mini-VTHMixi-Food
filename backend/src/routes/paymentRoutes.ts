import { Router, Request, Response, NextFunction } from 'express';
import { payos } from '../services/payosService';
import { Order } from '../models/Order';

const router = Router();

/**
 * Webhook nhận thông báo biến động giao dịch từ PayOS
 * POST /api/v1/payments/webhook
 */
router.post('/webhook', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = req.body;
    console.log('📬 Nhận Webhook từ PayOS:', JSON.stringify(body));

    // PayOS gửi webhook test khi cấu hình webhook URL
    if (body.desc === 'confirm' || body.data?.description === 'ma giao dich thu nghiem') {
      console.log('✅ Xác thực cấu hình webhook PayOS thành công.');
      res.status(200).json({ success: true, message: 'Webhook confirmed successfully' });
      return;
    }

    // Xác thực chữ ký và giải mã dữ liệu webhook bằng SDK PayOS
    const webhookData = await payos.webhooks.verify(body);
    console.log('🔍 Dữ liệu PayOS Webhook đã giải mã:', webhookData);

    const { orderCode, code } = webhookData;

    if (code === '00') {
      // Tìm đơn hàng bằng payosOrderCode
      const order = await Order.findOne({ where: { payosOrderCode: orderCode } });
      if (!order) {
        console.warn(`⚠️  Không tìm thấy đơn hàng với payosOrderCode: ${orderCode}`);
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }

      // Nếu đơn hàng đang ở trạng thái pending, cập nhật sang confirmed
      if (order.status === 'pending') {
        order.status = 'confirmed';
        await order.save();
        console.log(`✅ Đơn hàng ${order.id} (PayOS: ${orderCode}) đã thanh toán thành công và chuyển trạng thái sang confirmed!`);
      } else {
        console.log(`ℹ️  Đơn hàng ${order.id} đã ở trạng thái: ${order.status}`);
      }
    } else {
      console.warn('❌ Thanh toán qua PayOS thất bại hoặc giao dịch không thành công:', webhookData);
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('❌ Lỗi khi xử lý PayOS Webhook:', error);
    res.status(400).json({ success: false, message: error.message || 'Signature verification failed' });
  }
});

/**
 * Endpoint giả lập thanh toán thành công (Dành cho chế độ Mock Mode)
 * POST /api/v1/payments/mock-success
 */
router.post('/mock-success', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.body;
    console.log('📬 Yêu cầu giả lập thanh toán thành công cho đơn hàng:', orderId);

    const order = await Order.findByPk(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
      return;
    }

    if (order.status === 'pending') {
      order.status = 'confirmed';
      await order.save();
      console.log(`✅ [PayOS Mock] Đơn hàng ${order.id} đã được giả lập thanh toán thành công!`);
    }

    res.status(200).json({ success: true, message: 'Giả lập thanh toán thành công.' });
  } catch (error: any) {
    next(error);
  }
});

export default router;
