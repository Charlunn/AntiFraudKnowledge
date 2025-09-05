from rest_framework import serializers
from .models import Notification, NotificationTemplate


class NotificationSerializer(serializers.ModelSerializer):
    """通知序列化器"""
    
    time_since_created = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'message', 'priority', 
            'is_read', 'action_url', 'metadata', 'created_at', 
            'read_at', 'expires_at', 'time_since_created', 'is_expired'
        ]
        read_only_fields = ['id', 'created_at', 'read_at', 'time_since_created', 'is_expired']
    
    def to_representation(self, instance):
        """自定义序列化输出"""
        data = super().to_representation(instance)
        
        # 格式化时间字段
        if data['created_at']:
            data['created_at'] = instance.created_at.isoformat()
        if data['read_at']:
            data['read_at'] = instance.read_at.isoformat()
        if data['expires_at']:
            data['expires_at'] = instance.expires_at.isoformat()
        
        return data


class NotificationCreateSerializer(serializers.ModelSerializer):
    """创建通知序列化器"""
    
    class Meta:
        model = Notification
        fields = [
            'type', 'title', 'message', 'priority', 
            'action_url', 'metadata', 'expires_at'
        ]
    
    def create(self, validated_data):
        """创建通知"""
        # 从上下文中获取用户
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """更新通知序列化器"""
    
    class Meta:
        model = Notification
        fields = ['is_read']
    
    def update(self, instance, validated_data):
        """更新通知状态"""
        if validated_data.get('is_read') and not instance.is_read:
            instance.mark_as_read()
        return instance


class NotificationStatsSerializer(serializers.Serializer):
    """通知统计序列化器"""
    
    total_count = serializers.IntegerField()
    unread_count = serializers.IntegerField()
    read_count = serializers.IntegerField()
    type_stats = serializers.DictField()
    priority_stats = serializers.DictField()


class NotificationTemplateSerializer(serializers.ModelSerializer):
    """通知模板序列化器"""
    
    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'name', 'type', 'title_template', 'message_template',
            'priority', 'action_url_template', 'is_active', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BulkNotificationSerializer(serializers.Serializer):
    """批量通知序列化器"""
    
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="用户ID列表，不提供则发送给所有用户"
    )
    
    template_name = serializers.CharField(
        max_length=100,
        required=False,
        help_text="模板名称"
    )
    
    type = serializers.ChoiceField(
        choices=Notification.TYPE_CHOICES,
        required=False
    )
    
    title = serializers.CharField(
        max_length=200,
        required=False
    )
    
    message = serializers.CharField(
        required=False
    )
    
    priority = serializers.ChoiceField(
        choices=Notification.PRIORITY_CHOICES,
        default='normal'
    )
    
    action_url = serializers.URLField(
        required=False
    )
    
    context = serializers.DictField(
        required=False,
        help_text="模板渲染上下文"
    )
    
    expires_at = serializers.DateTimeField(
        required=False
    )
    
    def validate(self, data):
        """验证数据"""
        template_name = data.get('template_name')
        title = data.get('title')
        message = data.get('message')
        
        if not template_name and (not title or not message):
            raise serializers.ValidationError(
                "必须提供模板名称或者标题和消息内容"
            )
        
        return data