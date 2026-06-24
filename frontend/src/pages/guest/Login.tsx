import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import FormField from '../../components/molecules/FormField';
import Button from '../../components/atoms/Button';
import SaigonDivider from '../../components/molecules/SaigonDivider';
import { LogIn, Key, ArrowLeft, RefreshCw } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { authApi } from '../../services/authApi';
import { useAuthStore } from '../../store/useAuthStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoadingLogin, verifyOtp, isLoadingVerifyOtp } = useAuth();
  const { setUser, setTokens } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isOauthLoading, setIsOauthLoading] = useState(false);
  const oauthProcessed = React.useRef(false);

  // Xử lý callback OAuth 2.0 từ Google & Facebook
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && !oauthProcessed.current) {
      oauthProcessed.current = true; // Ngăn chặn việc chạy 2 lần đồng thời (do React StrictMode)
      
      setIsOauthLoading(true);
      setError('');
      setInfoMsg('Đang đăng nhập bằng tài khoản liên kết...');

      const redirectUri = window.location.origin + window.location.pathname;

      if (state === 'facebook') {
        authApi.loginWithFacebook(code, redirectUri)
          .then((res: any) => {
            const authData = res.data;
            setUser(authData.user);
            setTokens(authData.accessToken, authData.refreshToken);
            
            // Xử lý chuyển hướng
            const role = authData.user.role.toLowerCase();
            const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
            sessionStorage.removeItem('redirectAfterLogin');
            if (savedRedirect && savedRedirect !== '/login') {
              navigate(savedRedirect);
            } else if (role === 'admin') {
              navigate('/admin/dashboard');
            } else if (role === 'vendor') {
              navigate('/vendor/dashboard');
            } else if (role === 'shipper') {
              navigate('/shipper/dashboard');
            } else {
              navigate('/');
            }
          })
          .catch((err: any) => {
            setError(err.message || 'Đăng nhập bằng Facebook thất bại. Vui lòng thử lại.');
            setInfoMsg('');
            setIsOauthLoading(false);
            navigate('/login', { replace: true }); // Chỉ xóa URL params khi lỗi để người dùng thử lại
          });
      } else {
        authApi.loginWithGoogle(code, redirectUri)
          .then((res: any) => {
            const authData = res.data;
            setUser(authData.user);
            setTokens(authData.accessToken, authData.refreshToken);
            
            // Xử lý chuyển hướng
            const role = authData.user.role.toLowerCase();
            const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
            sessionStorage.removeItem('redirectAfterLogin');
            if (savedRedirect && savedRedirect !== '/login') {
              navigate(savedRedirect);
            } else if (role === 'admin') {
              navigate('/admin/dashboard');
            } else if (role === 'vendor') {
              navigate('/vendor/dashboard');
            } else if (role === 'shipper') {
              navigate('/shipper/dashboard');
            } else {
              navigate('/');
            }
          })
          .catch((err: any) => {
            setError(err.message || 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
            setInfoMsg('');
            setIsOauthLoading(false);
            navigate('/login', { replace: true }); // Chỉ xóa URL params khi lỗi để người dùng thử lại
          });
      }
    }
  }, [location.search, navigate, setUser, setTokens]);

  const handleGoogleLogin = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
    const redirectUri = window.location.origin + '/login';
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20email%20profile`;
    window.location.href = oauthUrl;
  };

  const handleFacebookLogin = () => {
    const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID || 'your-facebook-app-id';
    const redirectUri = window.location.origin + '/login';
    const oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=facebook&scope=email,public_profile`;
    window.location.href = oauthUrl;
  };

  // Lấy thông điệp và trang nguồn từ state khi bị redirect (ví dụ từ giỏ hàng)
  const redirectFrom: string = (location.state as any)?.from || '/';
  const redirectMessage: string = (location.state as any)?.message || '';

  // Bộ đếm ngược cho việc gửi lại OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }
    setError('');
    setInfoMsg('');
    
    login(
      { email, passwordString: password },
      {
        onSuccess: (res: any) => {
          if (res.requiresOtp) {
            setRequiresOtp(true);
            setInfoMsg(res.message || 'Mã xác thực OTP đã được gửi đến email của bạn.');
            setCountdown(60);
          } else {
            const user = res.data.user;
            const role = user.role.toLowerCase();
            // Sau khi login, redirect về trang đã lưu (nếu có) hoặc về dashboard theo role
            const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
            sessionStorage.removeItem('redirectAfterLogin');
            if (savedRedirect && savedRedirect !== '/login') {
              navigate(savedRedirect);
            } else if (role === 'admin') {
              navigate('/admin/dashboard');
            } else if (role === 'vendor') {
              navigate('/vendor/dashboard');
            } else if (role === 'shipper') {
              navigate('/shipper/dashboard');
            } else {
              navigate(redirectFrom !== '/login' ? redirectFrom : '/');
            }
          }
        },
        onError: (err: any) => {
          setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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
          const role = user.role.toLowerCase();
          const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
          sessionStorage.removeItem('redirectAfterLogin');
          if (savedRedirect && savedRedirect !== '/login') {
            navigate(savedRedirect);
          } else if (role === 'admin') {
            navigate('/admin/dashboard');
          } else if (role === 'vendor') {
            navigate('/vendor/dashboard');
          } else if (role === 'shipper') {
            navigate('/shipper/dashboard');
          } else {
            navigate(redirectFrom !== '/login' ? redirectFrom : '/');
          }
        },
        onError: (err: any) => {
          setError(err.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn.');
        },
      }
    );
  };

  const handleBackToLogin = () => {
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
      setInfoMsg('Một mã OTP mới đã được gửi tới email của bạn.');
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
        
        {/* Header Form */}
        <div className="text-center mb-6">
          <span className="bg-primary-600 text-white text-xs font-serif font-black px-2 py-0.5 border border-neutral-900 rotate-[-3deg] inline-block mb-3">
            {requiresOtp ? 'XÁC THỰC OTP' : 'ĐĂNG NHẬP'}
          </span>
          <h2 className="text-3xl font-black text-neutral-900 leading-tight">
            {requiresOtp ? 'XÁC MINH DANH TÍNH' : 'QUAY LẠI GÓC PHỐ CŨ'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1 font-body">
            {requiresOtp ? `Mã xác thực đã được gửi về email ${email}` : 'Đặt món ngon Sài Gòn, giao nhanh tận cửa.'}
          </p>
        </div>

        {/* Banner thông báo khi bị redirect từ trang khác (ví dụ: giỏ hàng) */}
        {redirectMessage && (
          <div className="border-2 border-amber-500 bg-amber-50 p-3 text-xs font-mono font-bold text-amber-800 mb-4 flex items-center gap-2">
            🛵 {redirectMessage}
          </div>
        )}

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

        {/* Form Đăng Nhập / Xác thực OTP */}
        {requiresOtp ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <FormField
              label="Nhập mã xác thực OTP (6 chữ số)"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isLoadingVerifyOtp || isOauthLoading}
            />

            <div className="flex items-center justify-between text-xs font-semibold">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-neutral-500 hover:text-neutral-700 flex items-center gap-1"
                disabled={isLoadingVerifyOtp || isOauthLoading}
              >
                <ArrowLeft size={14} /> Quay lại đăng nhập
              </button>
              
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || isResending || isLoadingVerifyOtp || isOauthLoading}
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
              disabled={isLoadingVerifyOtp || isOauthLoading}
            >
              <Key size={16} />
              {isLoadingVerifyOtp ? 'Đang xác thực...' : 'Xác nhận mã OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Địa chỉ thư điện tử (Email)"
              type="email"
              placeholder="tenbancu@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoadingLogin || isOauthLoading}
            />

            <FormField
              label="Mật khẩu bảo mật"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoadingLogin || isOauthLoading}
            />

            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="border-2 border-neutral-900 rounded-sm accent-primary-600 bg-neutral-50" 
                  disabled={isLoadingLogin || isOauthLoading} 
                />
                <span>Ghi nhớ tôi</span>
              </label>
              <Link to="/forgot-password" className="text-primary-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              variant="retro-primary"
              className="w-full flex items-center justify-center gap-2 mt-6 py-2.5 bg-primary-600 text-white"
              disabled={isLoadingLogin || isOauthLoading}
            >
              <LogIn size={16} />
              {isLoadingLogin || isOauthLoading ? 'Đang mở cửa quán...' : 'Bước vào quán ăn'}
            </Button>
          </form>
        )}

        {/* Nút đăng nhập Google & Facebook */}
        {!requiresOtp && (
          <>
            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300"></div>
              </div>
              <span className="relative px-3 bg-white text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">
                Hoặc đăng nhập nhanh bằng
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoadingLogin || isOauthLoading}
                className="flex items-center justify-center px-4 py-2 border-2 border-neutral-900 bg-white hover:bg-neutral-50 text-neutral-900 font-bold shadow-retro-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#2C1A0E] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 text-[11px] font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              
              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={isLoadingLogin || isOauthLoading}
                className="flex items-center justify-center px-4 py-2 border-2 border-neutral-900 bg-white hover:bg-neutral-50 text-neutral-900 font-bold shadow-retro-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#2C1A0E] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 text-[11px] font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
                Facebook
              </button>
            </div>
          </>
        )}

        <SaigonDivider text="hoặc nếu bạn là khách mới" />

        <div className="text-center text-xs">
          <p className="text-neutral-500 font-body">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-primary-600 hover:underline">
              Đăng ký thành viên mới
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
