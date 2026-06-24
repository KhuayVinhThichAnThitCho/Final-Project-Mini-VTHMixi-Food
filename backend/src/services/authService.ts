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

    // Nếu tài khoản mới đăng ký đang ở trạng thái pending, tự động kích hoạt khi đăng nhập thành công
    if (user.status === 'pending') {
      await user.update({ status: 'active' });
    }

    // Tạo Access Token & Refresh Token và đăng nhập trực tiếp
    const tokens = authService.generateTokens(user);

    const userJson = user.toJSON() as any;
    delete userJson.password;
    delete userJson.otpCode;
    delete userJson.otpExpiresAt;

    return { requiresOtp: false, user: userJson, ...tokens };
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

  /**
   * Đăng nhập bằng Google OAuth 2.0
   */
  googleLogin: async (code: string, redirectUri: string) => {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new AppError(500, 'INTERNAL_ERROR', 'Google OAuth credentials are not configured on the server.');
    }

    try {
      // 1. Đổi Authorization Code lấy Access Token
      const tokenResponse = await globalThis.fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Google Token Exchange Error:', errorData);
        throw new AppError(400, 'BUSINESS_ERROR', 'Không thể xác thực mã code với Google.');
      }

      const tokenData = (await tokenResponse.json()) as any;
      const accessToken = tokenData.access_token;

      // 2. Lấy thông tin cá nhân của người dùng từ Google
      const userInfoResponse = await globalThis.fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Không thể lấy thông tin người dùng từ Google.');
      }

      const googleUser = (await userInfoResponse.json()) as any;
      const { sub: googleId, email, name, picture: avatar } = googleUser;

      if (!email) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Tài khoản Google của bạn không cung cấp địa chỉ email.');
      }

      // 3. Khớp hoặc tạo tài khoản mới trong cơ sở dữ liệu
      let user = await User.findOne({ where: { googleId } });

      if (!user) {
        // Tìm theo email xem đã có tài khoản thường chưa
        user = await userRepository.findByEmail(email);
        if (user) {
          // Liên kết tài khoản hiện có với googleId
          const updateData: Partial<User> = { googleId };
          if (!user.avatar && avatar) {
            updateData.avatar = avatar;
          }
          await user.update(updateData);
        } else {
          // Tạo tài khoản mới hoàn toàn
          user = await userRepository.create({
            name: name || 'Người dùng Google',
            email: email.toLowerCase(),
            googleId,
            avatar,
            role: 'user',
            status: 'active', // Bỏ qua OTP kích hoạt
          });
        }
      }

      if (user.status === 'banned') {
        throw new AppError(400, 'BUSINESS_ERROR', 'Tài khoản của bạn đã bị khóa.');
      }

      // Nếu tài khoản mới tạo hoặc pending, kích hoạt luôn
      if (user.status === 'pending') {
        await user.update({ status: 'active' });
      }

      // 4. Tạo token của hệ thống và trả về
      const tokens = authService.generateTokens(user);

      const userJson = user.toJSON() as any;
      delete userJson.password;
      delete userJson.otpCode;
      delete userJson.otpExpiresAt;

      return { user: userJson, ...tokens };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Google Login Service Error:', error);
      throw new AppError(500, 'INTERNAL_ERROR', 'Đã xảy ra lỗi hệ thống trong quá trình đăng nhập bằng Google.');
    }
  },

  /**
   * Đăng nhập bằng Facebook OAuth 2.0
   */
  facebookLogin: async (code: string, redirectUri: string) => {
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
    const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

    console.log(`[FB OAUTH DEBUG] FACEBOOK_APP_ID (length: ${FACEBOOK_APP_ID?.length}): ${FACEBOOK_APP_ID}`);
    console.log(`[FB OAUTH DEBUG] FACEBOOK_APP_SECRET (length: ${FACEBOOK_APP_SECRET?.length}): ${FACEBOOK_APP_SECRET ? FACEBOOK_APP_SECRET.slice(0, 10) + '...' : 'undefined'}`);

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      throw new AppError(500, 'INTERNAL_ERROR', 'Facebook OAuth credentials are not configured on the server.');
    }

    try {
      // 1. Đổi Authorization Code lấy Access Token
      const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`;
      const tokenResponse = await globalThis.fetch(tokenUrl);

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Facebook Token Exchange Error:', errorData);
        throw new AppError(400, 'BUSINESS_ERROR', 'Không thể xác thực mã code với Facebook.');
      }

      const tokenData = (await tokenResponse.json()) as any;
      const fbAccessToken = tokenData.access_token;

      // 2. Lấy thông tin cá nhân của người dùng từ Facebook
      const userInfoUrl = `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${fbAccessToken}`;
      const userInfoResponse = await globalThis.fetch(userInfoUrl);

      if (!userInfoResponse.ok) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Không thể lấy thông tin người dùng từ Facebook.');
      }

      const fbUser = (await userInfoResponse.json()) as any;
      const { id: facebookId, name, email } = fbUser;
      const avatar = fbUser.picture?.data?.url;

      // Đảm bảo cấu trúc DB bằng cách tạo email giả lập từ fbId nếu Facebook không trả về email
      const userEmail = email ? email.toLowerCase() : `${facebookId}@facebook.com`;

      // 3. Khớp hoặc tạo tài khoản mới trong cơ sở dữ liệu
      let user = await User.findOne({ where: { facebookId } });

      if (!user) {
        // Tìm theo email xem đã có tài khoản thường chưa
        user = await userRepository.findByEmail(userEmail);
        if (user) {
          // Liên kết tài khoản hiện có với facebookId
          const updateData: Partial<User> = { facebookId };
          if (!user.avatar && avatar) {
            updateData.avatar = avatar;
          }
          await user.update(updateData);
        } else {
          // Tạo tài khoản mới hoàn toàn
          user = await userRepository.create({
            name: name || 'Người dùng Facebook',
            email: userEmail,
            facebookId,
            avatar,
            role: 'user',
            status: 'active', // Bỏ qua OTP kích hoạt
          });
        }
      }

      if (user.status === 'banned') {
        throw new AppError(400, 'BUSINESS_ERROR', 'Tài khoản của bạn đã bị khóa.');
      }

      // Nếu tài khoản mới tạo hoặc pending, kích hoạt luôn
      if (user.status === 'pending') {
        await user.update({ status: 'active' });
      }

      // 4. Tạo token của hệ thống và trả về
      const tokens = authService.generateTokens(user);

      const userJson = user.toJSON() as any;
      delete userJson.password;
      delete userJson.otpCode;
      delete userJson.otpExpiresAt;

      return { user: userJson, ...tokens };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Facebook Login Service Error:', error);
      throw new AppError(500, 'INTERNAL_ERROR', 'Đã xảy ra lỗi hệ thống trong quá trình đăng nhập bằng Facebook.');
    }
  },
};
export default authService;
