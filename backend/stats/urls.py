from django.urls import path
from .views import PlatformStatisticsView, UserStatisticsView

app_name = 'stats'
 
urlpatterns = [
    path('platform/', PlatformStatisticsView.as_view(), name='platform-statistics'),
    path('user/', UserStatisticsView.as_view(), name='user-statistics'),
]