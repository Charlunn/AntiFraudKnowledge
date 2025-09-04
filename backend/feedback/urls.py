from django.urls import path
from .views import (
    FeedbackCreateView,
    UserFeedbackListView,
    AdminFeedbackListView,
    AdminFeedbackDetailView,
    FeedbackDetailView,
    FeedbackStatsView
)

app_name = 'feedback'

urlpatterns = [
    # 用户反馈功能
    path('create/', FeedbackCreateView.as_view(), name='create'),
    path('my/', UserFeedbackListView.as_view(), name='my_feedback'),
    path('<int:pk>/', FeedbackDetailView.as_view(), name='detail'),
    
    # 管理员功能
    path('admin/', AdminFeedbackListView.as_view(), name='admin_list'),
    path('admin/<int:pk>/', AdminFeedbackDetailView.as_view(), name='admin_detail'),
    path('admin/stats/', FeedbackStatsView.as_view(), name='admin_stats'),
]
