import { borrowApi } from './api';

class BorrowService {
  // Mượn sách
  async borrowBook(borrowData) {
    try {
      const response = await borrowApi.post('/borrow/', borrowData);
      return response.data.data || response.data; // Handle nested response
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Trả sách
  async returnBook(recordId) {
    try {
      const response = await borrowApi.post(`/return/${recordId}/`);
      return response.data.data || response.data; // Handle nested response
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Lấy lịch sử mượn sách của user hiện tại
  async getUserBorrowHistory() {
    try {
      const response = await borrowApi.get('/history/');
      return response.data.data || response.data; // Handle nested data format
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Lấy danh sách tất cả bản ghi mượn (dành cho admin)
  async getAllBorrowRecords() {
    try {
      const response = await borrowApi.get('/all-records/');
      return response.data.data || response.data; // Handle nested data format
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Lấy thông tin chi tiết 1 bản ghi mượn
  async getBorrowRecord(recordId) {
    try {
      const response = await borrowApi.get(`/records/${recordId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Gia hạn sách (nếu có tính năng này)
  async extendBorrow(recordId, extendDays) {
    try {
      const response = await borrowApi.put(`/extend/${recordId}/`, {
        extend_days: extendDays
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Lấy sách đang mượn của user hiện tại (dùng history rồi filter)
  async getCurrentBorrows() {
    try {
      const response = await borrowApi.get('/history/');
      const allRecords = response.data.data || response.data;
      // Ensure it's an array and filter only borrowed books (not returned)
      const recordsArray = Array.isArray(allRecords) ? allRecords : [];
      return recordsArray.filter(record => record.status === 'borrowed');
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Kiểm tra sách quá hạn
  async getOverdueBooks() {
    try {
      const response = await borrowApi.get('/overdue/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Tính phí phạt (nếu có)
  async calculateFine(recordId) {
    try {
      const response = await borrowApi.get(`/fine/${recordId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

const borrowService = new BorrowService();
export default borrowService;