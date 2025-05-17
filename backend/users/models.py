from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # 添加你的自定义字段
    user_type = models.CharField(max_length=20, default='normal') # 用户类型：admin 或 normal
    fraud_level = models.IntegerField(default=0) # 反诈等级
    phone_number = models.CharField(max_length=15, blank=True, null=True, unique=True) # 手机号
    nickname = models.CharField(max_length=100, blank=True, null=True) # 添加昵称字段
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True) # 添加头像字段
    # email 字段 AbstractUser 已经包含了

    # 可以添加其他需要的字段，比如头像等

    def __str__(self):
        return self.username
