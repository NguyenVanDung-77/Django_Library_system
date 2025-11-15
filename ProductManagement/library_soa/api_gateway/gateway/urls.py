from django.urls import path, re_path
from . import views

urlpatterns = [
    # Health check endpoint
    path('health/', views.health_check, name='health_check'),
    
    # Gateway info endpoint
    path('gateway/info/', views.gateway_info, name='gateway_info'),
    
    # Service routing - catch all and route to appropriate service
    re_path(r'^users/(?P<path>.*)$', views.route_to_user_service, name='user_service'),
    re_path(r'^books/(?P<path>.*)$', views.route_to_book_service, name='book_service'),
    re_path(r'^borrows/(?P<path>.*)$', views.route_to_borrow_service, name='borrow_service'),
]