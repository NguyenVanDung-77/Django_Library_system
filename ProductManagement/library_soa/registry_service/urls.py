# registry_service/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_service, name='register_service'),
    path('list/', views.list_services, name='list_services'),
    path('deregister/<int:service_id>/', views.deregister_service, name='deregister_service'),
]
