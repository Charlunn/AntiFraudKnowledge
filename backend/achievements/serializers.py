from rest_framework import serializers
from .models import Achievement, UserAchievement


class AchievementSerializer(serializers.ModelSerializer):
    """成就序列化器"""
    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description']


class UserAchievementSerializer(serializers.ModelSerializer):
    """用户成就序列化器"""
    achievement = AchievementSerializer(read_only=True)
    achievement_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = UserAchievement
        fields = ['id', 'achievement', 'achievement_id', 'achieved_at']
        read_only_fields = ['achieved_at']


class AchievementWithStatusSerializer(serializers.ModelSerializer):
    """带有用户完成状态的成就序列化器"""
    is_achieved = serializers.SerializerMethodField()
    achieved_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'is_achieved', 'achieved_at']
    
    def get_is_achieved(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return UserAchievement.objects.filter(user=user, achievement=obj).exists()
        return False
    
    def get_achieved_at(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            user_achievement = UserAchievement.objects.filter(user=user, achievement=obj).first()
            return user_achievement.achieved_at if user_achievement else None
        return None
