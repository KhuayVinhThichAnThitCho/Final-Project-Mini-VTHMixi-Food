import { orderRepository } from '../repositories/orderRepository';
import { walletService } from './walletService';
import { Order, OrderStatus, PaymentMethod } from '../models/Order';
import { AppError } from '../middlewares/errorHandler';
import { User } from '../models/User';
import { Voucher } from '../models/Voucher';
import { UserVoucher } from '../models/UserVoucher';
import { SystemConfig } from '../models/SystemConfig';

export const orderService = {
  /**
   * Khởi tạo đơn hàng mới
   */
  createOrder: async (
    userId: string,
    restaurantId: string,
    items: { menuItemId: string; name: string; quantity: number; price: number }[],
    deliveryAddress: string,
    paymentMethod: PaymentMethod,
    voucherCode?: string
  ): Promise<Order> => {
    if (items.length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Đơn hàng phải chứa ít nhất một món ăn.');
    }

    // 1. Tính tổng tiền gốc của món ăn
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Lấy cấu hình phí từ hệ thống
    const platformFeeConfig = await SystemConfig.findByPk('platform_fee');
    const minOrderAmountConfig = await SystemConfig.findByPk('min_order_amount');

    const platformFeePercent = platformFeeConfig ? Number(JSON.parse(platformFeeConfig.value)) : 5;
    const minOrderAmount = minOrderAmountConfig ? Number(JSON.parse(minOrderAmountConfig.value)) : 20000;

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (totalPrice < minOrderAmount) {
      throw new AppError(400, 'BUSINESS_ERROR', `Đơn hàng chưa đạt giá trị tối thiểu ${minOrderAmount.toLocaleString('vi-VN')} đ để đặt hàng.`);
    }

    // 2. Tính số tiền giảm giá nếu áp dụng voucher
    let discount = 0;
    let userVoucherToUpdate: any = null;

    if (voucherCode) {
      const voucher = await Voucher.findOne({ where: { code: voucherCode, isActive: true } });
      if (!voucher) {
        throw new AppError(404, 'NOT_FOUND', 'Mã giảm giá không tồn tại hoặc đã hết hạn.');
      }

      const now = new Date();
      if (now < voucher.startDate || now > voucher.endDate) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Mã giảm giá không nằm trong thời gian áp dụng.');
      }

      if (voucher.restaurantId && voucher.restaurantId !== restaurantId) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Mã giảm giá này không áp dụng cho quán ăn này.');
      }

      if (totalPrice < Number(voucher.minOrderAmount)) {
        throw new AppError(400, 'BUSINESS_ERROR', `Đơn hàng chưa đạt giá trị tối thiểu ${Number(voucher.minOrderAmount).toLocaleString('vi-VN')} đ để áp dụng mã này.`);
      }

      // Kiểm tra trạng thái trong ví voucher của người dùng
      const userVoucher = await UserVoucher.findOne({
        where: {
          userId,
          voucherId: voucher.id,
        }
      });

      if (userVoucher) {
        if (userVoucher.isUsed) {
          throw new AppError(400, 'BUSINESS_ERROR', 'Bạn đã sử dụng mã giảm giá này rồi.');
        }
        userVoucherToUpdate = userVoucher;
      } else {
        // Tự động thu thập và đánh dấu sử dụng
        userVoucherToUpdate = {
          autoCreate: true,
          userId,
          voucherId: voucher.id,
        };
      }

      if (voucher.discountType === 'fixed_amount') {
        discount = Number(voucher.discountValue);
      } else if (voucher.discountType === 'percentage') {
        const calculated = (totalPrice * Number(voucher.discountValue)) / 100;
        discount = voucher.maxDiscountAmount ? Math.min(calculated, Number(voucher.maxDiscountAmount)) : calculated;
      }
    }

    // Tính toán phí vận chuyển và phí nền tảng
    const platformFee = Math.round(totalPrice * (platformFeePercent / 100));
    const customerDeliveryFee = 15000;

    // Khách hàng không phải chịu phí nền tảng, phí này do nhà hàng chịu (trích khấu trừ từ doanh thu)
    const finalAmount = Math.max(totalPrice + customerDeliveryFee - discount, 0);

    // 3. Xử lý thanh toán theo phương thức chọn
    let payosOrderCode: number | undefined;

    if (paymentMethod === 'WALLET') {
      // Thanh toán qua ví điện tử
      await walletService.payWithWallet(userId, finalAmount, `Thanh toán đơn hàng tại nhà hàng ${restaurantId}`);
    } else if (paymentMethod === 'POINTS') {
      // Thanh toán bằng điểm tích lũy (Quy đổi: 1 điểm = 1.000đ)
      const pointsNeeded = Math.ceil(finalAmount / 1000);
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy thông tin tài khoản người dùng.');
      }
      if (user.points < pointsNeeded) {
        throw new AppError(400, 'BUSINESS_ERROR', `Bạn không đủ điểm tích lũy để thanh toán đơn hàng này (cần ${pointsNeeded} điểm, hiện có ${user.points} điểm).`);
      }
      user.points -= pointsNeeded;
      await user.save();
      console.log(`🪙 User ${userId} đã thanh toán ${pointsNeeded} điểm tích lũy cho đơn hàng.`);
    } else if (paymentMethod === 'VIETQR') {
      // Sinh mã số orderCode duy nhất cho PayOS (phải là số, tối đa 53-bit)
      // Dùng 9 chữ số cuối của timestamp + số ngẫu nhiên 3 chữ số
      payosOrderCode = Number(String(Date.now()).slice(-9)) + Math.floor(Math.random() * 1000);
    }

    // 4. Tạo đơn hàng lưu vào database
    const order = await orderRepository.create({
      userId,
      restaurantId,
      items,
      totalAmount: finalAmount,
      deliveryAddress,
      paymentMethod,
      payosOrderCode,
      isPaid: (paymentMethod === 'WALLET' || paymentMethod === 'POINTS'),
    });

    // 4b. Sinh link thanh toán PayOS nếu chọn phương thức VIETQR
    if (paymentMethod === 'VIETQR' && payosOrderCode) {
      const isMockMode = !process.env.PAYOS_CLIENT_ID || 
                         process.env.PAYOS_CLIENT_ID === 'your_payos_client_id';

      if (isMockMode) {
        console.log("⚠️  [PayOS Mock] Đang chạy ở chế độ GIẢ LẬP thanh toán VietQR.");
        order.payosCheckoutUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout?status=pending&payment=vietqr&orderId=${order.id}&amount=${finalAmount}&code=${payosOrderCode}`;
        await order.save();
      } else {
        try {
          const { payos } = await import('./payosService');
          // Nội dung thanh toán tối đa 25 ký tự không dấu/kí tự đặc biệt
          const description = `Gfood ${payosOrderCode}`.substring(0, 25);
          
          const returnUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout?status=success&orderId=${order.id}`;
          const cancelUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout?status=cancelled&orderId=${order.id}`;

          const paymentLinkData = {
            orderCode: payosOrderCode,
            amount: finalAmount,
            description,
            cancelUrl,
            returnUrl,
          };

          const paymentLink = await payos.paymentRequests.create(paymentLinkData);
          order.payosCheckoutUrl = paymentLink.checkoutUrl;
          await order.save();
        } catch (err: any) {
          console.error("❌ Lỗi khi sinh link thanh toán PayOS:", err);
          order.payosCheckoutUrl = "ERROR_CREATING_LINK";
          await order.save();
        }
      }
    }

    // 5. Đánh dấu voucher đã dùng trong ví
    if (userVoucherToUpdate) {
      const now = new Date();
      if (userVoucherToUpdate.autoCreate) {
        await UserVoucher.create({
          userId: userVoucherToUpdate.userId,
          voucherId: userVoucherToUpdate.voucherId,
          isUsed: true,
          usedAt: now,
        });
      } else {
        userVoucherToUpdate.isUsed = true;
        userVoucherToUpdate.usedAt = now;
        await userVoucherToUpdate.save();
      }
    }

    return order;
  },

  /**
   * Cập nhật trạng thái đơn hàng (Dành cho Vendor, Manager hoặc Admin)
   */
  updateOrderStatus: async (orderId: string, userId: string, newStatus: OrderStatus): Promise<Order> => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng yêu cầu.');
    }

    // Trong thực tế cần phân quyền: chỉ có Vendor chủ cửa hàng đó hoặc Admin mới được cập nhật
    // if (order.restaurantOwnerId !== userId) { throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền cập nhật đơn hàng này.'); }

    const updatedOrder = await orderRepository.updateStatus(orderId, newStatus);
    if (!updatedOrder) {
      throw new AppError(500, 'INTERNAL_ERROR', 'Cập nhật trạng thái đơn hàng thất bại.');
    }

    return updatedOrder;
  },
};
export default orderService;
