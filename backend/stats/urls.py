from django.urls import path
from .views import PlatformStatisticsView, UserStatisticsView

app_name = "statistics"

urlpatterns = [
    path("platform/", PlatformStatisticsView.as_view(), name="platform-statistics"),
    path("user/", UserStatisticsView.as_view(), name="user-statistics"),
]
