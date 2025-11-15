import os
import sys
from datetime import datetime, timedelta
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
import requests
import jwt

class JWTUtils:
    """JWT utility functions"""
    
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
    
    @staticmethod
    def get_user_from_request(request):
        """Get user info from JWT token in request"""
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        return JWTUtils.decode_token(token)

class ServiceClient:
    """Base client for inter-service communication"""
    
    def __init__(self, base_url):
        self.base_url = base_url
        
    def get(self, endpoint, headers=None):
        """Make GET request to service"""
        url = f"{self.base_url}{endpoint}"
        try:
            response = requests.get(url, headers=headers)
            return response.json() if response.status_code == 200 else None
        except:
            return None
        
    def post(self, endpoint, data=None, headers=None):
        """Make POST request to service"""
        url = f"{self.base_url}{endpoint}"
        try:
            response = requests.post(url, json=data, headers=headers)
            return response.json() if response.status_code in [200, 201] else None
        except:
            return None
        
    def put(self, endpoint, data=None, headers=None):
        """Make PUT request to service"""
        url = f"{self.base_url}{endpoint}"
        try:
            response = requests.put(url, json=data, headers=headers)
            return response.json() if response.status_code == 200 else None
        except:
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

from .models import BorrowRecord
from .serializers import BorrowRecordSerializer, BorrowRequestSerializer

# Service clients
book_service = ServiceClient('http://localhost:8002')
user_service = ServiceClient('http://localhost:8001')

@api_view(['POST'])
@permission_classes([AllowAny])  # Tạm thời bỏ auth để test
def borrow_book(request):
    """Mượn sách"""
    # Get user from JWT token
    user_info = JWTUtils.get_user_from_request(request)
    if not user_info:
        return Response(
            ResponseFormatter.error("Invalid or missing token"),
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    serializer = BorrowRequestSerializer(data=request.data)
    if serializer.is_valid():
        book_id = serializer.validated_data['book_id']
        user_id = user_info.get('user_id')
        
        # Check if book exists and available
        book_data = book_service.get(f'/api/books/{book_id}/')
        if not book_data or book_data.get('status') != 'success':
            return Response(
                ResponseFormatter.error("Book not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        book_info = book_data['data']
        if book_info['available_copies'] <= 0:
            return Response(
                ResponseFormatter.error("Book not available"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already borrowed this book
        existing_borrow = BorrowRecord.objects.filter(
            user_id=user_id, 
            book_id=book_id, 
            status='borrowed'
        ).first()
        
        if existing_borrow:
            return Response(
                ResponseFormatter.error("Book already borrowed by user"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update book availability
        update_result = book_service.put(f'/api/books/{book_id}/availability/', 
                                       {'action': 'borrow'})
        if not update_result or update_result.get('status') != 'success':
            return Response(
                ResponseFormatter.error("Failed to update book availability"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create borrow record
        borrow_record = BorrowRecord.objects.create(
            user_id=user_id,
            book_id=book_id,
            borrow_date=datetime.now(),
            due_date=datetime.now() + timedelta(days=14),  # 2 weeks
            status='borrowed'
        )
        
        borrow_data = BorrowRecordSerializer(borrow_record).data
        return Response(
            ResponseFormatter.success(borrow_data, "Book borrowed successfully"),
            status=status.HTTP_201_CREATED
        )
    
    return Response(
        ResponseFormatter.error("Invalid input", serializer.errors),
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['POST'])
@permission_classes([AllowAny])  # Tạm thời bỏ auth để test
def return_book(request, borrow_id):
    """Trả sách"""
    try:
        borrow_record = BorrowRecord.objects.get(id=borrow_id)
        
        if borrow_record.status != 'borrowed':
            return Response(
                ResponseFormatter.error("Book already returned"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update book availability
        update_result = book_service.put(f'/api/books/{borrow_record.book_id}/availability/', 
                                       {'action': 'return'})
        if not update_result or update_result.get('status') != 'success':
            return Response(
                ResponseFormatter.error("Failed to update book availability"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update borrow record
        borrow_record.return_date = datetime.now()
        borrow_record.status = 'returned'
        borrow_record.save()
        
        borrow_data = BorrowRecordSerializer(borrow_record).data
        return Response(
            ResponseFormatter.success(borrow_data, "Book returned successfully"),
            status=status.HTTP_200_OK
        )
        
    except BorrowRecord.DoesNotExist:
        return Response(
            ResponseFormatter.error("Borrow record not found"),
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def user_borrow_history(request):
    """Lịch sử mượn sách của user"""
    # Get user from JWT token
    user_info = JWTUtils.get_user_from_request(request)
    if not user_info:
        return Response(
            ResponseFormatter.error("Invalid or missing token"),
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    user_id = user_info.get('user_id')
    borrow_records = BorrowRecord.objects.filter(user_id=user_id).order_by('-created_at')
    
    # Enrich data with book information
    enriched_data = []
    for record in borrow_records:
        record_data = BorrowRecordSerializer(record).data
        
        # Fetch book info from Book Service
        try:
            book_response = requests.get(f'http://127.0.0.1:8002/api/books/{record.book_id}/')
            if book_response.status_code == 200:
                book_data = book_response.json()
                if book_data.get('status') == 'success':
                    book_info = book_data['data']
                    record_data['book_title'] = book_info.get('title', 'Tên sách không xác định')
                    record_data['book_author'] = book_info.get('author', 'Tác giả không xác định')
                else:
                    record_data['book_title'] = 'Tên sách không xác định'
                    record_data['book_author'] = 'Tác giả không xác định'
            else:
                record_data['book_title'] = 'Tên sách không xác định'
                record_data['book_author'] = 'Tác giả không xác định'
        except:
            record_data['book_title'] = 'Tên sách không xác định'
            record_data['book_author'] = 'Tác giả không xác định'
        
        enriched_data.append(record_data)
    
    return Response(
        ResponseFormatter.success(enriched_data, "Borrow history retrieved successfully"),
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def all_borrow_records(request):
    """Tất cả borrow records (admin/librarian)"""
    borrow_records = BorrowRecord.objects.all().order_by('-created_at')
    borrow_data = BorrowRecordSerializer(borrow_records, many=True).data
    return Response(
        ResponseFormatter.success(borrow_data, "All borrow records retrieved successfully"),
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for Consul"""
    return Response({
        'status': 'healthy',
        'service': 'borrow-service',
        'timestamp': datetime.now().isoformat()
    }, status=status.HTTP_200_OK)