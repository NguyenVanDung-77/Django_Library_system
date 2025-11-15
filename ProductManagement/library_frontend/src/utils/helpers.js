// Định dạng ngày tháng
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Định dạng datetime
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Tính số ngày từ một ngày đến hiện tại
export const daysSince = (dateString) => {
  if (!dateString) return 0;
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Kiểm tra sách có quá hạn không
export const isOverdue = (dueDateString) => {
  if (!dueDateString) return false;
  
  const dueDate = new Date(dueDateString);
  const now = new Date();
  return now > dueDate;
};

// Tính ngày đến hạn (thêm số ngày từ ngày hiện tại)
export const calculateDueDate = (days = 14) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0]; // Trả về format YYYY-MM-DD
};

// Validation email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation password (ít nhất 6 ký tự)
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Validation required field
export const isRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Format error messages
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.detail) {
    return error.detail;
  }
  
  // Xử lý lỗi validation từ Django
  if (typeof error === 'object') {
    const messages = [];
    for (const [field, fieldErrors] of Object.entries(error)) {
      if (Array.isArray(fieldErrors)) {
        messages.push(`${field}: ${fieldErrors.join(', ')}`);
      } else {
        messages.push(`${field}: ${fieldErrors}`);
      }
    }
    return messages.join('; ');
  }
  
  return 'Có lỗi xảy ra, vui lòng thử lại';
};

// Debounce function cho search
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};