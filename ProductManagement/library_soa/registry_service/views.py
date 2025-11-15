# registry_service/views.py
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ServiceRegistry
from .serializers import ServiceRegistrySerializer

@api_view(['POST'])
def register_service(request):
    """Đăng ký một dịch vụ mới vào Registry"""
    serializer = ServiceRegistrySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def list_services(request):
    """Lấy danh sách các dịch vụ đã đăng ký"""
    services = ServiceRegistry.objects.all()
    serializer = ServiceRegistrySerializer(services, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
def deregister_service(request, service_id):
    """Xóa một dịch vụ khỏi Registry"""
    try:
        service = ServiceRegistry.objects.get(id=service_id)
        service.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except ServiceRegistry.DoesNotExist:
        return Response({'error': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)
