from django.urls import path
from . import views

app_name = 'community'

urlpatterns = [
    # 分类相关
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # 帖子相关
    path('posts/', views.PostListView.as_view(), name='post-list'),
    path('posts/create/', views.PostCreateView.as_view(), name='post-create'),
    path('posts/<int:pk>/', views.PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:pk>/update/', views.PostUpdateView.as_view(), name='post-update'),
    path('posts/<int:pk>/delete/', views.PostDeleteView.as_view(), name='post-delete'),
    path('posts/<int:post_id>/like/', views.toggle_post_like, name='post-like'),
    
    # 评论相关
    path('posts/<int:post_id>/comments/', views.CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/update/', views.CommentUpdateView.as_view(), name='comment-update'),
    path('comments/<int:pk>/delete/', views.CommentDeleteView.as_view(), name='comment-delete'),
    path('comments/<int:comment_id>/like/', views.toggle_comment_like, name='comment-like'),
    
    # 用户相关
    path('my-posts/', views.my_posts, name='my-posts'),
    path('my-comments/', views.my_comments, name='my-comments'),
]