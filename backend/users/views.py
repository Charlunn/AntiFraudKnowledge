from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import login, logout
from django.db.models import Q
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    BindEmailSerializer,
    BindPhoneSerializer,
    UserSettingsSerializer,
)
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken # Import necessary models
from .models import CustomUser
from utils.permissions import IsAdminUser, IsOwnerOrAdmin
import logging

logger = logging.getLogger(__name__)

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Registration validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        user = serializer.save()
        # 在这里可以添加一些额外的逻辑，例如发送注册确认邮件等
        pass

class UserLoginView(TokenObtainPairView):
    # 使用我们自定义的登录序列化器来处理账号/邮箱/手机号登录逻辑
    serializer_class = UserLoginSerializer

class UserLogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist() # 将 refresh_token 加入黑名单 (如果启用了黑名单)
            return Response({"message": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": "Invalid token or token not provided"}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated] # 只允许认证用户访问

    def get_object(self):
        # 返回当前登录用户
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # 在这里可以添加逻辑来检查邮箱或手机号是否发生了变化，并触发验证流程
        # 目前我们只依赖序列化器的 validate 方法进行唯一性校验

        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        # 返回更新后的用户个人信息，包括头像的 URL
        # 使用 UserProfileSerializer 再次序列化 instance 以确保返回最新的数据
        return Response(self.get_serializer(instance).data, status=status.HTTP_200_OK)

    def perform_update(self, serializer):
        serializer.save()
        # 在这里可以添加一些额外的逻辑，例如记录修改日志等
        pass


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)
        try:
            if serializer.is_valid():
                if not self.object.check_password(serializer.validated_data.get("old_password")):
                    logger.warning(f"User {self.object.id} attempted password change with wrong old password")
                    return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)

                self.object.set_password(serializer.validated_data.get("new_password"))
                self.object.save()
                logger.info(f"User {self.object.id} successfully changed password")

                # Blacklist all refresh tokens for the user
                try:
                    for token in OutstandingToken.objects.filter(user=self.object):
                        t, _ = BlacklistedToken.objects.get_or_create(token=token)
                    logger.info(f"Blacklisted tokens for user {self.object.id} after password change")
                except Exception as e:
                    logger.error(f"Error blacklisting tokens for user {self.object.id}: {e}")

                return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error changing password for user {self.object.id}: {e}")
            return Response({"detail": "An error occurred while changing password"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    pass


class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        try:
            user_id = user.id
            user.delete()
            logger.info(f"User {user_id} successfully deleted their account")
            return Response({"message": "Account deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting account for user {user.id}: {e}")
            return Response({"detail": "An error occurred while deleting account"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class BindEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = BindEmailSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            if serializer.validated_data['code'] != '123456':
                logger.warning(f"User {request.user.id} attempted email binding with invalid code")
                return Response({'detail': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
            request.user.email = serializer.validated_data['email']
            request.user.save()
            logger.info(f"User {request.user.id} successfully bound email: {serializer.validated_data['email']}")
            return Response({'message': 'Email bound successfully'})
        except Exception as e:
            logger.error(f"Error binding email for user {request.user.id}: {e}")
            return Response({'detail': 'An error occurred while binding email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BindPhoneView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = BindPhoneSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            if serializer.validated_data['code'] != '123456':
                logger.warning(f"User {request.user.id} attempted phone binding with invalid code")
                return Response({'detail': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
            request.user.phone_number = serializer.validated_data['phone_number']
            request.user.save()
            logger.info(f"User {request.user.id} successfully bound phone: {serializer.validated_data['phone_number']}")
            return Response({'message': 'Phone number bound successfully'})
        except Exception as e:
            logger.error(f"Error binding phone for user {request.user.id}: {e}")
            return Response({'detail': 'An error occurred while binding phone'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UnbindEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.email = ''
            request.user.save()
            logger.info(f"User {request.user.id} successfully unbound email")
            return Response({'message': 'Email unbound'})
        except Exception as e:
            logger.error(f"Error unbinding email for user {request.user.id}: {e}")
            return Response({'detail': 'An error occurred while unbinding email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UnbindPhoneView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.phone_number = None
            request.user.save()
            logger.info(f"User {request.user.id} successfully unbound phone")
            return Response({'message': 'Phone number unbound'})
        except Exception as e:
            logger.error(f"Error unbinding phone for user {request.user.id}: {e}")
            return Response({'detail': 'An error occurred while unbinding phone'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class AdminUserListView(generics.ListAPIView):
    """管理员查看所有用户列表"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]
    queryset = CustomUser.objects.all()
    
    def get_queryset(self):
        queryset = CustomUser.objects.all().order_by('-date_joined')
        
        # 搜索功能
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) | 
                Q(email__icontains=search) | 
                Q(nickname__icontains=search)
            )
        
        # 用户类型筛选
        user_type = self.request.query_params.get('user_type', None)
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        
        return queryset


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """管理员查看和管理特定用户"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]
    queryset = CustomUser.objects.all()


class UserStatsView(APIView):
    """用户统计信息"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            
            # 获取用户相关统计
            stats = {
                'posts_count': getattr(user, 'posts', user.posts).count() if hasattr(user, 'posts') else 0,
                'comments_count': getattr(user, 'comments', user.comments).count() if hasattr(user, 'comments') else 0,
                'achievements_count': getattr(user, 'userachievement_set', user.userachievement_set).count() if hasattr(user, 'userachievement_set') else 0,
                'quiz_attempts_count': getattr(user, 'quizattempt_set', user.quizattempt_set).count() if hasattr(user, 'quizattempt_set') else 0,
            }
            
            logger.info(f"Retrieved stats for user {user.id}")
            return Response(stats)
        except Exception as e:
            logger.error(f"Error retrieving stats for user {request.user.id}: {e}")
            return Response({'detail': 'An error occurred while retrieving user stats'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
