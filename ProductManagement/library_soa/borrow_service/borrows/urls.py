from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('borrow/', views.borrow_book, name='borrow_book'),
    path('return/<int:borrow_id>/', views.return_book, name='return_book'),
    path('history/', views.user_borrow_history, name='user_borrow_history'),
    path('all-records/', views.all_borrow_records, name='all_borrow_records'),
]