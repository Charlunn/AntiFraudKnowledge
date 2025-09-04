import logging
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.contrib.auth import get_user_model

from .models import Feedback
from .serializers import FeedbackSerializer, AdminFeedbackSerializer, FeedbackDetailSerializer
from utils.permissions import IsAdminUser, IsOwnerOrAdmin

User = get_user_model()
logger = logging.getLogger(__name__)


class FeedbackCreateView(generics.CreateAPIView):
    """用户创建反馈"""
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
            logger.info(f"用户 {self.request.user.id} 创建反馈成功")
        except Exception as e:
            logger.exception(f"用户 {self.request.user.id} 创建反馈时发生错误")
            raise e


class UserFeedbackListView(generics.ListAPIView):
    """用户查看自己的反馈历史"""
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Feedback.objects.filter(user=self.request.user).order_by('-created_at')


class AdminFeedbackListView(generics.ListAPIView):
    """管理员查看所有反馈"""
    serializer_class = AdminFeedbackSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = Feedback.objects.select_related('user').order_by('-created_at')
        
        # 搜索功能
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(message__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(contact__icontains=search)
            )
        
        # 按用户筛选
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
            
        return queryset


class AdminFeedbackDetailView(generics.RetrieveDestroyAPIView):
    """管理员查看反馈详情和删除反馈"""
    queryset = Feedback.objects.select_related('user')
    serializer_class = FeedbackDetailSerializer
    permission_classes = [IsAdminUser]


class FeedbackDetailView(generics.RetrieveAPIView):
    """用户查看自己的反馈详情"""
    serializer_class = FeedbackSerializer
    permission_classes = [IsOwnerOrAdmin]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Feedback.objects.select_related('user')
        return Feedback.objects.filter(user=self.request.user)


class FeedbackStatsView(APIView):
    """反馈统计（管理员功能）"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        try:
            from django.utils import timezone
            from datetime import timedelta
            
            now = timezone.now()
            today = now.date()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            total_feedback = Feedback.objects.count()
            today_feedback = Feedback.objects.filter(created_at__date=today).count()
            week_feedback = Feedback.objects.filter(created_at__date__gte=week_ago).count()
            month_feedback = Feedback.objects.filter(created_at__date__gte=month_ago).count()
            
            # 活跃用户统计
            active_users = Feedback.objects.values('user').distinct().count()
            
            logger.info(f"管理员 {request.user.id} 获取反馈统计信息")
            return Response({
                'total_feedback': total_feedback,
                'today_feedback': today_feedback,
                'week_feedback': week_feedback,
                'month_feedback': month_feedback,
                'active_users': active_users
            })
        except Exception as e:
            logger.exception(f"管理员 {request.user.id} 获取反馈统计时发生错误")
            return Response(
                {'error': '获取反馈统计时发生内部错误'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
