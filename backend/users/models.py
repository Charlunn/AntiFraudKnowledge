from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    user_type = models.CharField(max_length=20, default='normal')
    fraud_level = models.IntegerField(default=0)
    phone_number = models.CharField(max_length=15, blank=True, null=True, unique=True)
    nickname = models.CharField(max_length=100, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    language = models.CharField(max_length=10, default='en')
    theme = models.CharField(max_length=10, default='light')
    
    # 通知设置
    email_notifications = models.BooleanField(default=True)  # 邮件通知
    push_notifications = models.BooleanField(default=True)   # 推送通知
    sms_notifications = models.BooleanField(default=False)   # 短信通知
    marketing_emails = models.BooleanField(default=False)    # 营销邮件
    security_alerts = models.BooleanField(default=True)      # 安全警报
    
    # 隐私设置
    profile_visibility = models.CharField(max_length=20, default='public', choices=[
        ('public', '公开'),
        ('friends', '仅好友'),
        ('private', '私密')
    ])
    show_email = models.BooleanField(default=False)          # 显示邮箱
    show_phone = models.BooleanField(default=False)          # 显示手机号
    allow_friend_requests = models.BooleanField(default=True) # 允许好友请求
    show_online_status = models.BooleanField(default=True)    # 显示在线状态

    def __str__(self):
        return self.username
