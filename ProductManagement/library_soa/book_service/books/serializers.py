from rest_framework import serializers
from .models import Book

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'isbn', 'category', 'publisher', 
                 'publication_year', 'total_copies', 'available_copies', 
                 'description', 'created_at', 'updated_at']
        
class BookCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['title', 'author', 'isbn', 'category', 'publisher', 
                 'publication_year', 'total_copies', 'description']
        
    def create(self, validated_data):
        # Set available_copies equal to total_copies for new books
        validated_data['available_copies'] = validated_data['total_copies']
        return Book.objects.create(**validated_data)

class BookUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['title', 'author', 'category', 'publisher', 
                 'publication_year', 'total_copies', 'description']
        
    def update(self, instance, validated_data):
        # If total_copies changed, adjust available_copies proportionally
        if 'total_copies' in validated_data:
            old_total = instance.total_copies
            new_total = validated_data['total_copies']
            if old_total > 0:
                ratio = instance.available_copies / old_total
                instance.available_copies = int(new_total * ratio)
            else:
                instance.available_copies = new_total
                
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance