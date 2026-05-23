import axios from 'axios';

// Tạo một instance axios chung cho dự án
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor chèn thêm JWT token vào mỗi request gửi đi nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý phản hồi lỗi từ server
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Trả về lỗi có cấu trúc từ backend
    const customError = error.response?.data || {
      success: false,
      errorCode: 'INTERNAL_ERROR',
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.',
    };
    return Promise.reject(customError);
  }
);

export default api;
