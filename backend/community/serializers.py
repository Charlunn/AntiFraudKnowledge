from rest_framework import serializers
from .models import Category, Post, Comment, PostLike, CommentLike, PostView
from users.serializers import UserProfileSerializer
from users.models import CustomUser


class CategorySerializer(serializers.ModelSerializer):
    """分类序列化器"""
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class AuthorSerializer(serializers.ModelSerializer):
    """作者信息序列化器"""
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'nickname', 'avatar']
        read_only_fields = ['id', 'username', 'nickname', 'avatar']


class CommentSerializer(serializers.ModelSerializer):
    """评论序列化器"""
    author = AuthorSerializer(read_only=True)
    parent_comment = serializers.PrimaryKeyRelatedField(
        queryset=Comment.objects.all(), 
        required=False, 
        allow_null=True
    )
    replies = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'author', 'post', 'parent_comment', 
            'like_count', 'created_at', 'updated_at', 'replies', 'is_liked'
        ]
        read_only_fields = ['id', 'author', 'like_count', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        """获取回复评论"""
        if hasattr(obj, 'replies'):
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []
    
    def get_is_liked(self, obj):
        """检查当前用户是否点赞了该评论"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return CommentLike.objects.filter(comment=obj, user=request.user).exists()
        return False


class PostListSerializer(serializers.ModelSerializer):
    """帖子列表序列化器（简化版）"""
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    content_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content_preview', 'author', 'category', 
            'status', 'view_count', 'like_count', 'comment_count',
            'created_at', 'updated_at', 'is_pinned', 'is_featured',
            'tags', 'is_liked'
        ]
        read_only_fields = [
            'id', 'author', 'view_count', 'like_count', 'comment_count',
            'created_at', 'updated_at'
        ]
    
    def get_content_preview(self, obj):
        """获取内容预览（前100个字符）"""
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    
    def get_is_liked(self, obj):
        """检查当前用户是否点赞了该帖子"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostLike.objects.filter(post=obj, user=request.user).exists()
        return False


class PostDetailSerializer(serializers.ModelSerializer):
    """帖子详情序列化器"""
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    comments = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'author', 'category', 
            'status', 'view_count', 'like_count', 'comment_count',
            'created_at', 'updated_at', 'is_pinned', 'is_featured',
            'tags', 'comments', 'is_liked'
        ]
        read_only_fields = [
            'id', 'author', 'view_count', 'like_count', 'comment_count',
            'created_at', 'updated_at'
        ]
    
    def get_comments(self, obj):
        """获取帖子的顶级评论"""
        top_level_comments = obj.comments.filter(parent_comment=None).order_by('-created_at')
        return CommentSerializer(top_level_comments, many=True, context=self.context).data
    
    def get_is_liked(self, obj):
        """检查当前用户是否点赞了该帖子"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostLike.objects.filter(post=obj, user=request.user).exists()
        return False


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    """帖子创建和更新序列化器"""
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    
    class Meta:
        model = Post
        fields = ['title', 'content', 'category', 'tags', 'status']
    
    def validate_title(self, value):
        """验证标题"""
        if len(value.strip()) < 5:
            raise serializers.ValidationError("标题至少需要5个字符")
        return value.strip()
    
    def validate_content(self, value):
        """验证内容"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("内容至少需要10个字符")
        return value.strip()


class CommentCreateUpdateSerializer(serializers.ModelSerializer):
    """评论创建和更新序列化器"""
    parent_comment = serializers.PrimaryKeyRelatedField(
        queryset=Comment.objects.all(), 
        required=False, 
        allow_null=True
    )
    
    class Meta:
        model = Comment
        fields = ['content', 'post', 'parent_comment']
    
    def validate_content(self, value):
        """验证评论内容"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("评论内容至少需要2个字符")
        return value.strip()
    
    def validate(self, data):
        """验证评论数据"""
        post = data.get('post')
        parent_comment = data.get('parent_comment')
        
        # 如果是回复评论，确保父评论属于同一个帖子
        if parent_comment and parent_comment.post != post:
            raise serializers.ValidationError("回复的评论必须属于同一个帖子")
        
        return data