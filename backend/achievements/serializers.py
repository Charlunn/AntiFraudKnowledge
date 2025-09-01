from rest_framework import serializers
from .models import Achievement, UserAchievement


class AchievementSerializer(serializers.ModelSerializer):
    achieved_at = serializers.DateTimeField(source='userachievement.achieved_at', read_only=True)

    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'achieved_at']
