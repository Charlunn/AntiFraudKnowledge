from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'notifications'

# 创建路由器
router = DefaultRouter()
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'templates', views.NotificationTemplateViewSet, basename='notification-template')

urlpatterns = [
    # 包含路由器生成的URL
    path('', include(router.urls)),
    
    # 额外的自定义端点
    path('count/', views.NotificationCountView.as_view(), name='notification-count'),
    path('bulk-send/', views.BulkNotificationView.as_view(), name='bulk-notification'),
    path('mark-all-read/', views.NotificationViewSet.as_view({'post': 'mark_all_read'}), name='mark-all-read'),
    path('clear-all/', views.NotificationViewSet.as_view({'delete': 'clear_all'}), name='clear-all'),
    path('stats/', views.NotificationViewSet.as_view({'get': 'stats'}), name='notification-stats'),
]