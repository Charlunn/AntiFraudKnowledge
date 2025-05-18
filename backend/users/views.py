from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer, UserLoginSerializer,UserProfileSerializer, ChangePasswordSerializer # Import ChangePasswordSerializer
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken # Import necessary models
from .models import CustomUser

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
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
        print(self.object.check_password('admin123456'))
        if serializer.is_valid():
            print(f"serializer.validated_data: {serializer.validated_data}")
            print(f"serializer.validated_data.get('old_password'): {serializer.validated_data.get('old_password')}")
            print(f"serializer.validated_data: {serializer.validated_data}")
            if not self.object.check_password(serializer.validated_data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)

            self.object.set_password(serializer.validated_data.get("new_password"))
            self.object.save()

            # Blacklist all refresh tokens for the user
            try:
                for token in OutstandingToken.objects.filter(user=self.object):
                    t, _ = BlacklistedToken.objects.get_or_create(token=token)
            except Exception as e:
                print(f"Error blacklisting tokens: {e}")

            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    pass


class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        try:
            user.delete()
            # Optionally blacklist tokens after deletion, although user.delete() might handle this depending on CASCADE settings
            # If not handled by CASCADE, you might need to explicitly blacklist outstanding tokens here as well.
            return Response({"message": "Account deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": "Error deleting account"}, status=status.HTTP_400_BAD_REQUEST)