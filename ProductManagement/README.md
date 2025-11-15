# 🏛️ HỆ THỐNG QUẢN LÝ THƯ VIỆN SOA

## 📖 Tổng quan

Hệ thống quản lý thư viện được xây dựng theo kiến trúc **Service-Oriented Architecture (SOA)** với **Django Backend**, **React Frontend**, **Consul Service Discovery** và **API Gateway Pattern**.

## 🏗️ Kiến trúc SOA

### **Sơ đồ kiến trúc:**
```
┌─────────────────┐
│  React Frontend │ :3000
│   (Material-UI) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  API Gateway    │ :8000 ← Single Entry Point
│  (Route/Balance)│
└────────┬────────┘
         │
         ↓
    ┌────────┐
    │ CONSUL │ :8500 ← Service Discovery & Health Check
    └───┬────┘
        │ (discovers)
        ↓
┌────────────────────────────────────┐
│     Microservices (Django)         │
├────────────┬──────────┬────────────┤
│ User       │ Book     │ Borrow     │
│ Service    │ Service  │ Service    │
│ :8001      │ :8002    │ :8003      │
└────────────┴──────────┴────────────┘
         │
         ↓
┌─────────────────┐
│  MySQL Database │
│ (library_soa_db)│
└─────────────────┘
```

## 🔑 Các thành phần chính

### 1. **API Gateway (Port 8000)**
- **Chức năng**: Single entry point cho tất cả requests
- **Features**:
  - ✅ Request routing đến microservices
  - ✅ Service discovery qua Consul
  - ✅ Load balancing
  - ✅ Error handling & retry logic
  - ✅ JWT token forwarding
- **Routes**:
  - `/api/users/*` → User Service
  - `/api/books/*` → Book Service
  - `/api/borrows/*` → Borrow Service

### 2. **Consul (Port 8500)**
- **Chức năng**: Service Registry & Health Checking
- **Features**:
  - ✅ Automatic service registration
  - ✅ Health monitoring (10s interval)
  - ✅ Service discovery
  - ✅ Auto-deregister unhealthy services (30s)
- **UI**: http://localhost:8500/ui

### 3. **User Service (Port 8001)**
- **Chức năng**: Authentication & User Management
- **Database**: `users` table
- **APIs chính**:
  - `POST /api/users/register/` - Đăng ký
  - `POST /api/users/login/` - JWT authentication
  - `GET /api/users/profile/` - User profile
  - `GET /api/users/list/` - Admin: User management
  - `GET /api/users/health/` - Health check

### 4. **Book Service (Port 8002)**
- **Chức năng**: Book Catalog & Inventory Management
- **Database**: `books` table
- **APIs chính**:
  - `GET /api/books/` - Browse & search books
  - `POST /api/books/create/` - Add book (admin)
  - `PUT /api/books/{id}/update/` - Update book
  - `DELETE /api/books/{id}/delete/` - Delete book
  - `GET /api/books/health/` - Health check

### 5. **Borrow Service (Port 8003)**
- **Chức năng**: Borrowing Logic & Transaction Management
- **Database**: `borrow_records` table
- **APIs chính**:
  - `POST /api/borrows/borrow/` - Borrow book
  - `POST /api/borrows/{id}/return/` - Return book
  - `GET /api/borrows/history/` - User history
  - `GET /api/borrows/all-records/` - Admin: All records
  - `GET /api/health/` - Health check

### 6. **Frontend React (Port 3000)**
- **Tech Stack**: React 19, Material-UI 7, Axios, React Router
- **Features**:
  - ✨ Material Design 3 UI
  - 🔐 JWT authentication
  - 👑 Role-based access (Admin/Reader)
  - 📱 Responsive design
  - 🔍 Advanced search & filter

## 🚀 Quick Start

### **Khởi động hệ thống:**

```bash
# 1. Start Consul (terminal 1)
consul agent -dev

# 2. Start all backend services (terminal 2)
cd ProductManagement
.\start_services.ps1

# 3. Start frontend (terminal 3)
cd library_frontend
npm start
```

### **Access URLs:**
- **Frontend**: http://localhost:3000
- **API Gateway**: http://127.0.0.1:8000
- **Consul UI**: http://localhost:8500/ui

### **Default Accounts:**
```
👑 Admin:
   Username: admin
   Password: admin123

📖 Reader:
   Username: reader1
   Password: reader123
```

## 📊 Database Schema

```sql
users:           id, username, email, password, role, is_active
books:           id, title, author, isbn, category, available_copies
borrow_records:  id, user_id, book_id, borrow_date, return_date, status
```

## 🎯 Lợi ích của kiến trúc SOA + Consul

### ✅ **Service Independence**
- Mỗi service có database table riêng
- Deploy và scale độc lập
- Technology diversity (có thể dùng nhiều ngôn ngữ)

### ✅ **Service Discovery**
- Gateway tự động tìm services qua Consul
- Không hardcode URLs
- Dễ dàng thêm/xóa service instances

### ✅ **High Availability**
- Health monitoring tự động
- Auto-deregister failed services
- Load balancing giữa multiple instances

### ✅ **Fault Tolerance**
- Retry logic trong Gateway
- Fallback to static config nếu Consul down
- Graceful error handling

### ✅ **Scalability**
- Horizontal scaling (thêm instances)
- Service-level scaling
- Independent resource allocation

## 🔧 Tech Stack

