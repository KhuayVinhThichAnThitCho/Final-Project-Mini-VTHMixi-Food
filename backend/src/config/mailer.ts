import nodemailer from 'nodemailer';

// Khởi tạo Transporter cho Nodemailer gửi email (ví dụ OTP, hóa đơn)
export const mailTransporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: process.env.MAIL_SECURE === 'true', // true cho port 465, false cho các port khác
  auth: {
    user: process.env.MAIL_USER || 'your_email@gmail.com',
    pass: process.env.MAIL_PASS || 'your_email_app_password',
  },
});

/**
 * Hàm gửi email mẫu hỗ trợ hệ thống gửi OTP hoặc thông báo đơn hàng
 */
export const sendMail = async (to: string, subject: string, htmlContent: string): Promise<boolean> => {
  try {
    const info = await mailTransporter.sendMail({
      from: `"GrabFood Mini" <${process.env.MAIL_USER || 'no-reply@grabfoodmini.com'}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`✉️ Email đã được gửi thành công tới: ${to} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('❌ Gặp lỗi khi gửi email:', error);
    return false;
  }
};
