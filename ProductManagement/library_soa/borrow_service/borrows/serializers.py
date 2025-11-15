from rest_framework import serializers
from .models import BorrowRecord

class BorrowRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BorrowRecord
        fields = ['id', 'user_id', 'book_id', 'borrow_date', 'due_date', 
                 'return_date', 'status', 'notes', 'created_at', 'updated_at']

class BorrowRecordDetailSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(read_only=True)
    book_author = serializers.CharField(read_only=True)
    user_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = BorrowRecord
        fields = ['id', 'user_id', 'book_id', 'book_title', 'book_author', 
                 'user_name', 'borrow_date', 'due_date', 'return_date', 
                 'status', 'notes', 'created_at', 'updated_at']

class BorrowRequestSerializer(serializers.Serializer):
    book_id = serializers.IntegerField()