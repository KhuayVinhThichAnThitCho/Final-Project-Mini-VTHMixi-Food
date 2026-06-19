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
import { AiConversation } from '../models/AiConversation';
import { AiMessage } from '../models/AiMessage';
import { CustomerAiConversation } from '../models/CustomerAiConversation';
import { CustomerAiMessage } from '../models/CustomerAiMessage';

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
  models: [User, Restaurant, MenuItem, Order, Wallet, Cart, CartItem, Review, Voucher, Favorite, Conversation, Message, SystemConfig, Report, WithdrawalRequest, AiConversation, AiMessage, CustomerAiConversation, CustomerAiMessage],
  
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

    // Tạm thời tắt kiểm tra khóa ngoại để tránh lỗi đồng bộ/deadlock của Sequelize (Sync alter)
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Tự động đồng bộ hóa các thay đổi cấu trúc bảng.
    // Dùng sequelize.sync() để chỉ tạo bảng nếu chưa có (không chạy lại các lệnh ALTER TABLE phiền phức trên mỗi lần restart).
    // Nếu bạn sửa Model (thêm cột, đổi kiểu dữ liệu) thì đổi tạm thời thành { alter: true } để DB cập nhật theo, sau đó đổi lại.
    console.log('⚙️ Đang thực hiện đồng bộ hóa cấu trúc bảng (Syncing models)...');
    await sequelize.sync();


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
