from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    UserProfileView,
    ChangePasswordView,
    DeleteUserView,
)

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="user-register"),
    path("login/", UserLoginView.as_view(), name="token_obtain_pair"),
    path("logout/", UserLogoutView.as_view(), name="user-logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path(
        "change-password/", ChangePasswordView.as_view(), name="change-password"
    ),  # Change password URL
    path(
        "delete-account/", DeleteUserView.as_view(), name="delete-account"
    ),  # Add this line
]
