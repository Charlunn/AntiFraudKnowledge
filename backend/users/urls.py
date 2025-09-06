from django.urls import path
from .views import (
    UserRegistrationView,
    UserProfileView,
    ChangePasswordView,
    DeleteUserView,
    BindEmailView,
    BindPhoneView,
    UnbindEmailView,
    UnbindPhoneView,
    UserSettingsView,
    AdminUserListView,
    AdminUserDetailView,
    UserStatsView,
)
from .jwt_views import (
    JWTLoginView,
    JWTLogoutView,
    JWTRefreshTokenView,
    JWTVerifyTokenView,
    JWTUserProfileView,
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', JWTLoginView.as_view(), name='jwt-login'),
    path('logout/', JWTLogoutView.as_view(), name='jwt-logout'),
    path('token/refresh/', JWTRefreshTokenView.as_view(), name='jwt-refresh'),
    path('token/verify/', JWTVerifyTokenView.as_view(), name='jwt-verify'),
    path('me/', JWTUserProfileView.as_view(), name='jwt-user-profile'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'), # Change password URL
    path('delete-account/', DeleteUserView.as_view(), name='delete-account'), # Add this line
    path('bind-email/', BindEmailView.as_view(), name='bind-email'),
    path('bind-phone/', BindPhoneView.as_view(), name='bind-phone'),
    path('unbind-email/', UnbindEmailView.as_view(), name='unbind-email'),
    path('unbind-phone/', UnbindPhoneView.as_view(), name='unbind-phone'),
    path('settings/', UserSettingsView.as_view(), name='user-settings'),
    path('stats/', UserStatsView.as_view(), name='user-stats'),
    
    # 管理员功能
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
