# shared/utils.py
import requests
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from .config import JWT_SECRET_KEY

class ServiceClient:
    """Base client for inter-service communication"""
    
    def __init__(self, base_url, timeout=30, retries=3):
        self.base_url = base_url
        self.timeout = timeout
        self.retries = retries

    def _request(self, method, endpoint, data=None, headers=None):
        """General method for making HTTP requests with retries"""
        url = f"{self.base_url}{endpoint}"
        for _ in range(self.retries):
            try:
                response = requests.request(
                    method,
                    url,
                    json=data,
                    headers=headers,
                    timeout=self.timeout
                )
                return response.json() if response.status_code == 200 else None
            except requests.exceptions.RequestException as e:
                # Handle errors (logging or retry logic can be added here)
                continue
        return None

    def get(self, endpoint, headers=None):
        return self._request('GET', endpoint, headers=headers)

    def post(self, endpoint, data=None, headers=None):
        return self._request('POST', endpoint, data=data, headers=headers)

    def put(self, endpoint, data=None, headers=None):
        return self._request('PUT', endpoint, data=data, headers=headers)

    def delete(self, endpoint, headers=None):
        return self._request('DELETE', endpoint, headers=headers)

class JWTUtils:
    """JWT utility functions"""
    
    @staticmethod
    def generate_token(user_data):
        """Generate JWT token for user"""
        payload = {
            'user_id': user_data['id'],
            'username': user_data['username'],
            'role': user_data.get('role', 'reader'),
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')
    
    @staticmethod
    def decode_token(token):
        """Decode JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

class ResponseFormatter:
    """Standard response formatter for all services"""
    
    @staticmethod
    def success(data=None, message="Success"):
        return {
            'status': 'success',
            'message': message,
            'data': data
        }
    
    @staticmethod
    def error(message="Error", errors=None):
        return {
            'status': 'error',
            'message': message,
            'errors': errors
        }
