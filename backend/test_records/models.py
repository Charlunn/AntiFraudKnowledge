from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import json

User = get_user_model()

class TestRecord(models.Model):
    """测试记录模型"""
    
    DIFFICULTY_CHOICES = [
        ('easy', '简单'),
        ('medium', '中等'),
        ('hard', '困难'),
    ]
    
    MODE_CHOICES = [
        ('mixed', '真假混合'),
        ('fake_only', '纯假学习'),
    ]
    
    END_REASON_CHOICES = [
        ('score_too_low', '分数过低'),
        ('perfect_score', '满分'),
        ('max_rounds', '达到最大轮次'),
        ('manual_end', '手动结束'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='test_records', verbose_name='用户')
    scenario_type = models.CharField(max_length=100, verbose_name='场景类型')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, verbose_name='难度')
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, verbose_name='模式')
    score = models.IntegerField(verbose_name='最终得分')
    conversation_rounds = models.IntegerField(verbose_name='对话轮次')
    end_reason = models.CharField(max_length=20, choices=END_REASON_CHOICES, verbose_name='结束原因')
    report_data = models.JSONField(verbose_name='报告数据', help_text='包含标题、消息、建议和对话记录')
    completed_at = models.DateTimeField(verbose_name='完成时间')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    
    class Meta:
        verbose_name = '测试记录'
        verbose_name_plural = '测试记录'
        ordering = ['-completed_at']
    
    def __str__(self):
        return f'{self.user.username} - {self.scenario_type} ({self.get_difficulty_display()}) - {self.score}分'
    
    @property
    def performance_level(self):
        """根据分数返回表现等级"""
        if self.score >= 90:
            return '优秀'
        elif self.score >= 70:
            return '良好'
        elif self.score >= 50:
            return '一般'
        else:
            return '需要改进'
    
    @property
    def duration_estimate(self):
        """估算对话持续时间（基于轮次）"""
        # 假设每轮对话平均2分钟
        return self.conversation_rounds * 2
