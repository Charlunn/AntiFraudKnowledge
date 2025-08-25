# backend/graph_api/urls.py
from django.urls import path
from . import views

# 定义 URL 模式列表
# graph_api/urls.py

from django.urls import path
from . import views

app_name = "graph_api"  # 定义应用命名空间


urlpatterns = [
    path("initial/", views.InitialGraphView.as_view(), name="initial-graph"),
    path("filtered/", views.FilteredGraphView.as_view(), name="filtered-graph"),
    path("nodes/<str:node_id>/", views.NodeDetailView.as_view(), name="node-detail"),
]
