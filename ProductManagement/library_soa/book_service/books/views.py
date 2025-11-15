import os
import sys
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

# Response Formatter
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

from .models import Book
from .serializers import BookSerializer, BookCreateSerializer, BookUpdateSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def list_books(request):
    """Danh sách sách với tìm kiếm và phân trang"""
    search = request.GET.get('search', '')
    category = request.GET.get('category', '')
    
    books = Book.objects.all()
    
    # Tìm kiếm theo title, author, isbn
    if search:
        books = books.filter(
            Q(title__icontains=search) |
            Q(author__icontains=search) |
            Q(isbn__icontains=search)
        )
    
    # Lọc theo category
    if category:
        books = books.filter(category__icontains=category)
    
    books_data = BookSerializer(books, many=True).data
    return Response(
        ResponseFormatter.success(books_data, "Books retrieved successfully"),
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_book(request, book_id):
    """Lấy thông tin chi tiết một cuốn sách"""
    try:
        book = Book.objects.get(id=book_id)
        book_data = BookSerializer(book).data
        return Response(
            ResponseFormatter.success(book_data, "Book retrieved successfully"),
            status=status.HTTP_200_OK
        )
    except Book.DoesNotExist:
        return Response(
            ResponseFormatter.error("Book not found"),
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([AllowAny])  # Tạm thời cho phép tất cả để test
def create_book(request):
    """Tạo sách mới (chỉ admin/librarian)"""
    # TODO: Implement proper JWT role checking later
    # For now, allow all authenticated requests to test functionality
    
    serializer = BookCreateSerializer(data=request.data)
    if serializer.is_valid():
        book = serializer.save()
        book_data = BookSerializer(book).data
        return Response(
            ResponseFormatter.success(book_data, "Book created successfully"),
            status=status.HTTP_201_CREATED
        )
    return Response(
        ResponseFormatter.error("Book creation failed", serializer.errors),
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['PUT'])
@permission_classes([AllowAny])  # Tạm thời cho phép tất cả
def update_book(request, book_id):
    """Cập nhật thông tin sách (chỉ admin/librarian)"""
    # TODO: Implement proper JWT role checking later
    
    try:
        book = Book.objects.get(id=book_id)
        serializer = BookUpdateSerializer(book, data=request.data, partial=True)
        if serializer.is_valid():
            book = serializer.save()
            book_data = BookSerializer(book).data
            return Response(
                ResponseFormatter.success(book_data, "Book updated successfully"),
                status=status.HTTP_200_OK
            )
        return Response(
            ResponseFormatter.error("Book update failed", serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )
    except Book.DoesNotExist:
        return Response(
            ResponseFormatter.error("Book not found"),
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['DELETE'])
@permission_classes([AllowAny])  # Tạm thời cho phép tất cả
def delete_book(request, book_id):
    """Xóa sách (chỉ admin)"""
    # TODO: Implement proper JWT role checking later
    
    try:
        book = Book.objects.get(id=book_id)
        book.delete()
        return Response(
            ResponseFormatter.success(message="Book deleted successfully"),
            status=status.HTTP_200_OK
        )
    except Book.DoesNotExist:
        return Response(
            ResponseFormatter.error("Book not found"),
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_book_availability(request, book_id):
    """Cập nhật số lượng sách có sẵn (cho borrow service gọi)"""
    try:
        book = Book.objects.get(id=book_id)
        action = request.data.get('action')  # 'borrow' or 'return'
        
        if action == 'borrow':
            if book.available_copies > 0:
                book.available_copies -= 1
                book.save()
                return Response(
                    ResponseFormatter.success({"available_copies": book.available_copies}, 
                                            "Book availability updated"),
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    ResponseFormatter.error("No copies available"),
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif action == 'return':
            if book.available_copies < book.total_copies:
                book.available_copies += 1
                book.save()
                return Response(
                    ResponseFormatter.success({"available_copies": book.available_copies}, 
                                            "Book availability updated"),
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    ResponseFormatter.error("All copies already returned"),
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                ResponseFormatter.error("Invalid action"),
                status=status.HTTP_400_BAD_REQUEST
            )
    except Book.DoesNotExist:
        return Response(
            ResponseFormatter.error("Book not found"),
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for Consul"""
    from datetime import datetime
    return Response({
        'status': 'healthy',
        'service': 'book-service',
        'timestamp': datetime.now().isoformat()
    }, status=status.HTTP_200_OK)