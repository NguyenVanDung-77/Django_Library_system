-- Tạo database
CREATE DATABASE IF NOT EXISTS library_soa_db;
USE library_soa_db;

-- Bảng users (User Service)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('admin', 'librarian', 'reader') DEFAULT 'reader',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng books (Book Service)  
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    isbn VARCHAR(13) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    publisher VARCHAR(100) NOT NULL,
    publication_year INT NOT NULL,
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng borrow_records (Borrow Service)
CREATE TABLE IF NOT EXISTS borrow_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    borrow_date DATETIME NOT NULL,
    due_date DATETIME NOT NULL,
    return_date DATETIME NULL,
    status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Dữ liệu mẫu
-- Admin user (password: admin123)
INSERT INTO users (username, email, password, first_name, last_name, role) VALUES 
('admin', 'admin@library.com', 'pbkdf2_sha256$720000$admin123hash', 'Admin', 'User', 'admin'),
('librarian1', 'librarian@library.com', 'pbkdf2_sha256$720000$lib123hash', 'Librarian', 'One', 'librarian'),
('reader1', 'reader1@library.com', 'pbkdf2_sha256$720000$read123hash', 'Reader', 'One', 'reader');

-- Sách mẫu
INSERT INTO books (title, author, isbn, category, publisher, publication_year, total_copies, available_copies, description) VALUES
('Lập trình Python cơ bản', 'Nguyễn Văn A', '9781234567890', 'Programming', 'NXB Thông tin', 2023, 5, 5, 'Sách hướng dẫn lập trình Python cho người mới bắt đầu'),
('Cấu trúc dữ liệu và thuật toán', 'Trần Thị B', '9781234567891', 'Computer Science', 'NXB Giáo dục', 2022, 3, 3, 'Giải thích chi tiết về cấu trúc dữ liệu và thuật toán'),
('Kiến trúc phần mềm hiện đại', 'Lê Văn C', '9781234567892', 'Software Engineering', 'NXB Khoa học', 2024, 2, 2, 'Các mô hình kiến trúc phần mềm hiện đại');

-- Indexes để tăng performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_borrow_user_id ON borrow_records(user_id);
CREATE INDEX idx_borrow_book_id ON borrow_records(book_id);
CREATE INDEX idx_borrow_status ON borrow_records(status);