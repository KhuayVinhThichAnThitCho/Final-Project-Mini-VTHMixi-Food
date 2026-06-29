import { Order } from '../models/Order';
import { Restaurant } from '../models/Restaurant';
import { Wallet } from '../models/Wallet';
import { walletService } from './walletService';
import { notificationService } from './notificationService';

export const reconciliationService = {
  /**
   * Thực hiện đối soát tài chính khi đơn hàng hoàn thành
   * Cộng tiền cho Quán ăn, cộng phí ship cho Shipper, khấu trừ COD nếu cần
   */
  settleOrderPayment: async (order: Order): Promise<void> => {
    try {
      console.log(`🏦 [Reconciliation] Bắt đầu đối soát đơn hàng #${order.id} (Phương thức: ${order.paymentMethod})`);

      const shipperId = order.shipperId;
      if (!shipperId) {
        console.log(`⚠️ Đơn hàng #${order.id} không có Shipper được gán, bỏ qua đối soát tài chính.`);
        return;
      }

      const restaurant = await Restaurant.findByPk(order.restaurantId);
      if (!restaurant) {
        console.error(`❌ Không tìm thấy Nhà hàng #${order.restaurantId} của đơn hàng #${order.id}`);
        return;
      }
      const vendorUserId = restaurant.ownerId; // Chủ cửa hàng nhận tiền

      const totalAmount = Number(order.totalAmount || 0);
      const shippingFee = Number(order.shippingFee || 15000);
      const platformFee = Number(order.platformFee || 0);

      // Doanh thu thức ăn (không bao gồm ship)
      const foodRevenue = Math.max(totalAmount - shippingFee, 0);
      // Thực thu của Vendor = Tiền ăn - Phí hệ thống trích lại
      const vendorNetRevenue = Math.max(foodRevenue - platformFee, 0);

      if (order.paymentMethod === 'COD') {
        // --- MÔ HÌNH 1: ĐỐI SOÁT TỰ ĐỘNG QUA VÍ (PAYMENT METHOD IS COD) ---
        // Khách trả tiền mặt cho Shipper -> Shipper cầm tiền mặt thức ăn + ship.
        
        // 1. Cộng tiền doanh thu (Net) vào ví của Vendor
        await walletService.deposit(
          vendorUserId,
          vendorNetRevenue,
          `Doanh thu đơn hàng #${order.id} (Thanh toán COD qua Shipper thu hộ)`
        );

        // 2. Khấu trừ Ví của Shipper:
        // Shipper đang giữ tiền mặt của khách (foodRevenue + shippingFee).
        // Shipper nợ quán ăn tiền thức ăn (foodRevenue). Phí ship (shippingFee) là của shipper.
        // Vậy hệ thống sẽ trừ tài khoản ví shipper một lượng ròng là: foodRevenue
        // Đồng thời hệ thống cộng phí ship (shippingFee) cho shipper.
        // Tổng biến động ví shipper: + shippingFee - foodRevenue
        const shipperWallet = await walletService.getOrCreateWallet(shipperId);
        const netAdjustment = shippingFee - foodRevenue;
        
        shipperWallet.balance = Number(shipperWallet.balance) + netAdjustment;
        await shipperWallet.save();

        // Ghi nhận lịch sử giao dịch ròng cho Shipper
        await walletService.recordTransaction(
          shipperWallet.id,
          shippingFee,
          'DEPOSIT',
          `Thu nhập phí giao hàng đơn #${order.id}`
        );
        await walletService.recordTransaction(
          shipperWallet.id,
          foodRevenue,
          'PAYMENT',
          `Khấu trừ tiền thức ăn thu hộ COD đơn #${order.id}`
        );

        console.log(`✅ [Reconciliation] Đã đối soát COD thành công cho đơn #${order.id}:`);
        console.log(`   - Vendor (${vendorUserId}) nhận: +${vendorNetRevenue}đ`);
        console.log(`   - Shipper (${shipperId}) nhận ship: +${shippingFee}đ, trừ thu hộ: -${foodRevenue}đ (Ví biến động: ${netAdjustment}đ)`);

      } else {
        // --- THANH TOÁN TRỰC TUYẾN (WALLET, VIETQR, POINTS) ---
        // Tiền đã chuyển vào tài khoản hệ thống (không có tiền mặt qua shipper).

        // 1. Cộng doanh thu thức ăn (Net) vào ví của Vendor
        await walletService.deposit(
          vendorUserId,
          vendorNetRevenue,
          `Doanh thu đơn hàng #${order.id} (Thanh toán trực tuyến)`
        );

        // 2. Cộng phí ship vào ví của Shipper
        await walletService.deposit(
          shipperId,
          shippingFee,
          `Thu nhập phí giao hàng đơn #${order.id}`
        );

        console.log(`✅ [Reconciliation] Đã đối soát Online thành công cho đơn #${order.id}:`);
        console.log(`   - Vendor (${vendorUserId}) nhận: +${vendorNetRevenue}đ`);
        console.log(`   - Shipper (${shipperId}) nhận ship: +${shippingFee}đ`);
      }
    } catch (error) {
      console.error(`❌ [Reconciliation Error] Lỗi đối soát đơn hàng #${order.id}:`, error);
    }
  },
};

export default reconciliationService;
