# 🔍 CONSUL SERVICE DISCOVERY INTEGRATION

## 📖 Tổng quan

Hệ thống đã được tích hợp **Consul** để thực hiện **Service Discovery** và **Health Checking** tự động. API Gateway giờ đây có thể tự động phát hiện và kết nối với các microservices thông qua Consul thay vì sử dụng URLs hardcode.

## 🏗️ Kiến trúc mới

```
Frontend (React:3000) → API Gateway (8000) 
                           ↓
                    [Consul (8500)]
                           ↓ Service Discovery
                    ┌──────┴──────┐
                    ↓      ↓      ↓
            User:8001  Book:8002  Borrow:8003
                    ↓
              MySQL Database
```

## 🆕 Các thành phần mới

### 1. **Consul Client** (`shared/consul_client.py`)
- ✅ Service registration/deregistration
- ✅ Service discovery
- ✅ Health check configuration
- ✅ Load balancing support

### 2. **Health Check Endpoints**
Mỗi service giờ có endpoint `/health/`:
- **User Service**: `http://127.0.0.1:8001/api/users/health/`
- **Book Service**: `http://127.0.0.1:8002/api/books/health/`
- **Borrow Service**: `http://127.0.0.1:8003/api/health/`

### 3. **Service Registration Script** (`register_services.py`)
Script quản lý việc đăng ký services với Consul:
```bash
# Đăng ký tất cả services
python library_soa/register_services.py register

# Hủy đăng ký services
python library_soa/register_services.py deregister

# Kiểm tra trạng thái
python library_soa/register_services.py status
```

### 4. **Updated API Gateway**
- ✅ Tự động discover services từ Consul
- ✅ Fallback to static config nếu Consul không available
- ✅ Dynamic routing dựa trên healthy instances

## 🚀 Cách sử dụng

### **Bước 1: Cài đặt dependencies mới**
```bash
pip install -r requirements.txt
```

### **Bước 2: Khởi động Consul**
```bash
# Chế độ development (single node)
consul agent -dev

# Consul UI sẽ available tại: http://localhost:8500/ui
```

### **Bước 3: Khởi động services**
```bash
# Script tự động đăng ký với Consul
.\start_services.ps1
```

Script sẽ:
1. ✅ Kiểm tra Consul đang chạy
2. ✅ Khởi động 4 services (Gateway + 3 microservices)
3. ✅ Đợi services khởi động
4. ✅ Tự động đăng ký services với Consul
5. ✅ Test API Gateway

## 📊 Kiểm tra Service Discovery

### **1. Consul UI**
Truy cập: http://localhost:8500/ui
- Xem danh sách services
- Kiểm tra health status
- Xem service instances

### **2. Gateway Info Endpoint**
```bash
curl http://127.0.0.1:8000/api/gateway/info/
```

Response sẽ hiển thị:
```json
{
  "gateway": "Library SOA API Gateway",
  "version": "1.0.0",
  "consul_enabled": true,
  "services": {
    "user-service": {
      "service_id": "user-service-1",
      "address": "127.0.0.1",
      "port": 8001,
      "tags": ["django", "user-management"],
      "source": "consul"
    },
    ...
  }
}
```

### **3. Service Status Command**
```bash
cd library_soa
python register_services.py status
```

## 🔧 Cấu hình Consul

### **Service Configuration**
Mỗi service được đăng ký với:
```python
{
    'service_name': 'user-service',
    'service_id': 'user-service-1',
    'host': '127.0.0.1',
    'port': 8001,
    'health_check_url': '/api/users/health/',
    'tags': ['django', 'user-management', 'authentication']
}
```

### **Health Check Settings**
- **Interval**: 10 giây (kiểm tra mỗi 10s)
- **Timeout**: 5 giây
- **Deregister**: 30 giây (tự động hủy đăng ký sau 30s fail)

## 🎯 Lợi ích của Consul Integration

### ✅ **Service Discovery**
- API Gateway tự động tìm services
- Không cần hardcode URLs
- Dễ dàng scale services

### ✅ **Health Checking**
- Tự động phát hiện services không hoạt động
- Chỉ route đến healthy instances
- Auto-deregister failed services

### ✅ **Load Balancing**
- Hỗ trợ multiple instances của cùng 1 service
- Round-robin load balancing
- High availability

### ✅ **Monitoring**
- Consul UI hiển thị trạng thái real-time
- Service health dashboard
- Easy debugging

## 🔄 Fallback Mechanism

Nếu Consul không available:
1. ⚠️ Warning message hiển thị
2. 🔄 Gateway tự động chuyển sang static config
3. ✅ Services vẫn hoạt động bình thường

## 📝 API Changes

### **Không có breaking changes!**
Tất cả API endpoints vẫn hoạt động như cũ:
- `/api/users/*`
- `/api/books/*`
- `/api/borrows/*`

### **New endpoints:**
- `GET /api/users/health/` - User service health
- `GET /api/books/health/` - Book service health  
- `GET /api/health/` - Borrow service health
- `GET /api/gateway/info/` - Enhanced with Consul info

## 🛠️ Troubleshooting

### **Consul không kết nối được**
```bash
# Kiểm tra Consul đang chạy
curl http://localhost:8500/v1/status/leader

# Khởi động Consul
consul agent -dev
```

### **Services không đăng ký**
```bash
# Đăng ký manual
cd library_soa
python register_services.py register

# Kiểm tra logs trong terminal của mỗi service
```

### **Health check failed**
```bash
# Test health endpoints
curl http://127.0.0.1:8001/api/users/health/
curl http://127.0.0.1:8002/api/books/health/
curl http://127.0.0.1:8003/api/health/
```

## 📚 Tài liệu tham khảo

- **Consul Docs**: https://www.consul.io/docs
- **Python Consul**: https://python-consul.readthedocs.io/
- **Service Discovery Pattern**: https://microservices.io/patterns/service-registry.html

## 🎉 Kết luận

Hệ thống giờ đây có:
- ✅ Dynamic service discovery
- ✅ Automatic health checking
- ✅ Better scalability
- ✅ Production-ready architecture
- ✅ Monitoring & observability

**Hệ thống vẫn hoạt động bình thường ngay cả khi Consul không available (fallback to static config)!**
