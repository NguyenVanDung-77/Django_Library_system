import axios from 'axios';

// API Gateway URL - Single entry point for all services
const GATEWAY_URL = 'http://127.0.0.1:8000/api';

// Base URLs cho các service (fallback nếu Gateway không hoạt động)
const BASE_URLS = {
  user: 'http://127.0.0.1:8001/api',
  book: 'http://127.0.0.1:8002/api', 
  borrow: 'http://127.0.0.1:8003/api'
};

// Tạo axios instances - sử dụng Gateway làm entry point chính
const createApiInstance = (servicePath) => {
  const instance = axios.create({
    baseURL: `${GATEWAY_URL}/${servicePath}`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor để thêm token vào header
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor để xử lý response và error
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token hết hạn
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const userApi = createApiInstance('users');
export const bookApi = createApiInstance('books');
export const borrowApi = createApiInstance('borrows');

// Export base URLs for reference
export { BASE_URLS };