from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import FraudStatistics, UserAchievement, UserSkill
from .serializers import (
    FraudStatisticsSerializer,
    UserAchievementSerializer,
    UserSkillSerializer,
    FraudTypeDistributionSerializer,
    TacticFrequencySerializer,
    EmotionalTriggerSerializer,
    FraudFlowSerializer,
    FraudCasesYearlySerializer,
)


class PlatformStatisticsView(APIView):
    """平台级统计数据API"""

    permission_classes = [AllowAny]

    def get(self, request, format=None):
        """获取平台统计数据"""
        fraud_type_distribution = FraudTypeDistributionSerializer.get_data()
        tactic_frequency = TacticFrequencySerializer.get_data()
        emotional_triggers = EmotionalTriggerSerializer.get_data()
        fraud_flow = FraudFlowSerializer.get_data()
        fraud_cases_yearly = FraudCasesYearlySerializer.get_data()

        return Response(
            {
                "fraud_type_distribution": fraud_type_distribution,
                "tactic_frequency": tactic_frequency,
                "emotional_triggers": emotional_triggers,
                "fraud_flow": fraud_flow,
                "fraud_cases_yearly": fraud_cases_yearly,
            },
            status=status.HTTP_200_OK,
        )


class UserStatisticsView(APIView):
    """用户级统计数据API"""

    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        """获取用户统计数据"""
        user = request.user

        # 获取用户成就数据
        achievements = UserAchievement.objects.filter(user=user)
        if not achievements.exists():
            # 如果没有数据，创建示例数据
            achievement_types = [
                "学习成就",
                "模拟成就",
                "分享成就",
                "防骗实战",
                "知识掌握",
            ]
            for achievement_type in achievement_types:
                UserAchievement.objects.create(
                    user=user,
                    achievement_type=achievement_type,
                    progress=round(
                        30 + 70 * user.id % 100 / 100, 2
                    ),  # 生成30-100之间的随机值
                )
            achievements = UserAchievement.objects.filter(user=user)

        # 获取用户能力数据
        skills = UserSkill.objects.filter(user=user)
        if not skills.exists():
            # 如果没有数据，创建示例数据
            skill_types = [
                "信息识别能力",
                "情绪应对能力",
                "主动防御意识",
                "风险评估能力",
                "安全意识",
            ]
            for skill_type in skill_types:
                UserSkill.objects.create(
                    user=user,
                    skill_type=skill_type,
                    score=round(
                        40 + 60 * user.id % 100 / 100, 2
                    ),  # 生成40-100之间的随机值
                )
            skills = UserSkill.objects.filter(user=user)

        # 序列化数据
        achievement_data = UserAchievementSerializer(achievements, many=True).data
        skill_data = UserSkillSerializer(skills, many=True).data

        return Response(
            {"achievements": achievement_data, "skills": skill_data},
            status=status.HTTP_200_OK,
        )
