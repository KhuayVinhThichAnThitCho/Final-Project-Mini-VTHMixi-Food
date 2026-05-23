import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';
import { IUser, UserRole } from '../models/User';
import { AppError } from '../middlewares/errorHandler';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_123456';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_123456';

export const authService = {
  /**
   * Tạo Access Token & Refresh Token
   */
  generateTokens: (user: IUser) => {
    const payload = { id: user.id, email: user.email, role: user.role };
    
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: '15m', // Hết hạn sau 15 phút
    });

    const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: '7d', // Hết hạn sau 7 ngày
    });

    return { accessToken, refreshToken };
  },

  /**
   * Đăng ký người dùng mới
   */
  register: async (name: string, email: string, passwordString: string, role: UserRole = 'USER') => {
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError(400, 'BUSINESS_ERROR', 'Email này đã được đăng ký sử dụng.');
    }

    // Trong thực tế cần băm mật khẩu: bcrypt.hash(password, 10)
    const user = await userRepository.create({
      name,
      email: email.toLowerCase(),
      password: passwordString, // Cần mã hóa trong thực tế
      role,
      isActive: true,
    });

    const tokens = authService.generateTokens(user);
    
    // Ẩn mật khẩu trước khi trả về
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  },

  /**
   * Đăng nhập người dùng
   */
  login: async (email: string, passwordString: string) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(400, 'BUSINESS_ERROR', 'Email hoặc mật khẩu không chính xác.');
    }

    // Kiểm tra mật khẩu (trong thực tế: bcrypt.compare)
    if (user.password !== passwordString) {
      throw new AppError(400, 'BUSINESS_ERROR', 'Email hoặc mật khẩu không chính xác.');
    }

    if (!user.isActive) {
      throw new AppError(400, 'BUSINESS_ERROR', 'Tài khoản của bạn đã bị khóa.');
    }

    const tokens = authService.generateTokens(user);

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  },
};
