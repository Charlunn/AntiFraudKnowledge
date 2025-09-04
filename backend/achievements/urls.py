from django.urls import path
from .views import (
    UserAchievementListView, 
    AchievementListView,
    AchievementDetailView,
    GrantAchievementView,
    AdminAchievementListView,
    AdminAchievementDetailView,
    UserAchievementStatsView
)

app_name = 'achievements'

urlpatterns = [
    # 用户成就相关
    path('my/', UserAchievementListView.as_view(), name='my_achievements'),
    path('all/', AchievementListView.as_view(), name='all_achievements'),
    path('<int:pk>/', AchievementDetailView.as_view(), name='achievement_detail'),
    path('stats/', UserAchievementStatsView.as_view(), name='achievement_stats'),
    
    # 管理员功能
    path('grant/', GrantAchievementView.as_view(), name='grant'),
    path('admin/', AdminAchievementListView.as_view(), name='admin_list'),
    path('admin/<int:pk>/', AdminAchievementDetailView.as_view(), name='admin_detail'),
]
