import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './errorHandler';

/**
 * Middleware tự động validate dữ liệu gửi từ client bằng Zod Schema.
 * Hỗ trợ validate đồng thời req.body, req.query, hoặc req.params.
 * 
 * @param schema Zod Schema dùng để kiểm tra dữ liệu
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate dữ liệu từ client
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Gán dữ liệu sạch đã được parse ngược lại vào request
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Chuẩn hóa danh sách lỗi từ Zod thành format dễ hiểu
        const errorDetails = error.errors.map((err) => ({
          field: err.path.slice(1).join('.'), // Lấy tên trường bị lỗi (bỏ chữ 'body' ở đầu)
          message: err.message,
        }));

        // Ném lỗi VALIDATION_ERROR kèm theo danh sách trường lỗi chi tiết
        return next(
          new AppError(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không đúng định dạng yêu cầu.', errorDetails)
        );
      }

      next(error);
    }
  };
};

export default validate;
