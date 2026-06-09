import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

// Nạp các biến môi trường từ file .env
dotenv.config();

// Cấu hình tài khoản Cloudinary phục vụ việc lưu trữ ảnh (Món ăn, Avatar, Banner)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret',
  secure: true
});

export default cloudinary;
