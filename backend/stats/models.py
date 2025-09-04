from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class FraudStatistics(models.Model):
    """全局诈骗统计数据"""
    year = models.IntegerField(verbose_name="年份")
    reported_cases = models.IntegerField(verbose_name="报案数量")
    filed_cases = models.IntegerField(verbose_name="立案数量")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")

    class Meta:
        verbose_name = "诈骗统计数据"
        verbose_name_plural = "诈骗统计数据"
        ordering = ['year']

    def __str__(self):
        return f"{self.year}年统计数据"


class UserAchievement(models.Model):
    """用户成就"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="achievements", verbose_name="用户")
    achievement_type = models.CharField(max_length=50, verbose_name="成就类型")  # 学习成就、模拟成就、分享成就等
    progress = models.FloatField(default=0, verbose_name="完成度")  # 0-100的百分比
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")

    class Meta:
        verbose_name = "用户成就"
        verbose_name_plural = "用户成就"
        unique_together = ['user', 'achievement_type']

    def __str__(self):
        return f"{self.user.username} - {self.achievement_type} - {self.progress}%"


class UserSkill(models.Model):
    """用户防骗能力"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="skills", verbose_name="用户")
    skill_type = models.CharField(max_length=50, verbose_name="能力类型")  # 信息识别能力、情绪应对能力、主动防御意识等
    score = models.FloatField(default=0, verbose_name="得分")  # 0-100的分数
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")

    class Meta:
        verbose_name = "用户能力"
        verbose_name_plural = "用户能力"
        unique_together = ['user', 'skill_type']

    def __str__(self):
        return f"{self.user.username} - {self.skill_type} - {self.score}分" 