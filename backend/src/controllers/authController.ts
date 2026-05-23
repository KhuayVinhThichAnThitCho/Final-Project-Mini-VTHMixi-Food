import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

export const authController = {
  /**
   * Đăng ký tài khoản mới
   */
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;
      
      const result = await authService.register(name, email, password, role);

      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công.',
        data: result,
      });
    } catch (error) {
      next(error); // Chuyển lỗi sang global errorHandler
    }
  },

  /**
   * Đăng nhập người dùng
   */
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
