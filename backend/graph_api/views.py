from django.shortcuts import render

# Create your views here.
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from neo4j.exceptions import ServiceUnavailable, CypherSyntaxError, Neo4jError
from typing import Dict, Any, List, Optional

from . import db_utils
from . import cypher_queries
from .db_utils import (
    read_from_neo4j, 
    write_to_neo4j, 
    batch_write_to_neo4j,
    execute_transaction,
    validate_node_exists,
    validate_relationship_exists,
    create_graph_projection,
    drop_graph_projection
)
from .cypher_queries import (
    # 基础查询
    GET_INITIAL_GRAPH_CYPHER,
    GET_FILTERED_GRAPH_CYPHER,
    GET_NODE_DETAIL_CYPHER,
    # 节点CRUD
    CREATE_NODE_CYPHER,
    GET_NODE_BY_ID_CYPHER,
    GET_NODES_BY_PROPERTY_CYPHER,
    GET_NODES_BY_LABEL_CYPHER,
    UPDATE_NODE_CYPHER,
    DELETE_NODE_CYPHER,
    BATCH_DELETE_NODES_CYPHER,
    # 关系CRUD
    CREATE_RELATIONSHIP_CYPHER,
    GET_RELATIONSHIP_BY_ID_CYPHER,
    GET_RELATIONSHIPS_BETWEEN_NODES_CYPHER,
    GET_NODE_RELATIONSHIPS_CYPHER,
    UPDATE_RELATIONSHIP_CYPHER,
    DELETE_RELATIONSHIP_CYPHER,
    # 高级分析
    SHORTEST_PATH_CYPHER,
    ALL_PATHS_CYPHER,
    K_HOP_NEIGHBORS_CYPHER,
    DEGREE_CENTRALITY_CYPHER,
    BETWEENNESS_CENTRALITY_CYPHER,
    PAGERANK_CYPHER,
    COMMUNITY_DETECTION_LOUVAIN_CYPHER,
    COMMUNITY_DETECTION_LPA_CYPHER,
    TRIANGLE_COUNT_CYPHER,
    CLUSTERING_COEFFICIENT_CYPHER,
    # 统计查询
    NODE_TYPE_DISTRIBUTION_CYPHER,
    RELATIONSHIP_TYPE_DISTRIBUTION_CYPHER,
    GRAPH_BASIC_STATS_CYPHER,
    NODE_DEGREE_DISTRIBUTION_CYPHER,
    CONNECTED_COMPONENTS_CYPHER,
    # 复杂查询
    TIME_RANGE_FILTER_CYPHER,
    PROPERTY_FILTER_CYPHER,
    MULTI_HOP_QUERY_CYPHER,
    COMPLEX_FILTER_QUERY_CYPHER
)
from . import serializers

logger = logging.getLogger(__name__)


# ==================== 基础视图类 ====================

