import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';

// Import toàn bộ 9 Models đã triển khai
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';
import { Wallet } from '../models/Wallet';
import { Cart } from '../models/Cart';
import { CartItem } from '../models/CartItem';
import { Review } from '../models/Review';
import { Voucher } from '../models/Voucher';
import { Favorite } from '../models/Favorite';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { SystemConfig } from '../models/SystemConfig';
import { Report } from '../models/Report';
import { WithdrawalRequest } from '../models/WithdrawalRequest';
import { AdminLog } from '../models/AdminLog';
import { AiConversation } from '../models/AiConversation';
import { AiMessage } from '../models/AiMessage';
import { CustomerAiConversation } from '../models/CustomerAiConversation';
import { CustomerAiMessage } from '../models/CustomerAiMessage';
import { UserVoucher } from '../models/UserVoucher';
import { UnbanAppeal } from '../models/UnbanAppeal';

// Nạp các biến môi trường từ .env
dotenv.config();

/**
 * Khởi tạo Instance Sequelize kết nối MySQL
 */
export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'grabfood_mini',
  
  // Đăng ký toàn bộ Model vào Sequelize Instance
  models: [User, Restaurant, MenuItem, Order, Wallet, Cart, CartItem, Review, Voucher, Favorite, Conversation, Message, SystemConfig, Report, WithdrawalRequest, AdminLog, AiConversation, AiMessage, CustomerAiConversation, CustomerAiMessage, UserVoucher, UnbanAppeal],
  
  // Cấu hình ghi log SQL ra console trong môi trường phát triển
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  define: {
    // Đảm bảo underscored được bật ở cấu hình chung
    underscored: true,
  },
});