**Backend:**
- Django 4.2.7
- Django REST Framework 3.14.0
- PyMySQL 1.1.0
- python-consul 1.1.0
- PyJWT 2.8.0

**Frontend:**
- React 19.2.0
- Material-UI 7.3.4
- Axios 1.12.2
- React Router 7.9.3

**Infrastructure:**
- Consul (Service Discovery)
- MySQL 5.7+ (Database)
- PowerShell (Deployment Scripts)

## 📁 Cấu trúc Project

```
ProductManagement/
├── library_soa/                    # Backend Services
│   ├── api_gateway/                # API Gateway :8000
│   ├── user_service/               # User Service :8001
│   ├── book_service/               # Book Service :8002
│   ├── borrow_service/             # Borrow Service :8003
│   ├── shared/                     # Shared utilities
│   │   ├── consul_client.py        # Consul integration
│   │   └── config.py               # Common config
│   └── register_services.py        # Service registration script
├── library_frontend/               # React Frontend :3000
│   ├── src/
│   │   ├── pages/                  # UI Pages
│   │   ├── components/             # Reusable components
│   │   ├── services/               # API clients
│   │   └── context/                # Auth context
│   └── package.json
├── requirements.txt                # Python dependencies
├── start_services.ps1              # Auto-start script
├── database_setup.sql              # Database schema
└── README.md                       # This file
```

## 🛠️ Setup & Installation

Xem chi tiết tại [STARTUP_GUIDE.md](STARTUP_GUIDE.md) và [CONSUL_INTEGRATION.md](CONSUL_INTEGRATION.md)

## 📝 Tài liệu thêm

- **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)** - Hướng dẫn khởi động chi tiết
- **[CONSUL_INTEGRATION.md](CONSUL_INTEGRATION.md)** - Consul service discovery
- **Postman Collection** - `Library_SOA_3Services.postman_collection.json`

## 👥 Tác giả

Nguyễn Văn Dũng - SOA Library Management System

---

**🎉 Happy Coding!**

```
👑 Admin:
   ✅ User management
   ✅ Book CRUD operations  
   ✅ Borrow records management
   ✅ System statistics

📖 Reader:
   ✅ Browse books
   ✅ Borrow/return books
   ✅ View personal history
   ❌ Admin functions
```

## 🌐 API Testing

### **Via Postman:**
Import `Library_SOA_3Services.postman_collection.json` vào Postman để test APIs

### **Key Endpoints:**
```bash
# Authentication (via Gateway)
POST http://127.0.0.1:8000/api/users/login/

# Books (via Gateway)  
GET http://127.0.0.1:8000/api/books/

# Borrow (via Gateway)
POST http://127.0.0.1:8000/api/borrows/borrow/
```

## 🏗️ SOA Architecture Benefits

✅ **Service Independence** - Lỗi 1 service không làm sập hệ thống  
✅ **Fault Tolerance** - API Gateway có retry mechanism  
✅ **Scalability** - Scale từng service độc lập  
✅ **Maintainability** - Code tách biệt theo business domain  
✅ **Technology Flexibility** - Mỗi service có thể dùng tech stack khác nhau

## 🚨 Troubleshooting

### **Services không start được:**
```powershell
# Kiểm tra port conflicts
netstat -an | findstr "8000 8001 8002 8003"

# Restart services
.\start_services.ps1
```

### **Database connection error:**
- Kiểm tra MySQL service đang chạy
- Verify credentials trong `.env`
- Đảm bảo database `library_soa_db` đã được tạo

### **Frontend không connect được backend:**
- Backend services phải chạy trước
- Check CORS settings
- Verify API Gateway đang chạy trên port 8000

---

## 📝 Documentation

- 📖 **README.md** - Project overview (this file)
- 📖 **STARTUP_GUIDE.md** - Quick start instructions  
- 🔗 **Postman Collection** - API testing guide

---

**🏆 Built with Service-Oriented Architecture principles for scalability and maintainability**

- ✅ **SOA Architecture**: Các service độc lập, giao tiếp qua REST API
- ✅ **JWT Authentication**: Bảo mật với JSON Web Tokens  
- ✅ **Inter-Service Communication**: Services gọi lẫn nhau
- ✅ **Role-based Access**: Phân quyền theo vai trò
- ✅ **Search & Filter**: Tìm kiếm sách đa tiêu chí
- ✅ **Availability Tracking**: Theo dõi số lượng sách

## 🔄 Luồng hoạt động

1. **User đăng ký/đăng nhập** → User Service
2. **Tìm sách** → Book Service  
3. **Mượn sách** → Borrow Service gọi Book Service (cập nhật số lượng)
4. **Trả sách** → Borrow Service gọi Book Service (cập nhật số lượng)

## 🐛 Troubleshooting

### Lỗi database connection
```bash
# Kiểm tra MySQL đã chạy
mysql -u root -p

# Kiểm tra database đã tạo
SHOW DATABASES;
USE library_soa_db;
SHOW TABLES;
```

### Lỗi port đã sử dụng
```bash
# Windows
netstat -ano | findstr :8001

# Linux/Mac  
lsof -i :8001
```

## 📞 Hỗ trợ

- 📧 Email: nguyendung130504@gmail.com
- 📖 Documentation: [Link to docs]
- 🐙 GitHub: [Repository URL]

---

**🎉 Chúc bạn thành công với dự án Library SOA!**