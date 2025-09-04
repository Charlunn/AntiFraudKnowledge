from rest_framework import serializers
from .models import Feedback
from django.contrib.auth import get_user_model

User = get_user_model()


class FeedbackSerializer(serializers.ModelSerializer):
    """用户创建反馈的序列化器"""
    class Meta:
        model = Feedback
        fields = ['id', 'message', 'image', 'contact', 'created_at']
        read_only_fields = ['id', 'created_at']


class AdminFeedbackSerializer(serializers.ModelSerializer):
    """管理员查看反馈的序列化器（包含用户信息）"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'user', 'user_username', 'user_email', 
            'message', 'image', 'contact', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'user_username', 'user_email', 'created_at']


class FeedbackDetailSerializer(serializers.ModelSerializer):
    """反馈详情序列化器"""
    user_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Feedback
        fields = ['id', 'user_info', 'message', 'image', 'contact', 'created_at']
        read_only_fields = ['id', 'user_info', 'created_at']
    
    def get_user_info(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email
        }
