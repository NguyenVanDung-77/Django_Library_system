# 🚀 HƯỚNG DẪN KHỞI ĐỘNG NHANH

## ⚡ Khởi động 1-Click (Khuyến nghị)

### 🖥️ **Backend Services**
```powershell
# Mở PowerShell tại thư mục project
cd D:\dung_soa\ProductManagement

# Chạy tất cả backend services (API Gateway + 3 services)
.\start_services.ps1
```

**✅ Services sẽ chạy trên:**
- 🌐 **API Gateway:** http://127.0.0.1:8000  
- 👤 **User Service:** http://127.0.0.1:8001
- 📚 **Book Service:** http://127.0.0.1:8002
- 📋 **Borrow Service:** http://127.0.0.1:8003

### 🌐 **Frontend React App**
```powershell
# Mở PowerShell thứ 2
cd D:\dung_soa\ProductManagement\library_frontend

# Chạy frontend development server
npm start
```

**✅ Frontend sẽ chạy trên:** http://localhost:3000

---

## 🔧 Setup lần đầu (First Time Only)

### 1️⃣ **Chuẩn bị môi trường**
```powershell
# Cho phép chạy PowerShell scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Cài đặt Python dependencies
pip install -r requirements.txt

# Cài đặt Node.js dependencies
cd library_frontend
npm install
cd ..
```

### 2️⃣ **Setup Database**
```sql
# Mở MySQL và tạo database
mysql -u root -p
> CREATE DATABASE library_soa_db;
> exit

# Import sample data
mysql -u root -p library_soa_db < database_setup.sql
```

### 3️⃣ **Cấu hình Environment**
```powershell
# Copy và edit .env file
cp .env.example .env

# Chỉnh sửa database config trong .env
```

---

## 🛠️ Khởi động Manual (Nếu cần)

### **Backend Services (4 terminals riêng biệt):**

#### Terminal 1 - API Gateway:
```powershell
cd D:\dung_soa\ProductManagement\library_soa\api_gateway
python manage.py runserver 8000
```

#### Terminal 2 - User Service:
```powershell
cd D:\dung_soa\ProductManagement\library_soa\user_service  
python manage.py runserver 8001
```

#### Terminal 3 - Book Service:
```powershell
cd D:\dung_soa\ProductManagement\library_soa\book_service
python manage.py runserver 8002
```

#### Terminal 4 - Borrow Service:
```powershell
cd D:\dung_soa\ProductManagement\library_soa\borrow_service
python manage.py runserver 8003
```

#### Terminal 5 - Frontend:
```powershell
cd D:\dung_soa\ProductManagement\library_frontend
npm start
```

---

## 🌐 Access URLs

### **🎯 Main Application:**
- **Frontend:** http://localhost:3000
- **API Gateway:** http://127.0.0.1:8000

### **🔧 Individual Services (for debugging):**
- **User Service:** http://127.0.0.1:8001
- **Book Service:** http://127.0.0.1:8002  
- **Borrow Service:** http://127.0.0.1:8003

---

## 👤 Default Login Accounts

### **👑 Admin Account:**
```
Username: superadmin
Password: password123
```
**Permissions:** Full system access, user management, book management

### **📖 Reader Account:**
```
Username: reader1  
Password: reader123
```
**Permissions:** Browse books, borrow/return, view personal history

---

## 🚨 Troubleshooting

### **❌ "Port already in use" Error:**
```powershell
# Kill processes using ports 8000-8003
netstat -ano | findstr "8000 8001 8002 8003"
taskkill /PID <process_id> /F
```

### **❌ Database Connection Error:**
- ✅ Check MySQL service is running
- ✅ Verify credentials in `.env` file  
- ✅ Ensure database `library_soa_db` exists

### **❌ Frontend not loading:**
- ✅ Ensure backend services started first
- ✅ Check API Gateway is running on port 8000
- ✅ Clear browser cache and reload

### **❌ PowerShell script blocked:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📊 Service Status Check

### **Quick Health Check:**
```powershell
# Test all services via API Gateway
curl http://127.0.0.1:8000/api/books/
curl http://127.0.0.1:8000/api/users/
```

### **Individual Service Check:**
```powershell  
curl http://127.0.0.1:8001/api/users/
curl http://127.0.0.1:8002/api/books/
curl http://127.0.0.1:8003/api/borrows/
```

---

## 🎯 Next Steps

1. **📱 Open Frontend:** http://localhost:3000
2. **🔑 Login** with admin or reader account  
3. **📚 Browse Books** and test borrowing functionality
4. **🔗 Test APIs** using Postman collection
5. **📊 Check Admin Dashboard** for system statistics

---

**🚀 Your SOA Library Management System is ready to use!**
- **User Service API**: http://localhost:8001/api
- **Book Service API**: http://localhost:8002/api  
- **Borrow Service API**: http://localhost:8003/api

## 📝 Tài khoản test:

| Username | Password | Role |
|----------|----------|------|
| user1 | password123 | User |
| user2 | password123 | User |

## ✅ Kiểm tra hệ thống hoạt động:

1. **Backend APIs**: Truy cập các URL API để kiểm tra
2. **Frontend**: Mở http://localhost:3000
3. **Login**: Sử dụng tài khoản test để đăng nhập
4. **Features**: Test các tính năng mượn/trả sách

## ❌ Troubleshooting:

### Lỗi "Port already in use":
```powershell
# Tìm process đang sử dụng port
netstat -ano | findstr :8001
# Kill process
taskkill /PID <PID_NUMBER> /F
```

### Lỗi "Module not found":
```powershell
# Cài đặt lại dependencies
pip install -r requirements.txt
cd library_frontend
npm install
```

### Lỗi database connection:
- Đảm bảo XAMPP MySQL đang chạy
- Kiểm tra file database_setup.sql đã được import
- Xác nhận cấu hình database trong settings.py

## 🎯 Workflow sử dụng:

1. ✅ **Khởi động** tất cả services
2. 🌐 **Truy cập** http://localhost:3000  
3. 📝 **Đăng ký** tài khoản mới hoặc đăng nhập
4. 📊 **Xem Dashboard** với thống kê
5. 📚 **Browse sách** trong Books page
6. 📖 **Mượn sách** bằng nút "Mượn sách"
7. 📋 **Quản lý** sách đã mượn trong "My Borrows"
8. ↩️ **Trả sách** khi hoàn thành