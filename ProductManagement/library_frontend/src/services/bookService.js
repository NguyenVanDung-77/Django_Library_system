import { bookApi } from './api';

class BookService {
  // Lấy danh sách tất cả sách
  async getBooks() {
    try {
      const response = await bookApi.get('/');
      return response.data.data || response.data; // Handle nested data format
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Tìm kiếm sách (sử dụng endpoint chính với query params)
  async searchBooks(params) {
    try {
      const response = await bookApi.get('/', { params });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Lấy thông tin chi tiết 1 cuốn sách
  async getBook(bookId) {
    try {
      const response = await bookApi.get(`/${bookId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Thêm sách mới (dành cho admin)
  async createBook(bookData) {
    try {
      console.log('📡 BookService: Sending data to API:', bookData);
      const response = await bookApi.post('/create/', bookData);
      console.log('✅ BookService: API response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ BookService: API error:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      throw error.response?.data || error.message;
    }
  }

  // Cập nhật thông tin sách
  async updateBook(bookId, bookData) {
    try {
      const response = await bookApi.put(`/${bookId}/update/`, bookData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Xóa sách
  async deleteBook(bookId) {
    try {
      await bookApi.delete(`/${bookId}/delete/`);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Kiểm tra tình trạng sách có sẵn
  async checkAvailability(bookId) {
    try {
      const response = await bookApi.get(`/${bookId}/availability/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Cập nhật số lượng sách
  async updateAvailability(bookId, quantity) {
    try {
      const response = await bookApi.put(`/${bookId}/availability/`, {
        available_copies: quantity
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

const bookService = new BookService();

// Add alias methods for compatibility
bookService.addBook = bookService.createBook;
bookService.getBookById = bookService.getBook;

export default bookService;