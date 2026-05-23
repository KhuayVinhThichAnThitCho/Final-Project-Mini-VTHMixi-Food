import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import { errorHandler, AppError } from './middlewares/errorHandler';
import apiRouter from './routes';


// Nạp các biến môi trường từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. CẤU HÌNH CÁC MIDDLEWARE CHUNG
// ==========================================

// Ghi nhận log request HTTP ra console bằng Morgan (chế độ dev)
app.use(morgan('dev'));

// Cho phép chia sẻ tài nguyên nguồn gốc chéo (CORS) từ frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

// Phân tích cú pháp dữ liệu JSON từ body request (Max size 10mb)
app.use(express.json({ limit: '10mb' }));

// Phân tích dữ liệu URL-encoded (từ form post truyền thống)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// 2. KHỞI TẠO CÁC ROUTE CỦA HỆ THỐNG
// ==========================================

// Route kiểm tra trạng thái hoạt động của Server (Health Check)
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'GrabFood Mini Backend API hoạt động bình thường.',
    timestamp: new Date().toISOString(),
  });
});

// Đăng ký các route thực tế của hệ thống
app.use('/api/v1', apiRouter);

// ==========================================
// 3. XỬ LÝ LỖI KHÔNG TÌM THẤY ROUTE (404 NOT FOUND)
// ==========================================
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(404, 'NOT_FOUND', `Không tìm thấy tài nguyên: ${req.method} ${req.originalUrl}`);
  next(error);
});

// ==========================================
// 4. ĐĂNG KÝ MIDDLEWARE XỬ LÝ LỖI TẬP TRUNG (GLOBAL ERROR HANDLER)
// ==========================================
// Middleware này bắt buộc phải đặt sau cùng để hứng mọi lỗi phát sinh
app.use(errorHandler);

// Lắng nghe cổng kết nối nếu ứng dụng được chạy trực tiếp
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 GrabFood Mini Backend chạy trên: http://localhost:${PORT}`);
    console.log(`⚙️  API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`===================================================`);
  });
}

export default app;