class BaseGraphAPIView(APIView):
    """
    图数据库API的基础视图类，提供通用的错误处理和权限控制
    """
    permission_classes = [IsAuthenticated]
    
    def handle_exception(self, exc):
        """
        统一的异常处理
        """
        if isinstance(exc, ServiceUnavailable):
            logger.error(f"Neo4j服务不可用: {exc}")
            return Response(
                {'error': 'Neo4j数据库服务不可用，请稍后重试'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        elif isinstance(exc, CypherSyntaxError):
            logger.error(f"Cypher语法错误: {exc}")
            return Response(
                {'error': 'Cypher查询语法错误'},
                status=status.HTTP_400_BAD_REQUEST
            )
        elif isinstance(exc, Neo4jError):
            logger.error(f"Neo4j错误: {exc}")
            return Response(
                {'error': f'Neo4j数据库错误: {str(exc)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        else:
            logger.error(f"未知错误: {exc}")
            return super().handle_exception(exc)


# ==================== 节点 CRUD 操作视图 ====================

class NodeCRUDView(BaseGraphAPIView):
    """
    节点的增删改查操作视图
    """
    
    def post(self, request):
        """
        创建新节点
        
        请求体:
        {
            "label": "User",
            "properties": {
                "name": "张三",
                "age": 30,
                "email": "zhangsan@example.com"
            }
        }
        """
        try:
            label = request.data.get('label')
            properties = request.data.get('properties', {})
            
            if not label:
                return Response(
                    {'error': 'Label is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 构建动态Cypher查询
            cypher_query = f"CREATE (n:{label} $properties) RETURN n"
            
            results, summary = write_to_neo4j(cypher_query, {'properties': properties})
            
            logger.info(f"用户 {request.user.id} 创建节点成功: {summary}")
            return Response({
                'message': 'Node created successfully',
                'data': results,
                'summary': summary
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"创建节点失败: {e}")
            return Response(
                {'error': 'Failed to create node', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request):
        """
        获取节点信息
        
        查询参数:
        - node_id: 节点ID
        - label: 节点标签
        - property: 属性名
        - value: 属性值
        - limit: 结果限制数量
        """
        try:
            node_id = request.query_params.get('node_id')
            label = request.query_params.get('label')
            property_name = request.query_params.get('property')
            property_value = request.query_params.get('value')
            limit = int(request.query_params.get('limit', 50))
            
            if node_id:
                # 根据ID获取节点
                results = read_from_neo4j(GET_NODE_BY_ID_CYPHER, {'node_id': node_id})
            elif label and property_name and property_value:
                # 根据属性获取节点
                cypher_query = f"MATCH (n:{label}) WHERE n.{property_name} = $value RETURN n LIMIT $limit"
                results = read_from_neo4j(cypher_query, {
                    'value': property_value,
                    'limit': limit
                })
            elif label:
                # 根据标签获取节点
                cypher_query = f"MATCH (n:{label}) RETURN n LIMIT $limit"
                results = read_from_neo4j(cypher_query, {'limit': limit})
            else:
                return Response(
                    {'error': 'node_id or label is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"用户 {request.user.id} 获取节点信息成功")
            return Response({
                'message': 'Nodes retrieved successfully',
                'data': results,
                'count': len(results)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"获取节点信息失败: {e}")
            return Response(
                {'error': 'Failed to retrieve nodes', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request):
        """
        更新节点属性
        
        请求体:
        {
            "node_id": "node_element_id",
            "properties": {
                "name": "李四",
                "age": 25
            }
        }
        """
        try:
            node_id = request.data.get('node_id')
            properties = request.data.get('properties', {})
            
            if not node_id:
                return Response(
                    {'error': 'node_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not validate_node_exists(node_id):
                return Response(
                    {'error': 'Node not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            results, summary = write_to_neo4j(UPDATE_NODE_CYPHER, {
                'node_id': node_id,
                'properties': properties
            })
            
            logger.info(f"用户 {request.user.id} 更新节点成功: {summary}")
            return Response({
                'message': 'Node updated successfully',
                'data': results,
                'summary': summary
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"更新节点失败: {e}")
            return Response(
                {'error': 'Failed to update node', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request):
        """
        删除节点
        
        请求体:
        {
            "node_id": "node_element_id"
        }
        或
        {
            "node_ids": ["id1", "id2", "id3"]
        }
        """
        try:
            node_id = request.data.get('node_id')
            node_ids = request.data.get('node_ids')
            
            if node_id:
                # 删除单个节点
                if not validate_node_exists(node_id):
                    return Response(
                        {'error': 'Node not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                results, summary = write_to_neo4j(DELETE_NODE_CYPHER, {'node_id': node_id})
                message = 'Node deleted successfully'
                
            elif node_ids and isinstance(node_ids, list):
                # 批量删除节点
                results, summary = write_to_neo4j(BATCH_DELETE_NODES_CYPHER, {'node_ids': node_ids})
                message = f'{len(node_ids)} nodes deleted successfully'
                
            else:
                return Response(
                    {'error': 'node_id or node_ids is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"用户 {request.user.id} 删除节点成功: {summary}")
            return Response({
                'message': message,
                'summary': summary
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"删除节点失败: {e}")
            return Response(
                {'error': 'Failed to delete node', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RelationshipCRUDView(BaseGraphAPIView):
    """
    关系的增删改查操作视图
    """
    
    def post(self, request):
        """
        创建新关系
        
        请求体:
        {
            "from_node_id": "source_node_id",
            "to_node_id": "target_node_id",
            "relationship_type": "KNOWS",
            "properties": {
                "since": "2023-01-01",
                "weight": 0.8
            }
        }
        """
        try:
            from_node_id = request.data.get('from_node_id')
            to_node_id = request.data.get('to_node_id')
            relationship_type = request.data.get('relationship_type')
            properties = request.data.get('properties', {})
            
            if not all([from_node_id, to_node_id, relationship_type]):
                return Response(
                    {'error': 'from_node_id, to_node_id, and relationship_type are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 验证节点存在
            if not validate_node_exists(from_node_id):
                return Response(
                    {'error': 'Source node not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if not validate_node_exists(to_node_id):
                return Response(
                    {'error': 'Target node not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # 构建动态Cypher查询
            cypher_query = f"""
            MATCH (a), (b)
            WHERE elementId(a) = $from_node_id AND elementId(b) = $to_node_id
            CREATE (a)-[r:{relationship_type} $properties]->(b)
            RETURN r
            """
            
            results, summary = write_to_neo4j(cypher_query, {
                'from_node_id': from_node_id,
                'to_node_id': to_node_id,
                'properties': properties
            })
            
            logger.info(f"用户 {request.user.id} 创建关系成功: {summary}")
            return Response({
                'message': 'Relationship created successfully',
                'data': results,
                'summary': summary
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"创建关系失败: {e}")
            return Response(
                {'error': 'Failed to create relationship', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request):
        """
        获取关系信息
        
        查询参数:
        - relationship_id: 关系ID
        - from_node_id: 源节点ID
        - to_node_id: 目标节点ID
        - relationship_type: 关系类型
        - limit: 结果限制数量
        """
        try:
            relationship_id = request.query_params.get('relationship_id')
            from_node_id = request.query_params.get('from_node_id')
            to_node_id = request.query_params.get('to_node_id')
            relationship_type = request.query_params.get('relationship_type')
            limit = int(request.query_params.get('limit', 50))
            
            if relationship_id:
                # 根据ID获取关系
                results = read_from_neo4j(GET_RELATIONSHIP_BY_ID_CYPHER, {'relationship_id': relationship_id})
            elif from_node_id and to_node_id:
                # 根据节点获取关系
                results = read_from_neo4j(GET_RELATIONSHIPS_BETWEEN_NODES_CYPHER, {
                    'from_node_id': from_node_id,
                    'to_node_id': to_node_id,
                    'limit': limit
                })
            elif relationship_type:
                # 根据类型获取关系
                cypher_query = f"MATCH ()-[r:{relationship_type}]-() RETURN r LIMIT $limit"
                results = read_from_neo4j(cypher_query, {'limit': limit})
            else:
                return Response(
                    {'error': 'relationship_id, node_ids, or relationship_type is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"用户 {request.user.id} 获取关系信息成功")
            return Response({
                'message': 'Relationships retrieved successfully',
                'data': results,
                'count': len(results)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"获取关系信息失败: {e}")
            return Response(
                {'error': 'Failed to retrieve relationships', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request):
        """
        更新关系属性
        
        请求体:
        {
            "relationship_id": "relationship_element_id",
            "properties": {
                "weight": 0.9,
                "updated_at": "2024-01-01"
            }
        }
        """
        try:
            relationship_id = request.data.get('relationship_id')
            properties = request.data.get('properties', {})
            
            if not relationship_id:
                return Response(
                    {'error': 'relationship_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not validate_relationship_exists(relationship_id):
                return Response(
                    {'error': 'Relationship not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            results, summary = write_to_neo4j(UPDATE_RELATIONSHIP_CYPHER, {
                'relationship_id': relationship_id,
                'properties': properties
            })
            
            logger.info(f"用户 {request.user.id} 更新关系成功: {summary}")
            return Response({
                'message': 'Relationship updated successfully',
                'data': results,
                'summary': summary
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"更新关系失败: {e}")
            return Response(
                {'error': 'Failed to update relationship', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request):
        """
        删除关系
        
        请求体:
        {
            "relationship_id": "relationship_element_id"
        }
        """
        try:
            relationship_id = request.data.get('relationship_id')
            
            if not relationship_id:
                return Response(
                    {'error': 'relationship_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not validate_relationship_exists(relationship_id):
                return Response(
                    {'error': 'Relationship not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            results, summary = write_to_neo4j(DELETE_RELATIONSHIP_CYPHER, {'relationship_id': relationship_id})
            
            logger.info(f"用户 {request.user.id} 删除关系成功: {summary}")
            return Response({
                'message': 'Relationship deleted successfully',
                'summary': summary
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"删除关系失败: {e}")
            return Response(
                {'error': 'Failed to delete relationship', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==================== 高级图分析视图 ====================

class GraphAnalysisView(BaseGraphAPIView):
    """
    高级图分析功能视图
    """
    
    def post(self, request):
        """
        执行图分析操作
        
        请求体:
        {
            "analysis_type": "shortest_path",  // shortest_path, all_paths, k_hop_neighbors, centrality, community_detection
            "parameters": {
                "from_node_id": "node1",
                "to_node_id": "node2",
                "max_length": 5
            }
        }
        """
        try:
            analysis_type = request.data.get('analysis_type')
            parameters = request.data.get('parameters', {})
            
            if not analysis_type:
                return Response(
                    {'error': 'analysis_type is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 根据分析类型选择相应的查询
            if analysis_type == 'shortest_path':
                from_node_id = parameters.get('from_node_id')
                to_node_id = parameters.get('to_node_id')
                max_length = parameters.get('max_length', 10)
                
                if not all([from_node_id, to_node_id]):
                    return Response(
                        {'error': 'from_node_id and to_node_id are required for shortest_path'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                results = read_from_neo4j(SHORTEST_PATH_CYPHER, {
                    'from_node_id': from_node_id,
                    'to_node_id': to_node_id,
                    'max_length': max_length
                })
                
            elif analysis_type == 'all_paths':
                from_node_id = parameters.get('from_node_id')
                to_node_id = parameters.get('to_node_id')
                max_length = parameters.get('max_length', 5)
                
                if not all([from_node_id, to_node_id]):
                    return Response(
                        {'error': 'from_node_id and to_node_id are required for all_paths'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                results = read_from_neo4j(ALL_PATHS_CYPHER, {
                    'from_node_id': from_node_id,
                    'to_node_id': to_node_id,
                    'max_length': max_length
                })
                
            elif analysis_type == 'k_hop_neighbors':
                node_id = parameters.get('node_id')
                k = parameters.get('k', 2)
                
                if not node_id:
                    return Response(
                        {'error': 'node_id is required for k_hop_neighbors'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                results = read_from_neo4j(K_HOP_NEIGHBORS_CYPHER, {
                    'node_id': node_id,
                    'k': k
                })
                
            elif analysis_type == 'centrality':
                centrality_type = parameters.get('centrality_type', 'degree')
                limit = parameters.get('limit', 20)
                
                if centrality_type == 'degree':
                    results = read_from_neo4j(DEGREE_CENTRALITY_CYPHER, {'limit': limit})
                elif centrality_type == 'betweenness':
                    results = read_from_neo4j(BETWEENNESS_CENTRALITY_CYPHER, {'limit': limit})
                elif centrality_type == 'pagerank':
                    results = read_from_neo4j(PAGERANK_CYPHER, {'limit': limit})
                else:
                    return Response(
                        {'error': 'Invalid centrality_type. Use: degree, betweenness, pagerank'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
            elif analysis_type == 'community_detection':
                algorithm = parameters.get('algorithm', 'louvain')
                
                if algorithm == 'louvain':
                    results = read_from_neo4j(LOUVAIN_COMMUNITY_CYPHER, {})
                elif algorithm == 'label_propagation':
                    results = read_from_neo4j(LABEL_PROPAGATION_CYPHER, {})
                else:
                    return Response(
                        {'error': 'Invalid algorithm. Use: louvain, label_propagation'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
            else:
                return Response(
                    {'error': 'Invalid analysis_type'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"用户 {request.user.id} 执行图分析成功: {analysis_type}")
            return Response({
                'message': f'{analysis_type} analysis completed successfully',
                'analysis_type': analysis_type,
                'data': results,
                'count': len(results)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"图分析失败: {e}")
            return Response(
                {'error': 'Failed to perform graph analysis', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==================== 数据统计视图 ====================

class GraphStatisticsView(BaseGraphAPIView):
    """
    图数据统计功能视图
    """
    
    def get(self, request):
        """
        获取图数据统计信息
        
        查询参数:
        - stat_type: 统计类型 (node_distribution, relationship_distribution, basic_stats, degree_distribution, components)
        """
        try:
            stat_type = request.query_params.get('stat_type', 'basic_stats')
            
            if stat_type == 'node_distribution':
                # 节点类型分布
                results = read_from_neo4j(NODE_TYPE_DISTRIBUTION_CYPHER, {})
                
            elif stat_type == 'relationship_distribution':
                # 关系类型分布
                results = read_from_neo4j(RELATIONSHIP_TYPE_DISTRIBUTION_CYPHER, {})
                
            elif stat_type == 'basic_stats':
                # 基础图统计
                results = read_from_neo4j(BASIC_GRAPH_STATS_CYPHER, {})
                
            elif stat_type == 'degree_distribution':
                # 节点度分布
                results = read_from_neo4j(NODE_DEGREE_DISTRIBUTION_CYPHER, {})
                
            elif stat_type == 'components':
                # 连通组件
                results = read_from_neo4j(CONNECTED_COMPONENTS_CYPHER, {})
                
            else:
                return Response(
                    {'error': 'Invalid stat_type. Use: node_distribution, relationship_distribution, basic_stats, degree_distribution, components'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"用户 {request.user.id} 获取图统计信息成功: {stat_type}")
            return Response({
                'message': f'{stat_type} statistics retrieved successfully',
                'stat_type': stat_type,
                'data': results,
                'count': len(results)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"获取图统计信息失败: {e}")
            return Response(
                {'error': 'Failed to retrieve graph statistics', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==================== 复杂查询视图 ====================

class ComplexQueryView(BaseGraphAPIView):
    """
    复杂查询功能视图
    """
    
    def post(self, request):
        """
        执行复杂查询操作
        
        请求体:
        {
            "query_type": "time_range",  // time_range, property_filter, multi_hop, composite
            "parameters": {
                "start_time": "2023-01-01",
                "end_time": "2023-12-31",
                "time_property": "created_at"
            }
        }
        """
        try:
            query_type = request.data.get('query_type')
            parameters = request.data.get('parameters', {})
            
            if not query_type:
                return Response(
                    {'error': 'query_type is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 根据查询类型选择相应的查询
            if query_type == 'time_range':
                start_time = parameters.get('start_time')
                end_time = parameters.get('end_time')
                time_property = parameters.get('time_property', 'created_at')
                
                if not all([start_time, end_time]):
                    return Response(
                        {'error': 'start_time and end_time are required for time_range query'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                results = read_from_neo4j(TIME_RANGE_QUERY_CYPHER, {
                    'start_time': start_time,
                    'end_time': end_time,
                    'time_property': time_property
                })
                
            elif query_type == 'property_filter':
                node_label = parameters.get('node_label')
                property_filters = parameters.get('property_filters', {})
                limit = parameters.get('limit', 100)
                
                if not node_label or not property_filters:
                    return Response(
                        {'error': 'node_label and property_filters are required for property_filter query'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                results = read_from_neo4j(PROPERTY_FILTER_QUERY_CYPHER, {
                    'node_label': node_label,
                    'property_filters': property_filters,
                    'limit': limit
                })
                
            elif query_type == 'multi_hop':
                start_node_id = parameters.get('start_node_id')
                relationship_types = parameters.get('relationship_types', [])
                min_hops = parameters.get('min_hops', 1)
                max_hops = parameters.get('max_hops', 3)
                
                if not start_node_id:
                    return Response(
                        {'error': 'start_node_id is required for multi_hop query'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                results = read_from_neo4j(MULTI_HOP_QUERY_CYPHER, {
                    'start_node_id': start_node_id,
                    'relationship_types': relationship_types,
                    'min_hops': min_hops,
                    'max_hops': max_hops
                })
                
            elif query_type == 'composite':
                # 复合查询，支持多种条件组合
                node_filters = parameters.get('node_filters', {})
                relationship_filters = parameters.get('relationship_filters', {})
                time_range = parameters.get('time_range', {})
                limit = parameters.get('limit', 100)
                
                results = read_from_neo4j(COMPOSITE_FILTER_QUERY_CYPHER, {
                    'node_filters': node_filters,
                    'relationship_filters': relationship_filters,
                    'time_range': time_range,
                    'limit': limit
                })
                
            else:
                return Response(
                    {'error': 'Invalid query_type. Use: time_range, property_filter, multi_hop, composite'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"用户 {request.user.id} 执行复杂查询成功: {query_type}")
            return Response({
                'message': f'{query_type} query completed successfully',
                'query_type': query_type,
                'data': results,
                'count': len(results)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"复杂查询失败: {e}")
            return Response(
                {'error': 'Failed to perform complex query', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InitialGraphView(BaseGraphAPIView):
    """
    API 端点：获取初始图谱数据用于可视化。
    """

    def get(self, request, format=None):
        """
        处理 GET 请求，返回 ECharts 格式的图谱数据。
        """
        try:
            logger.info(f"用户 {request.user.id} 获取初始图谱数据")
            results = read_from_neo4j(GET_INITIAL_GRAPH_CYPHER)
            
            # 使用序列化器处理Neo4j查询结果
            serializer = serializers.GraphDataSerializer(instance=results)
            
            logger.info(f"用户 {request.user.id} 初始图谱数据获取成功")
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"用户 {request.user.id} 获取初始图谱数据时发生错误: {e}")
            return Response(
                {'error': f'获取图谱数据失败: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FilteredGraphView(BaseGraphAPIView):
    """
    API 端点：根据简单过滤条件获取图谱数据。
    """

    def get(self, request, format=None):
        """
        处理 GET 请求，根据查询参数过滤并返回 ECharts 格式的图谱数据。
        """
        # 提取过滤参数，例如?filter_prop=name&filter_value=Alice
        filter_prop = request.query_params.get('filter_prop', None)
        filter_value = request.query_params.get('filter_value', None)

        # 警告：这里的过滤逻辑非常基础，仅用于演示参数传递。
        # 生产环境需要更健壮、更灵活的过滤机制。
        # 可能需要根据多个参数动态构建 Cypher 查询，或使用更高级的查询技术。
        if not filter_prop or filter_value is None:
            # 如果没有提供过滤参数，可以返回错误，或返回初始图谱数据
            logger.warning(f"用户 {request.user.id} 缺少过滤参数，返回初始图谱作为备选")
            # return Response({"error": "缺少过滤参数 'filter_prop' 和 'filter_value'"}, status=status.HTTP_400_BAD_REQUEST)
            # 或者，作为备选方案，返回初始图：
            try:
                results = db_utils.read_from_neo4j(cypher_queries.GET_INITIAL_GRAPH_CYPHER)
                serializer = serializers.GraphDataSerializer(instance=results)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                logger.exception(f"用户 {request.user.id} 在FilteredGraphView中获取初始图谱数据作为备选时发生错误")
                raise e

        # 构建参数字典
        # 注意：直接将用户输入拼接到 Cypher 查询中是危险的（Cypher 注入）！
        # 必须使用参数化查询。这里的查询假定属性名是固定的 'prop'，这很不灵活。
        # 正确的做法是验证 filter_prop 是否是允许过滤的属性，然后构建查询。
        # 为简化示例，我们假设 cypher_queries.GET_FILTERED_GRAPH_CYPHER
        # 内部使用了 $prop 和 $value，但这通常需要动态构建查询字符串，需谨慎处理。
        # 更安全的简化示例是固定属性名，只传递值：
        # 假设 GET_FILTERED_GRAPH_CYPHER 是 "MATCH (n {fixed_prop: $value})-[r]-(m) RETURN n, r, m LIMIT 50"
        # params = {'value': filter_value}
        # query = cypher_queries.GET_FILTERED_GRAPH_CYPHER

        # --- 更灵活但需要谨慎处理的动态属性过滤示例 ---
        # 警告：直接使用 filter_prop 构建查询字符串部分可能不安全，需要验证！
        # 更好的方法是有一个允许过滤的属性白名单。
        allowed_filter_props = ['name', 'user_id', 'ip_address']  # 示例白名单
        if filter_prop not in allowed_filter_props:
            logger.warning(f"用户 {request.user.id} 尝试使用不允许的过滤属性: {filter_prop}")
            return Response({"error": f"不允许按属性 '{filter_prop}' 过滤"}, status=status.HTTP_400_BAD_REQUEST)

        # 动态构建查询（仍然很简单，仅匹配一个属性）
        # 注意 $prop 不能直接用作属性键，需要拼接字符串或使用 apoc 过程
        # 这里采用拼接方式，但再次强调，输入验证至关重要！
        # 更安全的做法是为每个允许的属性准备一个查询模板。
        # 为了演示，我们使用一个稍微修改的查询概念（假设属性名已知）
        # 假设我们有一个查询模板字典
        query_template = f"MATCH (n {{{filter_prop}: $value}})-[r]-(m) RETURN n, r, m LIMIT 50"
        params = {'value': filter_value}
        query = query_template  # 在实际应用中，应从 cypher_queries.py 获取或构建
        logger.info(f"用户 {request.user.id} 使用查询获取过滤图谱数据: {query}，参数: {params}")
        # --- 结束动态过滤示例 ---

        try:
            results = db_utils.read_from_neo4j(query, params=params)
            serializer = serializers.GraphDataSerializer(instance=results)
            logger.info(f"用户 {request.user.id} 过滤图谱数据获取和序列化成功")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"用户 {request.user.id} 获取过滤图谱数据时发生错误")
            raise e


class NodeDetailView(BaseGraphAPIView):
    """
    API 端点：获取特定节点的详细信息及其邻居。
    """

    def get(self, request, node_id, format=None):
        """
        处理 GET 请求，根据 URL 中的 node_id 返回节点详情。
        """
        if not node_id:
            logger.warning(f"用户 {request.user.id} 请求节点详情时缺少节点ID")
            return Response({"error": "缺少节点 ID"}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"用户 {request.user.id} 获取节点详情，ID: {node_id}")
        params = {"node_id" : node_id}  # 假设 node_id 是我们在节点上存储的属性
        try:
            results = db_utils.read_from_neo4j(cypher_queries.GET_NODE_DETAIL_CYPHER, params=params)

            if not results:
                logger.warning(f"用户 {request.user.id} 未找到节点，ID: {node_id}")
                return Response({"error": "未找到指定节点"}, status=status.HTTP_404_NOT_FOUND)

            # NodeDetailSerializer 期望接收记录列表
            serializer = serializers.NodeDetailSerializer(instance=results)
            logger.info(f"用户 {request.user.id} 节点详情获取和序列化成功，ID: {node_id}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"用户 {request.user.id} 获取节点详情时发生错误，ID: {node_id}")
            raise e