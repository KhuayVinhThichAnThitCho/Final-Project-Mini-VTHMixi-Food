import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';
import { User, UserRole } from '../models/User';
import { AppError } from '../middlewares/errorHandler';
import { sendMail } from '../config/mailer';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_123456';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_123456';

/**
 * Hàm hỗ trợ sinh và gửi mã OTP qua Email
 */
const generateAndSendOtp = async (user: User): Promise<string> => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn trong 5 phút

  await user.update({
    otpCode: otp,
    otpExpiresAt: otpExpiresAt,
  });

  const emailSubject = 'Mã xác thực OTP - GrabFood Mini';
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #BF3A20; text-align: center;">Xác thực tài khoản GrabFood Mini</h2>
      <p>Xin chào <strong>${user.name}</strong>,</p>
      <p>Bạn đang thực hiện đăng ký hoặc đăng nhập vào hệ thống GrabFood Mini. Dưới đây là mã OTP xác thực của bạn:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #BF3A20; padding: 10px 20px; background-color: #f7f7f7; border: 2px dashed #BF3A20; border-radius: 4px;">
          ${otp}
        </span>
      </div>
      <p style="color: #666; font-size: 14px;">Mã OTP này có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">Đây là email tự động, vui lòng không phản hồi email này.</p>
    </div>
  `;

  console.log(`===================================================`);
  console.log(`🔑 [OTP DEBUG] Email: ${user.email} | OTP Code: ${otp}`);
  console.log(`===================================================`);

  await sendMail(user.email, emailSubject, emailHtml);
  return otp;
};

export const authService = {
  /**
   * Tạo Access Token & Refresh Token
   */
  generateTokens: (user: User) => {
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
  register: async (name: string, email: string, passwordString: string, role: UserRole = 'user') => {
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
      status: 'pending', // Cần OTP xác minh để chuyển thành active
    });

    // Sinh và gửi mã OTP qua Email
    await generateAndSendOtp(user);
    
    return { requiresOtp: true, email: user.email };
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

    if (user.status === 'banned') {
      throw new AppError(400, 'BUSINESS_ERROR', 'Tài khoản của bạn đã bị khóa.');
    }

    // Thay vì đăng nhập trực tiếp, tiến hành gửi mã OTP qua Email
    await generateAndSendOtp(user);

    return { requiresOtp: true, email: user.email };
  },

  /**
   * Xác thực mã OTP và đăng nhập
   */
  verifyOtp: async (email: string, otp: string) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'Người dùng không tồn tại.');
    }

    if (user.status === 'banned') {
      throw new AppError(400, 'BUSINESS_ERROR', 'Tài khoản của bạn đã bị khóa.');
    }

    if (!user.otpCode || user.otpCode !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new AppError(400, 'BUSINESS_ERROR', 'Mã xác thực OTP không chính xác hoặc đã hết hạn.');
    }

    // Reset mã OTP sau khi xác thực thành công và kích hoạt tài khoản
    await user.update({
      otpCode: null,
      otpExpiresAt: null,
      status: 'active',
    });

    const tokens = authService.generateTokens(user);

    const userJson = user.toJSON() as any;
    delete userJson.password;
    delete userJson.otpCode;
    delete userJson.otpExpiresAt;

    return { user: userJson, ...tokens };
  },

  /**
   * Gửi lại mã OTP
   */
  resendOtp: async (email: string) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'Người dùng không tồn tại.');
    }

    if (user.status === 'banned') {
      throw new AppError(400, 'BUSINESS_ERROR', 'Tài khoản của bạn đã bị khóa.');
    }

    await generateAndSendOtp(user);
    return true;
  },
};
export default authService;
