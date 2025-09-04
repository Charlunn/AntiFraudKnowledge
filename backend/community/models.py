from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Category(models.Model):
    """帖子分类模型"""
    name = models.CharField(max_length=50, unique=True, verbose_name='分类名称')
    description = models.TextField(blank=True, verbose_name='分类描述')
    icon = models.CharField(max_length=50, blank=True, verbose_name='图标')
    color = models.CharField(max_length=7, default='#007bff', verbose_name='颜色')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    
    class Meta:
        verbose_name = '帖子分类'
        verbose_name_plural = '帖子分类'
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Post(models.Model):
    """帖子模型"""
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('published', '已发布'),
        ('hidden', '已隐藏'),
        ('deleted', '已删除'),
    ]
    
    title = models.CharField(max_length=200, verbose_name='标题')
    content = models.TextField(verbose_name='内容')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts', verbose_name='作者')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts', verbose_name='分类')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published', verbose_name='状态')
    
    # 统计字段
    view_count = models.PositiveIntegerField(default=0, verbose_name='浏览次数')
    like_count = models.PositiveIntegerField(default=0, verbose_name='点赞数')
    comment_count = models.PositiveIntegerField(default=0, verbose_name='评论数')
    
    # 时间字段
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    # 置顶和推荐
    is_pinned = models.BooleanField(default=False, verbose_name='是否置顶')
    is_featured = models.BooleanField(default=False, verbose_name='是否推荐')
    
    # 标签
    tags = models.CharField(max_length=200, blank=True, verbose_name='标签')
    
    class Meta:
        verbose_name = '帖子'
        verbose_name_plural = '帖子'
        ordering = ['-is_pinned', '-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return self.title
    
    def get_tags_list(self):
        """获取标签列表"""
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
        return []

class Comment(models.Model):
    """评论模型"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments', verbose_name='帖子')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments', verbose_name='作者')
    content = models.TextField(verbose_name='内容')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name='父评论')
    
    # 统计字段
    like_count = models.PositiveIntegerField(default=0, verbose_name='点赞数')
    
    # 时间字段
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    # 状态
    is_deleted = models.BooleanField(default=False, verbose_name='是否删除')
    
    class Meta:
        verbose_name = '评论'
        verbose_name_plural = '评论'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', 'created_at']),
        ]
    
    def __str__(self):
        return f'{self.author.username} - {self.content[:50]}'

class PostLike(models.Model):
    """帖子点赞模型"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes', verbose_name='帖子')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_likes', verbose_name='用户')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='点赞时间')
    
    class Meta:
        verbose_name = '帖子点赞'
        verbose_name_plural = '帖子点赞'
        unique_together = ['post', 'user']
    
    def __str__(self):
        return f'{self.user.username} - {self.post.title}'

class CommentLike(models.Model):
    """评论点赞模型"""
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes', verbose_name='评论')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comment_likes', verbose_name='用户')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='点赞时间')
    
    class Meta:
        verbose_name = '评论点赞'
        verbose_name_plural = '评论点赞'
        unique_together = ['comment', 'user']
    
    def __str__(self):
        return f'{self.user.username} - {self.comment.content[:30]}'

class PostView(models.Model):
    """帖子浏览记录模型"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='views', verbose_name='帖子')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='post_views', verbose_name='用户')
    ip_address = models.GenericIPAddressField(verbose_name='IP地址')
    user_agent = models.TextField(blank=True, verbose_name='用户代理')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='浏览时间')
    
    class Meta:
        verbose_name = '帖子浏览记录'
        verbose_name_plural = '帖子浏览记录'
        indexes = [
            models.Index(fields=['post', 'created_at']),
        ]
    
    def __str__(self):
        return f'{self.post.title} - {self.ip_address}'
