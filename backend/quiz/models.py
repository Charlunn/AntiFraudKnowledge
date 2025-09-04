from django.conf import settings
from django.db import models


class Question(models.Model):
    LEVEL_CHOICES = [
        ('beginner', '初级'),
        ('intermediate', '中级'),
        ('advanced', '高级'),
    ]
    
    ANSWER_CHOICES = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
    ]
    
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    text = models.TextField()
    option_a = models.CharField(max_length=500)
    option_b = models.CharField(max_length=500)
    option_c = models.CharField(max_length=500)
    option_d = models.CharField(max_length=500)
    correct_answer = models.CharField(max_length=1, choices=ANSWER_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.get_level_display()}] {self.text[:50]}..."


class QuizAttempt(models.Model):
    LEVEL_CHOICES = [
        ('beginner', '初级'),
        ('intermediate', '中级'),
        ('advanced', '高级'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    score = models.IntegerField()  # 百分制分数
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_level_display()}: {self.score}分 ({self.correct_answers}/{self.total_questions})"
    
    @property
    def accuracy(self):
        """计算准确率"""
        if self.total_questions == 0:
            return 0
        return round((self.correct_answers / self.total_questions) * 100, 2)
