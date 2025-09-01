from django.urls import path
from .views import UserAchievementListView, GrantAchievementView

app_name = 'achievements'

urlpatterns = [
    path('', UserAchievementListView.as_view(), name='list'),
    path('grant/', GrantAchievementView.as_view(), name='grant'),
]
