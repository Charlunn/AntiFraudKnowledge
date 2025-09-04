"""
URL configuration for KnowledgeBackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings # 导入 settings
from django.conf.urls.static import static # 导入 static 函数
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger配置
schema_view = get_schema_view(
    openapi.Info(
        title="反诈骗知识平台 API",
        default_version='v1',
        description="反诈骗知识平台的API文档",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@antifraud.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Swagger文档路由
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # API路由
    path('api/graph/', include('graph_api.urls', namespace='graph_api')),  # 包含应用URL并指定命名空间
    path('api/chat/',include('chatapi.urls',namespace='chat_api')),
    path('api/users/', include('users.urls')),
    path('api/statistics/', include('stats.urls', namespace='stats')),  # 添加统计应用的URL路由
    path('api/achievements/', include('achievements.urls', namespace='achievements')),
    path('api/feedback/', include('feedback.urls', namespace='feedback')),
    path('api/quiz/', include('quiz.urls', namespace='quiz')),
    path('api/community/', include('community.urls', namespace='community')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)