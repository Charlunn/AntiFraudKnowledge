from rest_framework import serializers
from .models import FraudStatistics, UserAchievement, UserSkill
from django.db.models import Count, Sum
import numpy as np
import pandas as pd
from graph_api.db_utils import read_from_neo4j


class FraudStatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FraudStatistics
        fields = ['year', 'reported_cases', 'filed_cases']


class UserAchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAchievement
        fields = ['achievement_type', 'progress']


class UserSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSkill
        fields = ['skill_type', 'score']


class FraudTypeDistributionSerializer(serializers.Serializer):
    """诈骗类型分布饼图数据"""
    name = serializers.CharField()
    value = serializers.IntegerField()

    @classmethod
    def get_data(cls):
        # 执行Cypher查询，获取诈骗类型分布
        query = """
        MATCH (fp:FraudPattern)<-[:IS_A]-(fc:FraudCase)
        RETURN fp.name as name, count(fc) as value
        ORDER BY value DESC
        """
        results = read_from_neo4j(query)
        
        # 如果没有数据，返回示例数据
        if not results:
            return [
                {"name": "网络钓鱼", "value": 30},
                {"name": "冒充公检法", "value": 25},
                {"name": "杀猪盘", "value": 20},
                {"name": "虚假投资", "value": 15},
                {"name": "仿冒电商客服", "value": 10}
            ]
        
        return results


class TacticFrequencySerializer(serializers.Serializer):
    """诈骗手法使用频次饼图数据"""
    name = serializers.CharField()
    value = serializers.IntegerField()

    @classmethod
    def get_data(cls):
        # 执行Cypher查询，获取诈骗手法使用频次
        query = """
        MATCH (t:Tactic)<-[:INVOLVES]-(fc:FraudCase)
        RETURN t.name as name, count(fc) as value
        ORDER BY value DESC
        """
        results = read_from_neo4j(query)
        
        # 如果没有数据，返回示例数据
        if not results:
            return [
                {"name": "发送虚假短信", "value": 35},
                {"name": "电话诱导", "value": 30},
                {"name": "建立情感信任", "value": 25},
                {"name": "制造紧迫感", "value": 20},
                {"name": "展示虚假盈利", "value": 15}
            ]
        
        return results


class EmotionalTriggerSerializer(serializers.Serializer):
    """情感触发点词云数据"""
    name = serializers.CharField()
    value = serializers.IntegerField()

    @classmethod
    def get_data(cls):
        # 执行Cypher查询，获取情感触发点
        query = """
        MATCH (pt:PsychologicalTrigger)<-[:EXPLOITS]-(t:Tactic)
        RETURN pt.name as name, count(t) as value
        ORDER BY value DESC
        """
        results = read_from_neo4j(query)
        
        # 如果没有数据，返回示例数据
        if not results:
            return [
                {"name": "贪婪", "value": 100},
                {"name": "恐惧", "value": 80},
                {"name": "孤独", "value": 70},
                {"name": "信任", "value": 65},
                {"name": "紧急", "value": 60},
                {"name": "好奇", "value": 55},
                {"name": "虚荣", "value": 50},
                {"name": "同情", "value": 45}
            ]
        
        return results


class FraudFlowSerializer(serializers.Serializer):
    """诈骗流程桑基图数据"""
    nodes = serializers.ListField(child=serializers.DictField())
    links = serializers.ListField(child=serializers.DictField())

    @classmethod
    def get_data(cls):
        # 执行Cypher查询，获取诈骗流程
        query = """
        MATCH (c:Channel)<-[:CONDUCTED_VIA]-(fc:FraudCase)-[:IS_A]->(fp:FraudPattern)
        MATCH (fc)-[:INVOLVES]->(t:Tactic)
        RETURN c.name as channel, fp.name as pattern, t.name as tactic, count(fc) as value
        ORDER BY value DESC
        """
        results = read_from_neo4j(query)
        
        # 如果没有数据，返回示例数据
        if not results:
            # 示例数据
            channels = ["短信", "电话", "社交软件", "虚假网站", "虚假App"]
            patterns = ["杀猪盘", "仿冒电商客服", "冒充公检法", "虚假投资", "网络钓鱼"]
            tactics = ["建立情感信任", "展示虚假盈利", "制造紧迫感", "谎称订单异常", "要求按指示操作"]
            
            results = []
            for i in range(10):
                channel = np.random.choice(channels)
                pattern = np.random.choice(patterns)
                tactic = np.random.choice(tactics)
                value = np.random.randint(5, 30)
                results.append({"channel": channel, "pattern": pattern, "tactic": tactic, "value": value})
        
        # 处理数据，生成桑基图格式
        nodes = []
        links = []
        node_map = {}
        node_index = 0
        
        # 处理结果，构建节点和链接
        for item in results:
            channel = item.get("channel")
            pattern = item.get("pattern")
            tactic = item.get("tactic")
            value = item.get("value", 1)
            
            # 添加渠道节点
            if channel not in node_map:
                node_map[channel] = node_index
                nodes.append({"name": channel, "category": 0})
                node_index += 1
            
            # 添加模式节点
            if pattern not in node_map:
                node_map[pattern] = node_index
                nodes.append({"name": pattern, "category": 1})
                node_index += 1
            
            # 添加策略节点
            if tactic not in node_map:
                node_map[tactic] = node_index
                nodes.append({"name": tactic, "category": 2})
                node_index += 1
            
            # 添加链接：渠道 -> 模式
            links.append({
                "source": node_map[channel],
                "target": node_map[pattern],
                "value": value
            })
            
            # 添加链接：模式 -> 策略
            links.append({
                "source": node_map[pattern],
                "target": node_map[tactic],
                "value": value
            })
        
        return {"nodes": nodes, "links": links}


class FraudCasesYearlySerializer(serializers.Serializer):
    """刑事诈骗案件数柱状图数据"""
    year = serializers.IntegerField()
    reported_cases = serializers.IntegerField()
    filed_cases = serializers.IntegerField()

    @classmethod
    def get_data(cls):
        # 从数据库获取年度诈骗案件数据
        statistics = FraudStatistics.objects.all().order_by('year')
        
        # 如果没有数据，返回示例数据
        if not statistics.exists():
            return [
                {"year": 2015, "reported_cases": 590000, "filed_cases": 210000},
                {"year": 2016, "reported_cases": 650000, "filed_cases": 240000},
                {"year": 2017, "reported_cases": 730000, "filed_cases": 280000},
                {"year": 2018, "reported_cases": 810000, "filed_cases": 320000},
                {"year": 2019, "reported_cases": 950000, "filed_cases": 390000},
                {"year": 2020, "reported_cases": 1200000, "filed_cases": 520000},
                {"year": 2021, "reported_cases": 1550000, "filed_cases": 670000},
                {"year": 2022, "reported_cases": 1720000, "filed_cases": 750000},
                {"year": 2023, "reported_cases": 1850000, "filed_cases": 820000}
            ]
        
        return FraudStatisticsSerializer(statistics, many=True).data 