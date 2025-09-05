#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import django

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
django.setup()

from graph_api.db_utils import get_neo4j_driver

def test_neo4j_connection():
    """测试Neo4j数据库连接和数据"""
    try:
        print("开始Neo4j连接测试...")
        
        # 获取数据库驱动
        driver = get_neo4j_driver()
        print("✅ Neo4j驱动获取成功")
        
        # 创建会话
        with driver.session() as session:
            # 测试连接
            result = session.run("RETURN 'Hello Neo4j' as message")
            message = result.single()["message"]
            print(f"✅ Neo4j连接测试成功: {message}")
            
            # 查询节点总数
            result = session.run("MATCH (n) RETURN count(n) as node_count")
            node_count = result.single()["node_count"]
            print(f"📊 数据库中节点总数: {node_count}")
            
            # 查询关系总数
            result = session.run("MATCH ()-[r]->() RETURN count(r) as rel_count")
            rel_count = result.single()["rel_count"]
            print(f"📊 数据库中关系总数: {rel_count}")
            
            # 查询节点标签
            result = session.run("CALL db.labels() YIELD label RETURN label")
            labels = [record["label"] for record in result]
            print(f"🏷️  节点标签: {labels}")
            
            # 查询关系类型
            result = session.run("CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType")
            rel_types = [record["relationshipType"] for record in result]
            print(f"🔗 关系类型: {rel_types}")
            
            # 查询一些示例数据
            if node_count > 0:
                result = session.run("MATCH (n) RETURN n LIMIT 5")
                print("\n📋 示例节点数据:")
                for i, record in enumerate(result, 1):
                    node = record["n"]
                    print(f"  {i}. {dict(node.labels)} - {dict(node)}")
        
        driver.close()
        print("\n🎉 Neo4j连接测试完成！")
        return True
        
    except Exception as e:
        print(f"❌ Neo4j连接测试失败: {e}")
        return False

if __name__ == "__main__":
    test_neo4j_connection()