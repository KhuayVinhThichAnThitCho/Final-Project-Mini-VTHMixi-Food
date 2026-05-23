import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';

// Import toàn bộ 5 Models đã triển khai
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';
import { Wallet } from '../models/Wallet';

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
  models: [User, Restaurant, MenuItem, Order, Wallet],
  
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

    // Tự động đồng bộ hóa các thay đổi cấu trúc bảng mà không làm mất dữ liệu cũ (alter: true)
    console.log('⚙️ Đang thực hiện đồng bộ hóa cấu trúc bảng (Syncing models)...');
    await sequelize.sync({ alter: true });
    console.log('✅ Đồng bộ hóa cấu trúc bảng MySQL hoàn tất!');
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi khởi tạo cơ sở dữ liệu MySQL:', error);
    return false;
  }
};

export default sequelize;
