import { userApi } from './api';

class AuthService {
  // Đăng ký người dùng mới
  async register(userData) {
    try {
      const response = await userApi.post('/register/', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Đăng nhập
  async login(credentials) {
    try {
      const response = await userApi.post('/login/', credentials);
      const { token, user } = response.data.data; // Backend trả về nested trong data
      
      // Lưu token và thông tin user vào localStorage
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_info', JSON.stringify(user));
      
      return { access: token, user }; // Trả về format mà AuthContext expect
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Đăng xuất
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }

  // Refresh token (backend không hỗ trợ refresh token)
  async refreshToken() {
    try {
      // Backend hiện tại không có refresh token, logout user
      this.logout();
      throw new Error('Token expired, please login again');
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  // Lấy danh sách tất cả users (dành cho admin)
  async getUsers() {
    try {
      const response = await userApi.get('/list/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Cập nhật thông tin user
  async updateUser(userId, userData) {
    try {
      const response = await userApi.put(`/${userId}/update/`, userData);
      const updatedUser = response.data.data || response.data;
      
      // Cập nhật thông tin trong localStorage nếu là user hiện tại
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem('user_info', JSON.stringify(updatedUser));
      }
      
      return updatedUser;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Xóa user
  async deleteUser(userId) {
    try {
      const response = await userApi.delete(`/${userId}/delete/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

const authService = new AuthService();
export default authService;