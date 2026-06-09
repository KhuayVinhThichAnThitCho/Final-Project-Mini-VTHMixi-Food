import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { userRepository } from '../repositories/userRepository';
import { AppError } from '../middlewares/errorHandler';

export const authController = {
  /**
   * Đăng ký tài khoản mới
   */
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;
      
      const result = await authService.register(name, email, password, role);

      if (result.requiresOtp) {
        res.status(201).json({
          success: true,
          requiresOtp: true,
          message: 'Mã xác thực OTP đã được gửi đến email đăng ký của bạn.',
          data: { email: result.email },
        });
        return;
      }

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

      if (result.requiresOtp) {
        res.status(200).json({
          success: true,
          requiresOtp: true,
          message: 'Mã xác thực OTP đã được gửi đến email của bạn.',
          data: { email: result.email },
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Quên mật khẩu - gửi mã OTP giả lập
   */
  forgotPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new AppError(404, 'NOT_FOUND', 'Địa chỉ thư điện tử không tồn tại trên hệ thống.');
      }

      res.status(200).json({
        success: true,
        message: 'Mã OTP xác thực đặt lại mật khẩu đã được gửi (Mã mặc định: 123456).',
        data: { otp: '123456' },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Đặt lại mật khẩu mới
   */
  resetPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp, newPassword } = req.body;
      if (otp !== '123456') {
        throw new AppError(400, 'BUSINESS_ERROR', 'Mã xác thực OTP không chính xác.');
      }

      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new AppError(404, 'NOT_FOUND', 'Người dùng không tồn tại.');
      }

      await userRepository.update(user.id, { password: newPassword });

      res.status(200).json({
        success: true,
        message: 'Đặt lại mật khẩu thành công. Bây giờ bạn đã có thể đăng nhập bằng mật khẩu mới.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xác thực mã OTP đăng nhập
   */
  verifyOtp: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Vui lòng cung cấp đầy đủ email và mã OTP.');
      }

      const result = await authService.verifyOtp(email, otp);

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Gửi lại mã OTP
   */
  resendOtp: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Vui lòng cung cấp email.');
      }

      await authService.resendOtp(email);

      res.status(200).json({
        success: true,
        message: 'Mã OTP mới đã được gửi lại vào email của bạn.',
      });
    } catch (error) {
      next(error);
    }
  },
};
export default authController;
