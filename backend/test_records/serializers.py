from rest_framework import serializers
from .models import TestRecord
from django.contrib.auth import get_user_model

User = get_user_model()

class TestRecordSerializer(serializers.ModelSerializer):
    """测试记录序列化器"""
    
    performance_level = serializers.ReadOnlyField()
    duration_estimate = serializers.ReadOnlyField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = TestRecord
        fields = [
            'id', 'user', 'user_username', 'scenario_type', 'difficulty', 'mode',
            'score', 'conversation_rounds', 'end_reason', 'report_data',
            'completed_at', 'created_at', 'performance_level', 'duration_estimate'
        ]
        read_only_fields = ['id', 'user', 'created_at']
    
    def create(self, validated_data):
        # 自动设置当前用户
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class TestRecordListSerializer(serializers.ModelSerializer):
    """测试记录列表序列化器（简化版）"""
    
    performance_level = serializers.ReadOnlyField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = TestRecord
        fields = [
            'id', 'user_username', 'scenario_type', 'difficulty', 'mode',
            'score', 'conversation_rounds', 'end_reason', 'completed_at',
            'performance_level'
        ]

class TestRecordStatsSerializer(serializers.Serializer):
    """测试记录统计序列化器"""
    
    total_tests = serializers.IntegerField()
    average_score = serializers.FloatField()
    best_score = serializers.IntegerField()
    total_rounds = serializers.IntegerField()
    difficulty_stats = serializers.DictField()
    scenario_stats = serializers.DictField()
    recent_tests = TestRecordListSerializer(many=True)