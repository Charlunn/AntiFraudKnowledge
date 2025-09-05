#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import django

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
django.setup()

from graph_api.db_utils import get_neo4j_driver

def init_fraud_knowledge_graph():
    """初始化反诈骗知识图谱数据"""
    try:
        print("开始初始化反诈骗知识图谱...")
        
        driver = get_neo4j_driver()
        if not driver:
            print("❌ 无法获取Neo4j驱动")
            return False
        
        with driver.session() as session:
            # 清空现有数据（可选）
            print("🧹 清空现有数据...")
            session.run("MATCH (n) DETACH DELETE n")
            
            # 创建诈骗类型节点
            print("📱 创建诈骗类型节点...")
            fraud_types = [
                {"name": "电信诈骗", "description": "通过电话、短信等电信手段实施的诈骗", "risk_level": "高"},
                {"name": "网络诈骗", "description": "通过互联网平台实施的诈骗", "risk_level": "高"},
                {"name": "金融诈骗", "description": "针对金融服务的诈骗行为", "risk_level": "极高"},
                {"name": "投资诈骗", "description": "以投资理财为名的诈骗", "risk_level": "极高"},
                {"name": "刷单诈骗", "description": "以刷单返利为诱饵的诈骗", "risk_level": "中"},
                {"name": "冒充公检法", "description": "冒充公安、检察院、法院工作人员的诈骗", "risk_level": "极高"}
            ]
            
            for fraud_type in fraud_types:
                session.run(
                    "CREATE (f:FraudType {name: $name, description: $description, risk_level: $risk_level})",
                    fraud_type
                )
            
            # 创建诈骗手段节点
            print("🎭 创建诈骗手段节点...")
            fraud_methods = [
                {"name": "虚假客服", "description": "冒充银行、电商等客服人员", "common_phrases": ["账户异常", "需要验证身份", "配合调查"]},
                {"name": "钓鱼链接", "description": "发送虚假链接获取个人信息", "common_phrases": ["点击链接", "立即处理", "限时优惠"]},
                {"name": "虚假投资平台", "description": "搭建虚假投资网站诱导投资", "common_phrases": ["高收益", "稳赚不赔", "内幕消息"]},
                {"name": "刷单返利", "description": "以刷单任务获得返利为诱饵", "common_phrases": ["轻松赚钱", "刷单任务", "先垫付后返还"]},
                {"name": "冒充熟人", "description": "冒充亲友或同事借钱", "common_phrases": ["急需用钱", "手机没电", "先借一下"]},
                {"name": "虚假中奖", "description": "声称中奖需要缴费领取", "common_phrases": ["恭喜中奖", "缴纳税费", "激活奖金"]}
            ]
            
            for method in fraud_methods:
                session.run(
                    "CREATE (m:FraudMethod {name: $name, description: $description, common_phrases: $common_phrases})",
                    method
                )
            
            # 创建防范措施节点
            print("🛡️ 创建防范措施节点...")
            prevention_measures = [
                {"name": "验证身份", "description": "通过官方渠道验证对方身份", "effectiveness": "高"},
                {"name": "不轻信陌生人", "description": "对陌生人的要求保持警惕", "effectiveness": "高"},
                {"name": "保护个人信息", "description": "不随意透露个人敏感信息", "effectiveness": "高"},
                {"name": "官方渠道核实", "description": "通过官方客服或网站核实信息", "effectiveness": "极高"},
                {"name": "理性投资", "description": "选择正规投资渠道，理性分析收益", "effectiveness": "高"},
                {"name": "及时报警", "description": "发现被骗立即报警止损", "effectiveness": "中"}
            ]
            
            for measure in prevention_measures:
                session.run(
                    "CREATE (p:PreventionMeasure {name: $name, description: $description, effectiveness: $effectiveness})",
                    measure
                )
            
            # 创建关键词节点
            print("🔍 创建关键词节点...")
            keywords = [
                {"word": "银行卡冻结", "risk_score": 9, "category": "金融威胁"},
                {"word": "账户异常", "risk_score": 8, "category": "金融威胁"},
                {"word": "配合调查", "risk_score": 9, "category": "公检法冒充"},
                {"word": "资金安全", "risk_score": 7, "category": "金融威胁"},
                {"word": "高收益投资", "risk_score": 8, "category": "投资诱饵"},
                {"word": "刷单返利", "risk_score": 7, "category": "兼职诱饵"},
                {"word": "中奖通知", "risk_score": 6, "category": "虚假中奖"},
                {"word": "验证码", "risk_score": 9, "category": "信息窃取"},
                {"word": "转账汇款", "risk_score": 10, "category": "资金转移"},
                {"word": "安全账户", "risk_score": 10, "category": "资金转移"}
            ]
            
            for keyword in keywords:
                session.run(
                    "CREATE (k:Keyword {word: $word, risk_score: $risk_score, category: $category})",
                    keyword
                )
            
            # 创建关系
            print("🔗 创建节点关系...")
            
            # 诈骗类型与手段的关系
            relationships = [
                ("电信诈骗", "虚假客服", "USES_METHOD"),
                ("电信诈骗", "冒充熟人", "USES_METHOD"),
                ("网络诈骗", "钓鱼链接", "USES_METHOD"),
                ("网络诈骗", "虚假中奖", "USES_METHOD"),
                ("金融诈骗", "虚假客服", "USES_METHOD"),
                ("投资诈骗", "虚假投资平台", "USES_METHOD"),
                ("刷单诈骗", "刷单返利", "USES_METHOD"),
                ("冒充公检法", "虚假客服", "USES_METHOD")
            ]
            
            for fraud_type, method, rel_type in relationships:
                session.run(
                    f"MATCH (f:FraudType {{name: $fraud_type}}), (m:FraudMethod {{name: $method}}) "
                    f"CREATE (f)-[:{rel_type}]->(m)",
                    {"fraud_type": fraud_type, "method": method}
                )
            
            # 防范措施与诈骗类型的关系
            prevention_relationships = [
                ("验证身份", "冒充公检法", "PREVENTS"),
                ("官方渠道核实", "电信诈骗", "PREVENTS"),
                ("不轻信陌生人", "网络诈骗", "PREVENTS"),
                ("保护个人信息", "金融诈骗", "PREVENTS"),
                ("理性投资", "投资诈骗", "PREVENTS"),
                ("及时报警", "刷单诈骗", "PREVENTS")
            ]
            
            for measure, fraud_type, rel_type in prevention_relationships:
                session.run(
                    f"MATCH (p:PreventionMeasure {{name: $measure}}), (f:FraudType {{name: $fraud_type}}) "
                    f"CREATE (p)-[:{rel_type}]->(f)",
                    {"measure": measure, "fraud_type": fraud_type}
                )
            
            # 关键词与诈骗类型的关系
            keyword_relationships = [
                ("银行卡冻结", "金融诈骗", "INDICATES"),
                ("账户异常", "金融诈骗", "INDICATES"),
                ("配合调查", "冒充公检法", "INDICATES"),
                ("高收益投资", "投资诈骗", "INDICATES"),
                ("刷单返利", "刷单诈骗", "INDICATES"),
                ("中奖通知", "网络诈骗", "INDICATES"),
                ("验证码", "电信诈骗", "INDICATES"),
                ("转账汇款", "金融诈骗", "INDICATES"),
                ("安全账户", "冒充公检法", "INDICATES")
            ]
            
            for keyword, fraud_type, rel_type in keyword_relationships:
                session.run(
                    f"MATCH (k:Keyword {{word: $keyword}}), (f:FraudType {{name: $fraud_type}}) "
                    f"CREATE (k)-[:{rel_type}]->(f)",
                    {"keyword": keyword, "fraud_type": fraud_type}
                )
            
            # 验证数据创建
            result = session.run("MATCH (n) RETURN count(n) as node_count")
            node_count = result.single()["node_count"]
            
            result = session.run("MATCH ()-[r]->() RETURN count(r) as rel_count")
            rel_count = result.single()["rel_count"]
            
            print(f"\n✅ 知识图谱初始化完成！")
            print(f"📊 创建节点数: {node_count}")
            print(f"🔗 创建关系数: {rel_count}")
            
            # 显示各类型节点数量
            labels = ["FraudType", "FraudMethod", "PreventionMeasure", "Keyword"]
            for label in labels:
                result = session.run(f"MATCH (n:{label}) RETURN count(n) as count")
                count = result.single()["count"]
                print(f"   {label}: {count}个")
            
            return True
            
    except Exception as e:
        print(f"❌ 知识图谱初始化失败: {e}")
        return False

if __name__ == "__main__":
    init_fraud_knowledge_graph()