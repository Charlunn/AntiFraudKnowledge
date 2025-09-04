# backend/graph_api/urls.py
from django.urls import path
from .views import (
    InitialGraphView, FilteredGraphView, NodeDetailView,
    NodeCRUDView, RelationshipCRUDView, GraphAnalysisView,
    GraphStatisticsView, ComplexQueryView
)

app_name = 'graph_api'

urlpatterns = [
    # 原有的基础视图
    path('initial/', InitialGraphView.as_view(), name='initial_graph'),
    path('filtered/', FilteredGraphView.as_view(), name='filtered_graph'),
    path('node/<str:node_id>/', NodeDetailView.as_view(), name='node_detail'),
    
    # 节点和关系的CRUD操作
    path('nodes/', NodeCRUDView.as_view(), name='node_crud'),
    path('relationships/', RelationshipCRUDView.as_view(), name='relationship_crud'),
    
    # 高级图分析功能
    path('analysis/', GraphAnalysisView.as_view(), name='graph_analysis'),
    
    # 数据统计功能
    path('statistics/', GraphStatisticsView.as_view(), name='graph_statistics'),
    
    # 复杂查询功能
    path('query/', ComplexQueryView.as_view(), name='complex_query'),
]
