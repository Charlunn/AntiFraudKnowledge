# chatapi/urls.py
app_name = 'chat_api'  # 定义应用命名空间

from django.urls import path
from . import views

urlpatterns = [
    path('', views.chat_api_view, name='chat_api'),
]