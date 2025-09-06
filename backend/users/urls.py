from django.urls import path
from .views import (
    UserRegistrationView, UserLoginView, UserLogoutView, UserProfileView,
    ChangePasswordView, DeleteUserView, BindEmailView, BindPhoneView,
    UnbindEmailView, UnbindPhoneView, UserSettingsView, AdminUserListView,
    AdminUserDetailView, UserStatsView, CheckUsernameView, OAuthRegistrationView,
    OAuthConflictResolveView, BindOAuthAccountView, UnbindOAuthAccountView,
    GetOAuthBindingStatusView, UserOnboardingView
)
from .jwt_views import (
    JWTLoginView,
    JWTLogoutView,
    JWTRefreshTokenView,
    JWTVerifyTokenView,
    JWTUserProfileView,
)
from .oauth_views import (
    OAuth2LoginView,
    OAuth2LogoutView,
    OAuth2RefreshTokenView,
    OAuth2VerifyTokenView,
)
from .third_party_oauth import (
    QQOAuthLoginView, 
    WeChatOAuthLoginView,
    DouyinOAuthLoginView,
    AlipayOAuthLoginView,
    OAuthConflictResolveView
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    
    # JWT 认证端点
    path('login/', JWTLoginView.as_view(), name='jwt-login'),
    path('logout/', JWTLogoutView.as_view(), name='jwt-logout'),
    path('token/refresh/', JWTRefreshTokenView.as_view(), name='jwt-refresh'),
    path('token/verify/', JWTVerifyTokenView.as_view(), name='jwt-verify'),
    path('me/', JWTUserProfileView.as_view(), name='jwt-user-profile'),
    
    # OAuth 2.0 认证端点（用于第三方登录）
    path('oauth/login/', OAuth2LoginView.as_view(), name='oauth-login'),
    path('oauth/logout/', OAuth2LogoutView.as_view(), name='oauth-logout'),
    path('oauth/token/refresh/', OAuth2RefreshTokenView.as_view(), name='oauth-refresh'),
    path('oauth/token/verify/', OAuth2VerifyTokenView.as_view(), name='oauth-verify'),
    
    # 第三方OAuth登录端点
    path('oauth/qq/login/', QQOAuthLoginView.as_view(), name='qq_oauth_login'),
    path('oauth/wechat/login/', WeChatOAuthLoginView.as_view(), name='wechat_oauth_login'),
    path('oauth/douyin/login/', DouyinOAuthLoginView.as_view(), name='douyin_oauth_login'),
    path('oauth/alipay/login/', AlipayOAuthLoginView.as_view(), name='alipay_oauth_login'),
    path('oauth/resolve-conflict/', OAuthConflictResolveView.as_view(), name='oauth_resolve_conflict'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'), # Change password URL
    path('delete-account/', DeleteUserView.as_view(), name='delete-account'), # Add this line
    path('bind-email/', BindEmailView.as_view(), name='bind-email'),
    path('bind-phone/', BindPhoneView.as_view(), name='bind-phone'),
    path('unbind-email/', UnbindEmailView.as_view(), name='unbind-email'),
    path('unbind-phone/', UnbindPhoneView.as_view(), name='unbind-phone'),
    path('settings/', UserSettingsView.as_view(), name='user-settings'),
    path('stats/', UserStatsView.as_view(), name='user-stats'),
    
    # 用户名校验
    path('check-username/', CheckUsernameView.as_view(), name='check-username'),
    
    # OAuth注册流程
    path('oauth/register/', OAuthRegistrationView.as_view(), name='oauth-register'),
    path('oauth/resolve-conflict/', OAuthConflictResolveView.as_view(), name='oauth-resolve-conflict'),
    
    # 第三方账户绑定管理
    path('bind-oauth/', BindOAuthAccountView.as_view(), name='bind-oauth'),
    path('unbind-oauth/', UnbindOAuthAccountView.as_view(), name='unbind-oauth'),
    path('oauth-binding-status/', GetOAuthBindingStatusView.as_view(), name='oauth-binding-status'),
    
    # 用户引导流程
    path('onboarding/', UserOnboardingView.as_view(), name='user-onboarding'),
    
    # 管理员功能
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
