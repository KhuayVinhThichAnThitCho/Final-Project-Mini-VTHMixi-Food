import { z } from 'zod';

/**
 * Schema validate dữ liệu đăng ký tài khoản mới
 */
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Tên người dùng là bắt buộc.' })
    .min(2, 'Tên người dùng phải có ít nhất 2 ký tự.')
    .max(50, 'Tên người dùng không được vượt quá 50 ký tự.'),
  email: z
    .string({ required_error: 'Email là bắt buộc.' })
    .email('Định dạng email không hợp lệ.'),
  password: z
    .string({ required_error: 'Mật khẩu là bắt buộc.' })
    .min(6, 'Mật khẩu phải chứa ít nhất 6 ký tự.'),
  role: z
    .enum(['USER', 'VENDOR', 'MANAGER', 'ADMIN'] as const)
    .optional()
    .default('USER'),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'Số điện thoại phải chứa đúng 10 số.')
    .optional(),
});

/**
 * Schema validate dữ liệu đăng nhập tài khoản
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email là bắt buộc.' })
    .email('Định dạng email không hợp lệ.'),
  password: z
    .string({ required_error: 'Mật khẩu là bắt buộc.' })
    .min(6, 'Mật khẩu phải chứa ít nhất 6 ký tự.'),
});
