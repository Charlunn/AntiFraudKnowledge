from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone


class Notification(models.Model):
    """通知模型"""
    
    # 通知类型选择
    TYPE_CHOICES = [
        ('system', '系统通知'),
        ('achievement', '成就通知'),
        ('reminder', '学习提醒'),
        ('social', '社区消息'),
        ('quiz', '测验通知'),
        ('security', '安全提醒'),
    ]
    
    # 优先级选择
    PRIORITY_CHOICES = [
        ('low', '低'),
        ('normal', '普通'),
        ('high', '高'),
        ('urgent', '紧急'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications',
        verbose_name='用户'
    )
    
    type = models.CharField(
        max_length=20, 
        choices=TYPE_CHOICES, 
        default='system',
        verbose_name='通知类型'
    )
    
    title = models.CharField(
        max_length=200, 
        verbose_name='标题'
    )
    
    message = models.TextField(
        verbose_name='消息内容'
    )
    
    priority = models.CharField(
        max_length=10, 
        choices=PRIORITY_CHOICES, 
        default='normal',
        verbose_name='优先级'
    )
    
    is_read = models.BooleanField(
        default=False, 
        verbose_name='是否已读'
    )
    
    action_url = models.URLField(
        blank=True, 
        null=True, 
        verbose_name='操作链接'
    )
    
    # 元数据字段
    metadata = models.JSONField(
        default=dict, 
        blank=True, 
        verbose_name='元数据'
    )
    
    created_at = models.DateTimeField(
        default=timezone.now, 
        verbose_name='创建时间'
    )
    
    read_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name='阅读时间'
    )
    
    expires_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name='过期时间'
    )
    
    class Meta:
        db_table = 'notifications'
        verbose_name = '通知'
        verbose_name_plural = '通知'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['type', '-created_at']),
        ]
    
    def __str__(self):
        return f'{self.user.username} - {self.title}'
    
    def mark_as_read(self):
        """标记为已读"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def is_expired(self):
        """检查是否过期"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    @property
    def time_since_created(self):
        """获取创建时间距现在的时长"""
        now = timezone.now()
        diff = now - self.created_at
        
        if diff.days > 0:
            return f'{diff.days}天前'
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f'{hours}小时前'
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f'{minutes}分钟前'
        else:
            return '刚刚'


class NotificationTemplate(models.Model):
    """通知模板模型"""
    
    name = models.CharField(
        max_length=100, 
        unique=True, 
        verbose_name='模板名称'
    )
    
    type = models.CharField(
        max_length=20, 
        choices=Notification.TYPE_CHOICES,
        verbose_name='通知类型'
    )
    
    title_template = models.CharField(
        max_length=200, 
        verbose_name='标题模板'
    )
    
    message_template = models.TextField(
        verbose_name='消息模板'
    )
    
    priority = models.CharField(
        max_length=10, 
        choices=Notification.PRIORITY_CHOICES, 
        default='normal',
        verbose_name='优先级'
    )
    
    action_url_template = models.CharField(
        max_length=500, 
        blank=True, 
        verbose_name='操作链接模板'
    )
    
    is_active = models.BooleanField(
        default=True, 
        verbose_name='是否启用'
    )
    
    created_at = models.DateTimeField(
        default=timezone.now, 
        verbose_name='创建时间'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True, 
        verbose_name='更新时间'
    )
    
    class Meta:
        db_table = 'notification_templates'
        verbose_name = '通知模板'
        verbose_name_plural = '通知模板'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def render(self, context=None):
        """渲染模板"""
        if context is None:
            context = {}
        
        title = self.title_template.format(**context)
        message = self.message_template.format(**context)
        action_url = self.action_url_template.format(**context) if self.action_url_template else None
        
        return {
            'title': title,
            'message': message,
            'action_url': action_url,
            'type': self.type,
            'priority': self.priority,
        }