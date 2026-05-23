import { Request, Response, NextFunction } from 'express';

/**
 * Danh sách các mã lỗi nghiệp vụ chuẩn hóa của hệ thống.
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'  // Lỗi xác thực dữ liệu đầu vào (Zod validate, v.v.)
  | 'OTP_EXPIRED'        // Mã OTP đã hết hạn sử dụng
  | 'BUSINESS_ERROR'     // Lỗi nghiệp vụ logic chung (ví dụ: ví không đủ tiền, nhà hàng đóng cửa)
  | 'UNAUTHORIZED'       // Chưa xác thực hoặc Token không hợp lệ
  | 'FORBIDDEN'          // Không có quyền truy cập tài nguyên (RBAC)
  | 'NOT_FOUND'          // Không tìm thấy tài nguyên
  | 'INTERNAL_ERROR';    // Lỗi hệ thống không xác định

/**
 * Lớp lỗi tùy chỉnh kế thừa từ Error để sử dụng trong toàn bộ ứng dụng Express.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly errors?: any;

  constructor(statusCode: number, errorCode: ErrorCode, message: string, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;

    // Giữ vết của ngăn xếp cuộc gọi (Stack Trace)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware Express xử lý lỗi tập trung (Global Error Handler).
 * Tất cả các lỗi xảy ra trong Controller hoặc Service khi được throw hoặc chuyển qua next(err) 
 * đều sẽ được bắt và chuẩn hóa định dạng trả về tại đây.
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Mặc định là lỗi hệ thống 500
  let statusCode = 500;
  let errorCode: ErrorCode = 'INTERNAL_ERROR';
  let message = 'Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.';
  let errors: any = undefined;

  // Nếu là lỗi được định nghĩa trước (AppError)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    errors = err.errors;
  } 
  // Xử lý các lỗi phổ biến từ thư viện ngoài (ví dụ lỗi định dạng JSON lỗi cú pháp đầu vào)
  else if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Dữ liệu JSON gửi lên không hợp lệ.';
  }

  // Ghi log lỗi ra console (hoặc có thể tích hợp với Winston, Bunyan trong thực tế)
  console.error(`[Error Log] [${new Date().toISOString()}] - ${errorCode} (${statusCode}): ${err.message}`);
  if (err.stack && statusCode === 500) {
    console.error(err.stack);
  }

  // Trả về response JSON chuẩn hóa cho Client
  res.status(statusCode).json({
    success: false,
    errorCode,
    message,
    ...(errors && { errors }), // Chỉ đính kèm trường errors nếu có dữ liệu chi tiết
  });
};
