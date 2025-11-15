# shared/config.py
import os
from dotenv import load_dotenv
import pymysql

# Cấu hình để sử dụng PyMySQL thay vì mysqlclient
pymysql.install_as_MySQLdb()

load_dotenv()

# Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME', 'library_soa_db'),
        'USER': os.getenv('DB_USER', 'root'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}

# JWT Configuration
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your_secret_key_here')

# Service URLs
SERVICE_URLS = {
    'USER_SERVICE': os.getenv('USER_SERVICE_URL', 'http://localhost:8001'),
    'BOOK_SERVICE': os.getenv('BOOK_SERVICE_URL', 'http://localhost:8002'),
    'BORROW_SERVICE': os.getenv('BORROW_SERVICE_URL', 'http://localhost:8003'),
}

# CORS Configuration (Optional for inter-service communication)
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
