from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.db.models import Q, F
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Category, Post, Comment, PostLike, CommentLike, PostView
from .serializers import (
    CategorySerializer,
    PostListSerializer,
    PostDetailSerializer,
    PostCreateUpdateSerializer,
    CommentSerializer,
    CommentCreateUpdateSerializer
)
from utils.permissions import IsOwnerOrReadOnly, IsOwnerOrAdmin
import logging

logger = logging.getLogger(__name__)


class CategoryListView(generics.ListAPIView):
    """分类列表视图"""
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class PostListView(generics.ListAPIView):
    """帖子列表视图"""
    serializer_class = PostListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Post.objects.filter(status='published').select_related('author', 'category')
        
        # 搜索功能
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        
        # 分类筛选
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        
        # 标签筛选
        tags = self.request.query_params.get('tags', None)
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            for tag in tag_list:
                queryset = queryset.filter(tags__icontains=tag)
        
        # 排序
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering in ['created_at', '-created_at', 'view_count', '-view_count', 'like_count', '-like_count']:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')
        
        # 置顶帖子优先
        queryset = queryset.order_by('-is_pinned', ordering)
        
        return queryset


class PostDetailView(generics.RetrieveAPIView):
    """帖子详情视图"""
    queryset = Post.objects.filter(status='published').select_related('author', 'category')
    serializer_class = PostDetailSerializer
    permission_classes = [permissions.AllowAny]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # 记录浏览量
        self._record_view(instance, request)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def _record_view(self, post, request):
        """记录帖子浏览"""
        user = request.user if request.user.is_authenticated else None
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # 检查是否已经记录过（同一用户或IP在短时间内的重复访问不重复计数）
        recent_view = PostView.objects.filter(
            post=post,
            created_at__gte=timezone.now() - timezone.timedelta(hours=1)
        )
        
        if user:
            recent_view = recent_view.filter(user=user)
        else:
            recent_view = recent_view.filter(ip_address=ip_address)
        
        if not recent_view.exists():
            PostView.objects.create(
                post=post,
                user=user,
                ip_address=ip_address,
                user_agent=user_agent
            )
            # 更新帖子浏览计数
            Post.objects.filter(id=post.id).update(view_count=F('view_count') + 1)
    
    def _get_client_ip(self, request):
        """获取客户端IP地址"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PostCreateView(generics.CreateAPIView):
    """创建帖子视图"""
    serializer_class = PostCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostUpdateView(generics.UpdateAPIView):
    """更新帖子视图"""
    queryset = Post.objects.all()
    serializer_class = PostCreateUpdateSerializer
    permission_classes = [IsOwnerOrAdmin]
    
    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj


class PostDeleteView(generics.DestroyAPIView):
    """删除帖子视图"""
    queryset = Post.objects.all()
    permission_classes = [IsOwnerOrAdmin]
    
    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj
    
    def perform_destroy(self, instance):
        try:
            instance.delete()
        except Exception as e:
            logger.error(f"删除帖子失败: {e}")
            return Response(
                {'error': '删除帖子失败，请稍后重试'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CommentListCreateView(generics.ListCreateAPIView):
    """评论列表和创建视图"""
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        return Comment.objects.filter(
            post_id=post_id, 
            parent_comment=None
        ).select_related('author').order_by('-created_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateUpdateSerializer
        return CommentSerializer
    
    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_id')
        post = get_object_or_404(Post, id=post_id, status='published')
        comment = serializer.save(author=self.request.user, post=post)
        
        # 更新帖子评论计数
        Post.objects.filter(id=post.id).update(comment_count=F('comment_count') + 1)


class CommentUpdateView(generics.UpdateAPIView):
    """更新评论视图"""
    queryset = Comment.objects.all()
    serializer_class = CommentCreateUpdateSerializer
    permission_classes = [IsOwnerOrAdmin]
    
    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj


class CommentDeleteView(generics.DestroyAPIView):
    """删除评论视图"""
    queryset = Comment.objects.all()
    permission_classes = [IsOwnerOrAdmin]
    
    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj
    
    def perform_destroy(self, instance):
        try:
            post = instance.post
            instance.delete()
            # 更新帖子评论计数
            Post.objects.filter(id=post.id).update(comment_count=F('comment_count') - 1)
        except Exception as e:
            logger.error(f"删除评论失败: {e}")
            return Response(
                {'error': '删除评论失败，请稍后重试'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_post_like(request, post_id):
    """切换帖子点赞状态"""
    try:
        post = get_object_or_404(Post, id=post_id, status='published')
        user = request.user
        
        like, created = PostLike.objects.get_or_create(post=post, user=user)
        
        if created:
            # 新增点赞
            Post.objects.filter(id=post.id).update(like_count=F('like_count') + 1)
            message = '点赞成功'
            is_liked = True
        else:
            # 取消点赞
            like.delete()
            Post.objects.filter(id=post.id).update(like_count=F('like_count') - 1)
            message = '取消点赞'
            is_liked = False
        
        # 获取更新后的点赞数
        post.refresh_from_db()
        
        return Response({
            'message': message,
            'is_liked': is_liked,
            'like_count': post.like_count
        })
    except Exception as e:
        logger.error(f"切换帖子点赞状态失败: {e}")
        return Response(
            {'error': '操作失败，请稍后重试'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_comment_like(request, comment_id):
    """切换评论点赞状态"""
    try:
        comment = get_object_or_404(Comment, id=comment_id)
        user = request.user
        
        like, created = CommentLike.objects.get_or_create(comment=comment, user=user)
        
        if created:
            # 新增点赞
            Comment.objects.filter(id=comment.id).update(like_count=F('like_count') + 1)
            message = '点赞成功'
            is_liked = True
        else:
            # 取消点赞
            like.delete()
            Comment.objects.filter(id=comment.id).update(like_count=F('like_count') - 1)
            message = '取消点赞'
            is_liked = False
        
        # 获取更新后的点赞数
        comment.refresh_from_db()
        
        return Response({
            'message': message,
            'is_liked': is_liked,
            'like_count': comment.like_count
        })
    except Exception as e:
        logger.error(f"切换评论点赞状态失败: {e}")
        return Response(
            {'error': '操作失败，请稍后重试'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_posts(request):
    """获取当前用户的帖子列表"""
    posts = Post.objects.filter(author=request.user).select_related('category').order_by('-created_at')
    serializer = PostListSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_comments(request):
    """获取当前用户的评论列表"""
    comments = Comment.objects.filter(author=request.user).select_related('post').order_by('-created_at')
    serializer = CommentSerializer(comments, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_popular_tags(request):
    """获取热门标签"""
    from django.db.models import Count
    from collections import Counter
    import re
    
    # 获取所有已发布帖子的标签
    posts = Post.objects.filter(status='published').values_list('tags', flat=True)
    all_tags = []
    
    for tags_str in posts:
        if tags_str:
            # 假设标签以逗号分隔
            tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()]
            all_tags.extend(tags)
    
    # 统计标签使用频率
    tag_counter = Counter(all_tags)
    popular_tags = [
        {'name': tag, 'count': count}
        for tag, count in tag_counter.most_common(20)
    ]
    
    return Response({
        'success': True,
        'data': popular_tags
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_community_stats(request):
    """获取社区统计数据"""
    from django.db.models import Count, Sum
    
    # 统计数据
    total_posts = Post.objects.filter(status='published').count()
    total_comments = Comment.objects.count()
    total_likes = PostLike.objects.count() + CommentLike.objects.count()
    total_views = PostView.objects.count()
    
    # 今日新增
    today = timezone.now().date()
    today_posts = Post.objects.filter(
        status='published',
        created_at__date=today
    ).count()
    
    today_comments = Comment.objects.filter(
        created_at__date=today
    ).count()
    
    # 活跃用户（最近7天有发帖或评论的用户）
    from django.contrib.auth import get_user_model
    User = get_user_model()
    week_ago = timezone.now() - timezone.timedelta(days=7)
    
    active_users = User.objects.filter(
        Q(posts__created_at__gte=week_ago) |
        Q(comments__created_at__gte=week_ago)
    ).distinct().count()
    
    stats = {
        'total_posts': total_posts,
        'total_comments': total_comments,
        'total_likes': total_likes,
        'total_views': total_views,
        'today_posts': today_posts,
        'today_comments': today_comments,
        'active_users': active_users,
    }
    
    return Response({
        'success': True,
        'data': stats
    })
