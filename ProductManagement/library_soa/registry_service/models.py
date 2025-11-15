# registry_service/models.py
from django.db import models

class ServiceRegistry(models.Model):
    name = models.CharField(max_length=100, unique=True)
    url = models.URLField()
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('inactive', 'Inactive')], default='active')
    last_registered = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
