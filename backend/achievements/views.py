import logging
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Achievement, UserAchievement
from .serializers import AchievementSerializer, UserAchievementSerializer, AchievementWithStatusSerializer
from utils.permissions import IsAdminUser

logger = logging.getLogger(__name__)


class UserAchievementListView(generics.ListAPIView):
    """用户已获得的成就列表"""
    serializer_class = UserAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAchievement.objects.filter(user=self.request.user).select_related('achievement')


class AchievementListView(generics.ListAPIView):
    """所有成就列表（带用户完成状态）"""
    serializer_class = AchievementWithStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Achievement.objects.all()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context


class AchievementDetailView(generics.RetrieveAPIView):
    """成就详情"""
    queryset = Achievement.objects.all()
    serializer_class = AchievementWithStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context


class GrantAchievementView(APIView):
    """授予成就（管理员功能）"""
    permission_classes = [IsAdminUser]

    def post(self, request):
        try:
            achievement_id = request.data.get('achievement_id')
            user_id = request.data.get('user_id')
            
            if not achievement_id or not user_id:
                logger.warning(f"管理员 {request.user.id} 授予成就时缺少必要参数")
                return Response(
                    {'error': 'achievement_id and user_id are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            achievement = get_object_or_404(Achievement, id=achievement_id)
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = get_object_or_404(User, id=user_id)
            
            user_achievement, created = UserAchievement.objects.get_or_create(
                user=user, 
                achievement=achievement
            )
            
            if created:
                logger.info(f"管理员 {request.user.id} 成功授予用户 {user_id} 成就 {achievement_id}")
                return Response({'message': 'Achievement granted successfully'})
            else:
                logger.info(f"管理员 {request.user.id} 尝试授予用户 {user_id} 已有的成就 {achievement_id}")
                return Response(
                    {'message': 'User already has this achievement'}, 
                    status=status.HTTP_200_OK
                )
        except Exception as e:
            logger.exception(f"管理员 {request.user.id} 授予成就时发生错误")
            return Response(
                {'error': '授予成就时发生内部错误'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminAchievementListView(generics.ListCreateAPIView):
    """管理员成就管理"""
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = Achievement.objects.all()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        return queryset


class AdminAchievementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """管理员成就详情管理"""
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsAdminUser]


class UserAchievementStatsView(APIView):
    """用户成就统计"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            total_achievements = Achievement.objects.count()
            user_achievements = UserAchievement.objects.filter(user=user).count()
            completion_rate = (user_achievements / total_achievements * 100) if total_achievements > 0 else 0
            
            logger.info(f"用户 {user.id} 获取成就统计信息")
            return Response({
                'total_achievements': total_achievements,
                'user_achievements': user_achievements,
                'completion_rate': round(completion_rate, 2),
                'remaining_achievements': total_achievements - user_achievements
            })
        except Exception as e:
            logger.exception(f"用户 {request.user.id} 获取成就统计时发生错误")
            return Response(
                {'error': '获取成就统计时发生内部错误'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
