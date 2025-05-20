from django.shortcuts import render

# Create your views here.
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from neo4j.exceptions import ServiceUnavailable, CypherSyntaxError, Neo4jError

from . import db_utils
from . import serializers
from . import cypher_queries

logger = logging.getLogger(__name__)


class BaseGraphAPIView(APIView):
    """
    基础视图，提供统一的 Neo4j 异常处理。
    """

    def handle_exception(self, exc):
        """
        自定义异常处理，捕获特定的 Neo4j 异常。
        [1]
        """
        if isinstance(exc, ServiceUnavailable):
            logger.error(f"Neo4j Service Unavailable: {exc}")
            return Response(
                {"error": "无法连接到图数据库，请稍后重试或联系管理员。"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        elif isinstance(exc, CypherSyntaxError):
            logger.error(f"Cypher Syntax Error: {exc}")
            # 不应将详细的 Cypher 错误暴露给客户端
            return Response(
                {"error": "处理请求时发生内部错误（查询语法）。"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        elif isinstance(exc, Neo4jError):
            logger.error(f"Neo4j Database Error: {exc}")
            return Response(
                {"error": "处理请求时发生数据库错误。"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        # 对于其他未预料到的异常，调用 DRF 的默认处理程序
        return super().handle_exception(exc)


class InitialGraphView(BaseGraphAPIView):
    """
    API 端点：获取初始图谱数据用于可视化。
    """

    def get(self, request, format=None):
        """
        处理 GET 请求，返回 ECharts 格式的图谱数据。
        """
        try:
            logger.info("Fetching initial graph data...")
            results = db_utils.read_from_neo4j(cypher_queries.GET_INITIAL_GRAPH_CYPHER)
            # print("下面是结果\n")
            # print(results)
            # print("上面是结果\n")
            serializer = serializers.EchartsGraphSerializer(instance=results)
            logger.info("Initial graph data fetched and serialized successfully.")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            # 异常将由 BaseGraphAPIView 的 handle_exception 处理
            # 但我们可以在这里记录特定于此视图的上下文
            logger.exception("Error fetching initial graph data.")
            raise e  # 重新抛出，让 handle_exception 处理


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
            logger.warning("FilteredGraphView: Missing filter parameters. Returning initial graph as fallback.")
            # return Response({"error": "缺少过滤参数 'filter_prop' 和 'filter_value'"}, status=status.HTTP_400_BAD_REQUEST)
            # 或者，作为备选方案，返回初始图：
            try:
                results = db_utils.read_from_neo4j(cypher_queries.GET_INITIAL_GRAPH_CYPHER)
                serializer = serializers.EchartsGraphSerializer(instance=results)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                logger.exception("Error fetching initial graph data as fallback in FilteredGraphView.")
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
        logger.info(f"Fetching filtered graph data with query: {query} and params: {params}")
        # --- 结束动态过滤示例 ---

        try:
            results = db_utils.read_from_neo4j(query, params=params)
            serializer = serializers.EchartsGraphSerializer(instance=results)
            logger.info("Filtered graph data fetched and serialized successfully.")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error fetching filtered graph data.")
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
            return Response({"error": "缺少节点 ID"}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"Fetching details for id: {node_id}")
        params = {"node_id" : node_id}  # 假设 node_id 是我们在节点上存储的属性
        print("2222222222222222222222222222222222222")
        print(params)
        try:
            results = db_utils.read_from_neo4j(cypher_queries.GET_NODE_DETAIL_CYPHER, params=params)

            if not results:
                logger.warning(f"Node not found for node_id: {node_id}")
                return Response({"error": "未找到指定节点"}, status=status.HTTP_404_NOT_FOUND)

            # NodeDetailSerializer 期望接收记录列表
            serializer = serializers.NodeDetailSerializer(instance=results)
            logger.info(f"Node details for {node_id} fetched and serialized successfully.")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Error fetching node details for node_id: {node_id}")
            raise e