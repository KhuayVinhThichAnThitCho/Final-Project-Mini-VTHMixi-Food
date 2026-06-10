import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { userRepository } from '../repositories/userRepository';
import { AppError } from '../middlewares/errorHandler';
import path from 'path';
import fs from 'fs';

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

      const result = await authService.login(email, password) as any;

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

  /**
   * Lấy thông tin tài khoản người dùng đăng nhập hiện tại
   */
  getMe: async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện tác vụ này.');
      }

      const user = await userRepository.findById(req.user.id);
      if (!user) {
        throw new AppError(404, 'NOT_FOUND', 'Người dùng không tồn tại.');
      }

      const userJson = user.toJSON() as any;
      delete userJson.password;
      delete userJson.otpCode;
      delete userJson.otpExpiresAt;

      res.status(200).json({
        success: true,
        data: userJson,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cập nhật thông tin hồ sơ cá nhân (tên, sđt, avatar)
   * PUT /api/v1/auth/profile
   */
  updateProfile: async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện tác vụ này.');
      }

      const user = await userRepository.findById(req.user.id);
      if (!user) {
        throw new AppError(404, 'NOT_FOUND', 'Người dùng không tồn tại.');
      }

      const { name, phone, avatar, address } = req.body;

      const updateData: Record<string, any> = {};

      if (name !== undefined) {
        if (!name.trim()) throw new AppError(400, 'BUSINESS_ERROR', 'Họ và tên không được để trống.');
        updateData.name = name.trim();
      }

      if (phone !== undefined) {
        updateData.phone = phone.trim() || null;
      }

      if (address !== undefined) {
        updateData.address = address.trim() || null;
      }

      // Avatar được gửi dưới dạng base64 data URL hoặc URL chuỗi
      if (avatar !== undefined) {
        // Nếu là base64 data URL (data:image/...) thì lưu thẳng (hoặc lưu file)
        if (avatar && avatar.startsWith('data:image/')) {
          // Lưu base64 avatar vào thư mục uploads/avatars
          const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const ext = avatar.split(';')[0].split('/')[1] || 'jpg';
          const filename = `avatar_${user.id}_${Date.now()}.${ext}`;
          const filepath = path.join(uploadsDir, filename);
          const base64Data = avatar.replace(/^data:image\/\w+;base64,/, '');
          fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
          updateData.avatar = `/uploads/avatars/${filename}`;
        } else {
          updateData.avatar = avatar || null;
        }
      }

      await user.update(updateData);

      const updatedUser = user.toJSON() as any;
      delete updatedUser.password;
      delete updatedUser.otpCode;
      delete updatedUser.otpExpiresAt;

      res.status(200).json({
        success: true,
        message: 'Cập nhật hồ sơ thành công.',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Đổi mật khẩu khi đã đăng nhập
   * PUT /api/v1/auth/change-password
   */
  changePassword: async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện tác vụ này.');
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu.');
      }

      if (newPassword !== confirmPassword) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Mật khẩu mới và xác nhận mật khẩu không khớp với nhau.');
      }

      if (newPassword.length < 6) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      }

      const user = await userRepository.findById(req.user.id);
      if (!user) {
        throw new AppError(404, 'NOT_FOUND', 'Người dùng không tồn tại.');
      }

      // Kiểm tra mật khẩu cũ (hiện tại dự án chưa dùng bcrypt nên so sánh thẳng)
      if (user.password !== currentPassword) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Mật khẩu hiện tại không chính xác. Vui lòng thử lại.');
      }

      await user.update({ password: newPassword });

      res.status(200).json({
        success: true,
        message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
      });
    } catch (error) {
      next(error);
    }
  },
};
export default authController;
