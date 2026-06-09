import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FormField from '../../components/molecules/FormField';
import Button from '../../components/atoms/Button';
import SaigonDivider from '../../components/molecules/SaigonDivider';
import { UserPlus, Key, ArrowLeft, RefreshCw } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { authApi } from '../../services/authApi';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoadingRegister, verifyOtp, isLoadingVerifyOtp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Bộ đếm ngược cho việc gửi lại OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Vui lòng điền đầy đủ tất cả các trường thông tin.');
      return;
    }
    setError('');
    setInfoMsg('');

    register(
      { name, email, passwordString: password, role: 'user' },
      {
        onSuccess: (res: any) => {
          if (res.requiresOtp) {
            setRequiresOtp(true);
            setInfoMsg(res.message || 'Mã xác thực OTP đã được gửi đến email đăng ký của bạn.');
            setCountdown(60);
          } else {
            const user = res.data.user;
            alert(`Chúc mừng ${user.name} đã đăng ký tài khoản thành công!`);
            const role = user.role.toLowerCase();
            if (role === 'admin') {
              navigate('/admin/dashboard');
            } else if (role === 'vendor') {
              navigate('/vendor/dashboard');
            } else {
              navigate('/');
            }
          }
        },
        onError: (err: any) => {
          setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        },
      }
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Vui lòng nhập mã xác thực OTP.');
      return;
    }
    setError('');
    setInfoMsg('');

    verifyOtp(
      { email, otp },
      {
        onSuccess: (res: any) => {
          const user = res.data.user;
          alert(`Chúc mừng ${user.name} đã đăng ký tài khoản thành công!`);
          const role = user.role.toLowerCase();
          if (role === 'admin') {
            navigate('/admin/dashboard');
          } else if (role === 'vendor') {
            navigate('/vendor/dashboard');
          } else {
            navigate('/');
          }
        },
        onError: (err: any) => {
          setError(err.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn.');
        },
      }
    );
  };

  const handleBackToRegister = () => {
    setRequiresOtp(false);
    setOtp('');
    setError('');
    setInfoMsg('');
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setError('');
    setInfoMsg('');
    try {
      await authApi.resendOtp(email);
      setInfoMsg('Một mã OTP mới đã được gửi tới email đăng ký của bạn.');
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="texture-paper min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="card-retro max-w-md w-full bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-grid-pattern opacity-10 pointer-events-none"></div>

        <div className="text-center mb-6">
          <span className="bg-primary-600 text-white text-xs font-serif font-black px-2 py-0.5 border border-neutral-900 rotate-[-3deg] inline-block mb-3">
            {requiresOtp ? 'XÁC THỰC ĐĂNG KÝ' : 'ĐĂNG KÝ'}
          </span>
          <h2 className="text-3xl font-black text-neutral-900 leading-tight">
            {requiresOtp ? 'XÁC MINH EMAIL' : 'MỞ SỔ THÀNH VIÊN'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1 font-body">
            {requiresOtp ? `Mã xác thực đã được gửi về email ${email}` : 'Gia nhập phố ẩm thực để nhận ưu đãi ngập tràn.'}
          </p>
        </div>

        {error && (
          <div className="border-2 border-primary-600 bg-[#BF3A20]/5 p-3 text-xs font-mono font-bold text-primary-600 mb-4">
            ⚠️ {error}
          </div>
        )}

        {infoMsg && (
          <div className="border-2 border-green-700 bg-green-50 p-3 text-xs font-mono font-bold text-green-700 mb-4">
            ℹ️ {infoMsg}
          </div>
        )}

        {/* Form Đăng ký / Xác thực OTP */}
        {requiresOtp ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <FormField
              label="Nhập mã xác thực OTP (6 chữ số)"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isLoadingVerifyOtp}
            />

            <div className="flex items-center justify-between text-xs font-semibold">
              <button
                type="button"
                onClick={handleBackToRegister}
                className="text-neutral-500 hover:text-neutral-700 flex items-center gap-1"
                disabled={isLoadingVerifyOtp}
              >
                <ArrowLeft size={14} /> Quay lại đăng ký
              </button>
              
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || isResending || isLoadingVerifyOtp}
                className={`flex items-center gap-1 ${
                  countdown > 0 ? 'text-neutral-400 cursor-not-allowed' : 'text-primary-600 hover:underline'
                }`}
              >
                <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} />
                {countdown > 0 ? `Gửi lại mã (${countdown}s)` : 'Gửi lại mã'}
              </button>
            </div>

            <Button
              type="submit"
              variant="retro-primary"
              className="w-full flex items-center justify-center gap-2 mt-6 py-2.5 bg-primary-600 text-white"
              disabled={isLoadingVerifyOtp}
            >
              <Key size={16} />
              {isLoadingVerifyOtp ? 'Đang xác thực...' : 'Xác nhận mã OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <FormField
              label="Họ và tên của bạn"
              type="text"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoadingRegister}
            />

            <FormField
              label="Địa chỉ thư điện tử (Email)"
              type="email"
              placeholder="tenbancu@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoadingRegister}
            />

            <FormField
              label="Mật khẩu bảo vệ (Tối thiểu 6 ký tự)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoadingRegister}
            />

            <Button
              type="submit"
              variant="retro-primary"
              className="w-full flex items-center justify-center gap-2 mt-6 py-2.5 bg-primary-600 text-white"
              disabled={isLoadingRegister}
            >
              <UserPlus size={16} />
              {isLoadingRegister ? 'Đang gửi thông tin...' : 'Đăng ký tài khoản'}
            </Button>
          </form>
        )}

        <SaigonDivider text="hoặc nếu bạn đã mở sổ" />

        <div className="text-center text-xs">
          <p className="text-neutral-500 font-body">
            Đã là thành viên?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:underline">
              Đăng nhập tại đây
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
