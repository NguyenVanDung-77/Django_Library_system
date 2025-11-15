# registry_service/serializers.py
from rest_framework import serializers
from .models import ServiceRegistry

class ServiceRegistrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRegistry
        fields = ['id', 'name', 'url', 'status', 'last_registered']
