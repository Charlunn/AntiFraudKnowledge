from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from .models import Notification, NotificationTemplate
from .serializers import (
    NotificationSerializer,
    NotificationCreateSerializer,
    NotificationUpdateSerializer,
    NotificationStatsSerializer,
    NotificationTemplateSerializer,
    BulkNotificationSerializer
)


class NotificationPagination(PageNumberPagination):
    """通知分页器"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationViewSet(ModelViewSet):
    """通知视图集"""
    
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NotificationPagination
    
    def get_queryset(self):
        """获取当前用户的通知"""
        queryset = Notification.objects.filter(user=self.request.user)
        
        # 过滤参数
        notification_type = self.request.query_params.get('type')
        is_read = self.request.query_params.get('is_read')
        priority = self.request.query_params.get('priority')
        
        if notification_type:
            queryset = queryset.filter(type=notification_type)
        
        if is_read is not None:
            is_read_bool = is_read.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_read=is_read_bool)
        
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # 排除过期的通知
        exclude_expired = self.request.query_params.get('exclude_expired', 'false')
        if exclude_expired.lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(
                Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
            )
        
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        """根据操作选择序列化器"""
        if self.action == 'create':
            return NotificationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return NotificationUpdateSerializer
        return NotificationSerializer
    
    def perform_create(self, serializer):
        """创建通知时设置用户"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """标记单个通知为已读"""
        notification = self.get_object()
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """标记所有通知为已读"""
        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'message': f'已标记 {updated_count} 条通知为已读',
            'updated_count': updated_count
        })
    
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """清空所有通知"""
        deleted_count, _ = Notification.objects.filter(
            user=request.user
        ).delete()
        
        return Response({
            'message': f'已删除 {deleted_count} 条通知',
            'deleted_count': deleted_count
        })
    
    @action(detail=False, methods=['delete'])
    def clear_read(self, request):
        """清空已读通知"""
        deleted_count, _ = Notification.objects.filter(
            user=request.user,
            is_read=True
        ).delete()
        
        return Response({
            'message': f'已删除 {deleted_count} 条已读通知',
            'deleted_count': deleted_count
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """获取通知统计信息"""
        user_notifications = Notification.objects.filter(user=request.user)
        
        total_count = user_notifications.count()
        unread_count = user_notifications.filter(is_read=False).count()
        read_count = total_count - unread_count
        
        # 按类型统计
        type_stats = dict(
            user_notifications.values('type').annotate(
                count=Count('id')
            ).values_list('type', 'count')
        )
        
        # 按优先级统计
        priority_stats = dict(
            user_notifications.values('priority').annotate(
                count=Count('id')
            ).values_list('priority', 'count')
        )
        
        stats_data = {
            'total_count': total_count,
            'unread_count': unread_count,
            'read_count': read_count,
            'type_stats': type_stats,
            'priority_stats': priority_stats,
        }
        
        serializer = NotificationStatsSerializer(stats_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """获取未读通知"""
        queryset = self.get_queryset().filter(is_read=False)
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class NotificationTemplateViewSet(ModelViewSet):
    """通知模板视图集"""
    
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        """获取模板列表"""
        queryset = super().get_queryset()
        
        # 过滤参数
        template_type = self.request.query_params.get('type')
        is_active = self.request.query_params.get('is_active')
        
        if template_type:
            queryset = queryset.filter(type=template_type)
        
        if is_active is not None:
            is_active_bool = is_active.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_active=is_active_bool)
        
        return queryset


class BulkNotificationView(APIView):
    """批量通知视图"""
    
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        """批量发送通知"""
        serializer = BulkNotificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        user_ids = data.get('user_ids')
        template_name = data.get('template_name')
        context = data.get('context', {})
        
        # 获取目标用户
        if user_ids:
            users = User.objects.filter(id__in=user_ids)
        else:
            users = User.objects.filter(is_active=True)
        
        notifications_created = 0
        
        # 使用模板
        if template_name:
            try:
                template = NotificationTemplate.objects.get(
                    name=template_name,
                    is_active=True
                )
                rendered = template.render(context)
                
                notifications = [
                    Notification(
                        user=user,
                        type=rendered['type'],
                        title=rendered['title'],
                        message=rendered['message'],
                        priority=rendered['priority'],
                        action_url=rendered.get('action_url'),
                        expires_at=data.get('expires_at')
                    )
                    for user in users
                ]
                
            except NotificationTemplate.DoesNotExist:
                return Response(
                    {'error': f'模板 "{template_name}" 不存在或未启用'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # 直接使用提供的内容
        else:
            notifications = [
                Notification(
                    user=user,
                    type=data.get('type', 'system'),
                    title=data['title'],
                    message=data['message'],
                    priority=data.get('priority', 'normal'),
                    action_url=data.get('action_url'),
                    expires_at=data.get('expires_at')
                )
                for user in users
            ]
        
        # 批量创建通知
        Notification.objects.bulk_create(notifications)
        notifications_created = len(notifications)
        
        return Response({
            'message': f'成功发送 {notifications_created} 条通知',
            'notifications_created': notifications_created,
            'target_users': users.count()
        })


class NotificationCountView(APIView):
    """通知数量视图"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """获取未读通知数量"""
        unread_count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        return Response({
            'unread_count': unread_count
        })