/**
 * Hàm kiểm tra kết nối và tự động đồng bộ hóa cấu trúc Database
 */
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('🔌 Đang kiểm tra kết nối tới MySQL Database...');
    // Xác thực kết nối vật lý tới DB
    await sequelize.authenticate();
    console.log('✅ Kết nối tới MySQL thành công!');

    // Tạm thời tắt kiểm tra khóa ngoại để tránh lỗi đồng bộ/deadlock của Sequelize
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Dọn sạch bảng vouchers cũ nếu bị lỗi tích lũy index (ER_TOO_MANY_KEYS)
    try {
      console.log('🧹 Đang làm sạch bảng vouchers cũ để tránh lỗi giới hạn index của MySQL...');
      await sequelize.query('DROP TABLE IF EXISTS `user_vouchers`');
      await sequelize.query('DROP TABLE IF EXISTS `vouchers`');
      console.log('✅ Đã làm sạch các bảng liên quan đến khuyến mãi.');
    } catch (e) {
      console.warn('Lưu ý: Không thể xoá bảng cũ, có thể bảng chưa tồn tại:', e);
    }

    // Tự động đồng bộ cấu trúc bảng (Syncing models)
    console.log('⚙️ Đang thực hiện đồng bộ hóa cấu trúc bảng (Syncing models)...');
    await sequelize.sync();

    // Đồng bộ cấu trúc cột payment_method và các cột PayOS cho bảng orders trong MySQL
    try {
      console.log('🔄 Đang đồng bộ cấu trúc cột payment_method và PayOS cho bảng orders...');
      await sequelize.query(`
        ALTER TABLE orders 
        MODIFY COLUMN payment_method ENUM('COD', 'WALLET', 'POINTS', 'VIETQR') NOT NULL DEFAULT 'COD'
      `);
      
      // Thêm cột payos_order_code và payos_checkout_url nếu chưa tồn tại
      const [columns]: any = await sequelize.query("SHOW COLUMNS FROM orders LIKE 'payos_order_code'");
      if (columns.length === 0) {
        await sequelize.query("ALTER TABLE orders ADD COLUMN payos_order_code BIGINT NULL");
        await sequelize.query("ALTER TABLE orders ADD COLUMN payos_checkout_url TEXT NULL");
      }

      // Thêm cột platform_fee nếu chưa tồn tại
      const [pfColumns]: any = await sequelize.query("SHOW COLUMNS FROM orders LIKE 'platform_fee'");
      if (pfColumns.length === 0) {
        await sequelize.query("ALTER TABLE orders ADD COLUMN platform_fee DECIMAL(12, 2) NOT NULL DEFAULT 0.00");
      }
      
      // Thêm cột is_paid nếu chưa tồn tại
      const [isPaidCols]: any = await sequelize.query("SHOW COLUMNS FROM orders LIKE 'is_paid'");
      if (isPaidCols.length === 0) {
        await sequelize.query("ALTER TABLE orders ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT FALSE");
      }

      // Thêm cột delivery_code nếu chưa tồn tại
      const [dcCols]: any = await sequelize.query("SHOW COLUMNS FROM orders LIKE 'delivery_code'");
      if (dcCols.length === 0) {
        await sequelize.query("ALTER TABLE orders ADD COLUMN delivery_code VARCHAR(10) NULL");
        console.log('  + Đã thêm cột delivery_code cho bảng orders.');
      }
      
      console.log('✅ Đã đồng bộ cấu trúc orders thành công.');
    } catch (e) {
      console.warn('Lưu ý: Không thể cập nhật cấu trúc orders thủ công, có thể đã được Sequelize đồng bộ:', e);
    }

    // Đồng bộ cấu trúc bảng users cho đăng nhập Google/Facebook
    try {
      console.log('🔄 Đang kiểm tra và đồng bộ cấu trúc bảng users cho Google/Facebook...');
      
      // 1. Thêm cột google_id nếu chưa có
      const [googleCols]: any = await sequelize.query("SHOW COLUMNS FROM users LIKE 'google_id'");
      if (googleCols.length === 0) {
        await sequelize.query("ALTER TABLE users ADD COLUMN google_id VARCHAR(100) NULL UNIQUE");
        console.log('  + Đã thêm cột google_id.');
      }

      // 2. Thêm cột facebook_id nếu chưa có
      const [fbCols]: any = await sequelize.query("SHOW COLUMNS FROM users LIKE 'facebook_id'");
      if (fbCols.length === 0) {
        await sequelize.query("ALTER TABLE users ADD COLUMN facebook_id VARCHAR(100) NULL UNIQUE");
        console.log('  + Đã thêm cột facebook_id.');
      }

      // 3. Sửa password thành NULL (cho phép rỗng khi dùng social login)
      await sequelize.query("ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL");
      console.log('  + Đã cập nhật password cho phép NULL.');
      
      console.log('✅ Đã đồng bộ cấu trúc bảng users thành công.');
    } catch (e) {
      console.warn('Lưu ý: Không thể cập nhật cấu trúc bảng users thủ công:', e);
    }


    // Đảm bảo cấu hình payment_methods trong MySQL chứa VIETQR: true
    try {
      console.log('🔄 Đang kiểm tra cấu hình phương thức thanh toán trong DB...');
      const [results]: any = await sequelize.query("SELECT * FROM system_configs WHERE `key` = 'payment_methods'");
      if (results.length > 0) {
        const configRecord = results[0];
        let val = JSON.parse(configRecord.value);
        if (val && typeof val === 'object' && val.VIETQR === undefined) {
          val.VIETQR = true;
          await sequelize.query(
            "UPDATE system_configs SET value = ? WHERE `key` = 'payment_methods'",
            { replacements: [JSON.stringify(val)] }
          );
          console.log('✅ Đã kích hoạt phương thức VIETQR trong cấu hình hệ thống.');
        }
      }
    } catch (e) {
      console.warn('Lưu ý: Không thể cập nhật cấu hình payment_methods trong database:', e);
    }


    // Seed database with mock data if tables are empty
    const { seedDatabase } = await import('./seedData');
    await seedDatabase();

    // Bật lại kiểm tra khóa ngoại sau khi đồng bộ xong
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Đồng bộ hóa cấu trúc bảng MySQL hoàn tất!');
    
    return true;
  } catch (error) {
    // Đảm bảo bật lại khóa ngoại kể cả khi xảy ra lỗi
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (_) {}
    console.error('❌ Lỗi khởi tạo cơ sở dữ liệu MySQL:', error);
    return false;
  }
};

export default sequelize;
