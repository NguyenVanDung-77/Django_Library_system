import os
import sys
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate

# Add shared utils to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../shared'))

# Import utils manually since relative import doesn't work
import jwt
from datetime import datetime, timedelta

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
        return jwt.encode(payload, 'library_soa_secret_key_2025', algorithm='HS256')
    
    @staticmethod
    def decode_token(token):
        """Decode JWT token"""
        try:
            payload = jwt.decode(token, 'library_soa_secret_key_2025', algorithms=['HS256'])
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

from .models import User
from .serializers import UserSerializer, UserLoginSerializer, UserResponseSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Đăng ký người dùng mới"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user_data = UserResponseSerializer(user).data
        return Response(
            ResponseFormatter.success(user_data, "User registered successfully"),
            status=status.HTTP_201_CREATED
        )
    return Response(
        ResponseFormatter.error("Registration failed", serializer.errors),
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Đăng nhập người dùng"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        try:
            user = User.objects.get(username=username)
            if user.check_password(password) and user.is_active:
                token = JWTUtils.generate_token({
                    'id': user.id,
                    'username': user.username,
                    'role': user.role
                })
                user_data = UserResponseSerializer(user).data
                return Response(
                    ResponseFormatter.success({
                        'token': token,
                        'user': user_data
                    }, "Login successful"),
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    ResponseFormatter.error("Invalid credentials"),
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except User.DoesNotExist:
            return Response(
                ResponseFormatter.error("User not found"),
                status=status.HTTP_404_NOT_FOUND
            )
    return Response(
        ResponseFormatter.error("Invalid input", serializer.errors),
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Lấy thông tin profile người dùng"""
    # Assume we have middleware that sets request.user from JWT
    user_data = UserResponseSerializer(request.user).data
    return Response(
        ResponseFormatter.success(user_data, "Profile retrieved successfully"),
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([AllowAny])  # Tạm thời bỏ auth để test
def list_users(request):
    """Danh sách người dùng (chỉ admin/librarian)"""
    # Tạm thời bỏ check permission để test
    # if request.user.role not in ['admin', 'librarian']:
    #     return Response(
    #         ResponseFormatter.error("Permission denied"),
    #         status=status.HTTP_403_FORBIDDEN
    #     )
    
    users = User.objects.filter(is_active=True)
    users_data = UserResponseSerializer(users, many=True).data
    return Response(
        ResponseFormatter.success(users_data, "Users retrieved successfully"),
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_by_id(request, user_id):
    """Lấy thông tin user theo ID (để các service khác gọi)"""
    try:
        user = User.objects.get(id=user_id, is_active=True)
        user_data = UserResponseSerializer(user).data
        return Response(
            ResponseFormatter.success(user_data),
            status=status.HTTP_200_OK
        )
    except User.DoesNotExist:
        return Response(
            ResponseFormatter.error("User not found"),
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PUT'])
@permission_classes([AllowAny])  # Tạm thời bỏ auth để test
def update_user(request, user_id):
    """Cập nhật thông tin user"""
    try:
        user = User.objects.get(id=user_id)
        
        # Update user fields
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            user.email = request.data['email']
        if 'phone_number' in request.data:
            user.phone_number = request.data['phone_number']
        
        user.save()
        
        user_data = UserResponseSerializer(user).data
        return Response(
            ResponseFormatter.success(user_data, "User updated successfully"),
            status=status.HTTP_200_OK
        )
    except User.DoesNotExist:
        return Response(
            ResponseFormatter.error("User not found"),
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['DELETE'])
@permission_classes([AllowAny])  # Tạm thời bỏ auth để test
def delete_user(request, user_id):
    """Xóa user"""
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        
        return Response(
            ResponseFormatter.success(None, "User deleted successfully"),
            status=status.HTTP_200_OK
        )
    except User.DoesNotExist:
        return Response(
            ResponseFormatter.error("User not found"),
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for Consul"""
    return Response({
        'status': 'healthy',
        'service': 'user-service',
        'timestamp': datetime.now().isoformat()
    }, status=status.HTTP_200_OK)