import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, ShieldCheck, Mail, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import authApi from '../../services/authApi';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Điền email để nhận OTP, Step 2: Nhập OTP + mật khẩu mới
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Gửi yêu cầu nhận mã OTP về email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng điền địa chỉ thư điện tử của bạn.');
      return;
    }
    
    setError('');
    setInfoMsg('');
    setLoading(true);
    
    try {
      // Gọi API gửi OTP thực tế của backend
      const res = await authApi.forgotPassword(email);
      setInfoMsg(res.message || 'Mã xác thực OTP đã được gửi đến hòm thư của bạn (Mã mặc định: 123456).');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Gửi yêu cầu thất bại. Vui lòng kiểm tra lại địa chỉ Email.');
    } finally {
      setLoading(false);
    }
  };

  // Đặt lại mật khẩu mới với mã OTP thực tế
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Vui lòng nhập mã xác thực OTP.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập mật khẩu mới và xác nhận mật khẩu.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải chứa ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    setError('');
    setInfoMsg('');
    setLoading(true);

    try {
      // Gọi API reset mật khẩu thực tế của backend
      await authApi.resetPassword({
        email,
        otp,
        newPassword,
      });

      setInfoMsg('Thay đổi mật khẩu thành công! Bạn đang được chuyển hướng về trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  // Quay lại bước nhập Email
  const handleBackToRequest = () => {
    setStep(1);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setInfoMsg('');
  };

  return (
    <div className="texture-paper min-h-screen flex flex-col items-center justify-center bg-[#FAF7F3] px-4 py-12 relative">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-grid-pattern opacity-5 pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#FEFCF9] rounded-lg shadow-saigon-lg border border-[#E8D8C6] p-8 relative z-10">
        
        {/* Header trang trí phong cách Sài Gòn xưa */}
        <div className="text-center mb-8 relative">
          <div className="inline-block bg-[#BF3A20] text-[#FEFCF9] text-xs font-mono font-bold px-3 py-1 border border-[#2C1A0E] rotate-[-2deg] mb-3 shadow-[2px_2px_0px_#2C1A0E]">
            {step === 2 ? 'THIẾT LẬP LẠI MẬT KHẨU' : 'KHÔI PHỤC MẬT KHẨU'}
          </div>
          <h2 className="text-3xl font-black text-[#2C1A0E] tracking-tight font-heading leading-none mt-1 uppercase">
            {step === 2 ? 'MẬT MÃ MỚI' : 'TÌM LẠI KHÓA'}
          </h2>
          <div className="h-[2px] w-16 bg-[#BF3A20] mx-auto my-3 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#C98F0A]"></div>
          </div>
          <p className="text-xs text-[#7A5235] font-body leading-relaxed max-w-xs mx-auto">
            {step === 2 
              ? `Nhập mã xác thực OTP gửi về ${email} và mật khẩu mới.` 
              : 'Nhập địa chỉ thư điện tử của bạn để nhận mã xác thực OTP khôi phục khóa bảo mật.'}
          </p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="border border-[#BF3A20] bg-[#BF3A20]/5 p-3 text-xs font-body font-medium text-[#BF3A20] mb-5 rounded flex items-start gap-2 animate-pulse">
            <span className="shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Thông báo thành công / Thông tin */}
        {infoMsg && (
          <div className="border border-green-700 bg-green-50 p-3 text-xs font-body font-medium text-green-700 mb-5 rounded flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-green-700 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* TRẠNG THÁI 1: YÊU CẦU GỬI OTP */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-[#2C1A0E] tracking-wider uppercase font-body">
                Địa chỉ thư điện tử (Email)
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="tenbancu@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F0E9DE] border border-[#E8D8C6] text-[#2C1A0E] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#7A5235] transition duration-150 font-body placeholder-[#B8906E]/70"
                  disabled={loading}
                  required
                />
                <Mail className="absolute left-3.5 top-3.5 text-[#7A5235]" size={16} />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#BF3A20] hover:bg-[#A6301A] active:bg-[#8C2915] text-[#FEFCF9] font-body font-semibold py-3 px-4 rounded tracking-wider transition duration-150 shadow-[0_2px_4px_rgba(191,58,32,0.15)] flex items-center justify-center gap-2 text-sm uppercase"
              disabled={loading}
            >
              <KeyRound size={16} />
              {loading ? 'ĐANG GỬI...' : 'GỬI MÃ XÁC NHẬN OTP'}
            </button>
          </form>
        )}

        {/* TRẠNG THÁI 2: ĐẶT LẠI MẬT KHẨU MỚI BẰNG OTP */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* Mã xác thực OTP */}
            <div className="space-y-1.5">
              <label htmlFor="otp" className="block text-xs font-bold text-[#2C1A0E] tracking-wider uppercase font-body">
                Mã xác thực OTP (6 chữ số)
              </label>
              <div className="relative">
                <input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-[#F0E9DE] border border-[#E8D8C6] text-[#2C1A0E] tracking-widest text-center font-mono text-lg font-bold rounded px-4 py-2.5 focus:outline-none focus:border-[#7A5235] transition duration-150 placeholder-[#B8906E]/40"
                  disabled={loading}
                  required
                />
                <Lock className="absolute left-3.5 top-3.5 text-[#7A5235]" size={16} />
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="block text-xs font-bold text-[#2C1A0E] tracking-wider uppercase font-body">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#F0E9DE] border border-[#E8D8C6] text-[#2C1A0E] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#7A5235] transition duration-150 font-body placeholder-[#B8906E]/70"
                  disabled={loading}
                  required
                />
                <ShieldCheck className="absolute left-3.5 top-3.5 text-[#7A5235]" size={16} />
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#2C1A0E] tracking-wider uppercase font-body">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#F0E9DE] border border-[#E8D8C6] text-[#2C1A0E] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#7A5235] transition duration-150 font-body placeholder-[#B8906E]/70"
                  disabled={loading}
                  required
                />
                <ShieldCheck className="absolute left-3.5 top-3.5 text-[#7A5235]" size={16} />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#BF3A20] hover:bg-[#A6301A] active:bg-[#8C2915] text-[#FEFCF9] font-body font-semibold py-3 px-4 rounded tracking-wider transition duration-150 shadow-[0_2px_4px_rgba(191,58,32,0.15)] flex items-center justify-center gap-2 text-sm uppercase"
              disabled={loading}
            >
              <KeyRound size={16} />
              {loading ? 'ĐANG CẬP NHẬT...' : 'XÁC NHẬN MẬT KHẨU MỚI'}
            </button>

            <button
              type="button"
              onClick={handleBackToRequest}
              className="w-full border border-[#D0B89A] hover:bg-[#F5EFE6] text-[#7A5235] font-body font-semibold py-2.5 px-4 rounded text-xs transition duration-150 text-center"
              disabled={loading}
            >
              Quay lại nhập Email
            </button>
          </form>
        )}

        {/* Dải phân cách mờ dần Saigon */}
        <div className="my-6 flex items-center justify-center">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#E8D8C6] to-transparent"></div>
        </div>

        {/* Nút Quay lại Đăng nhập */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A5235] hover:text-[#5C3A22] transition duration-150 group font-body uppercase tracking-wider"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Quay lại Đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
