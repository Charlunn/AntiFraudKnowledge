#!/usr/bin/env python3
"""
Neo4j数据库模式初始化脚本
创建必要的标签、关系类型和约束，确保查询能够正常执行
"""

import os
import sys
import django
from pathlib import Path

# 添加项目根目录到Python路径
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
django.setup()

from graph_api.db_utils import write_to_neo4j, read_from_neo4j
import logging

logger = logging.getLogger(__name__)

def create_constraints():
    """创建唯一性约束"""
    constraints = [
        "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Case) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (n:FraudType) REQUIRE n.name IS UNIQUE", 
        "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Technique) REQUIRE n.name IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Channel) REQUIRE n.name IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Trigger) REQUIRE n.name IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Person) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Organization) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Account) REQUIRE n.id IS UNIQUE",
    ]
    
    for constraint in constraints:
        try:
            write_to_neo4j(constraint)
            logger.info(f"约束创建成功: {constraint}")
        except Exception as e:
            logger.warning(f"约束创建失败或已存在: {constraint} - {e}")

def create_sample_data():
    """创建示例数据"""
    
    # 创建诈骗类型节点
    fraud_types = [
        {"name": "网络钓鱼", "description": "通过虚假网站或邮件获取用户信息"},
        {"name": "冒充公检法", "description": "冒充公安、检察院、法院等机构进行诈骗"},
        {"name": "杀猪盘", "description": "通过建立情感关系进行投资诈骗"},
        {"name": "虚假投资", "description": "虚构投资项目进行诈骗"},
        {"name": "仿冒电商客服", "description": "冒充电商平台客服进行诈骗"}
    ]
    
    for fraud_type in fraud_types:
        query = """
        MERGE (ft:FraudType {name: $name})
        SET ft.description = $description
        RETURN ft
        """
        try:
            write_to_neo4j(query, fraud_type)
            logger.info(f"诈骗类型创建成功: {fraud_type['name']}")
        except Exception as e:
            logger.error(f"诈骗类型创建失败: {fraud_type['name']} - {e}")
    
    # 创建诈骗技术节点
    techniques = [
        {"name": "发送虚假短信", "description": "发送包含虚假信息的短信"},
        {"name": "电话诱导", "description": "通过电话进行诱导"},
        {"name": "建立情感信任", "description": "通过长期交流建立信任关系"},
        {"name": "制造紧迫感", "description": "制造时间紧迫的假象"},
        {"name": "展示虚假盈利", "description": "展示虚假的投资收益"}
    ]
    
    for technique in techniques:
        query = """
        MERGE (t:Technique {name: $name})
        SET t.description = $description
        RETURN t
        """
        try:
            write_to_neo4j(query, technique)
            logger.info(f"诈骗技术创建成功: {technique['name']}")
        except Exception as e:
            logger.error(f"诈骗技术创建失败: {technique['name']} - {e}")
    
    # 创建渠道节点
    channels = [
        {"name": "短信", "description": "短信渠道"},
        {"name": "电话", "description": "电话渠道"},
        {"name": "社交软件", "description": "微信、QQ等社交软件"},
        {"name": "虚假网站", "description": "仿冒的虚假网站"},
        {"name": "虚假App", "description": "仿冒的虚假应用程序"}
    ]
    
    for channel in channels:
        query = """
        MERGE (c:Channel {name: $name})
        SET c.description = $description
        RETURN c
        """
        try:
            write_to_neo4j(query, channel)
            logger.info(f"渠道创建成功: {channel['name']}")
        except Exception as e:
            logger.error(f"渠道创建失败: {channel['name']} - {e}")
    
    # 创建心理触发点节点
    triggers = [
        {"name": "贪婪", "description": "利用人的贪婪心理"},
        {"name": "恐惧", "description": "制造恐惧情绪"},
        {"name": "孤独", "description": "利用孤独感"},
        {"name": "信任", "description": "建立虚假信任"},
        {"name": "紧急", "description": "制造紧急情况"},
        {"name": "好奇", "description": "利用好奇心"},
        {"name": "虚荣", "description": "利用虚荣心"},
        {"name": "同情", "description": "利用同情心"}
    ]
    
    for trigger in triggers:
        query = """
        MERGE (tr:Trigger {name: $name})
        SET tr.description = $description
        RETURN tr
        """
        try:
            write_to_neo4j(query, trigger)
            logger.info(f"心理触发点创建成功: {trigger['name']}")
        except Exception as e:
            logger.error(f"心理触发点创建失败: {trigger['name']} - {e}")

def create_sample_cases():
    """创建示例案例和关系"""
    
    # 创建示例案例
    cases = [
        {
            "id": "case_001",
            "title": "虚假银行短信诈骗案",
            "description": "通过发送虚假银行短信进行诈骗",
            "amount": 50000,
            "date": "2024-01-15"
        },
        {
            "id": "case_002", 
            "title": "冒充公安局电话诈骗案",
            "description": "冒充公安局工作人员进行电话诈骗",
            "amount": 120000,
            "date": "2024-02-20"
        },
        {
            "id": "case_003",
            "title": "网络投资诈骗案",
            "description": "通过虚假投资平台进行诈骗",
            "amount": 300000,
            "date": "2024-03-10"
        }
    ]
    
    for case in cases:
        query = """
        MERGE (c:Case {id: $id})
        SET c.title = $title,
            c.description = $description,
            c.amount = $amount,
            c.date = $date
        RETURN c
        """
        try:
            write_to_neo4j(query, case)
            logger.info(f"案例创建成功: {case['title']}")
        except Exception as e:
            logger.error(f"案例创建失败: {case['title']} - {e}")

def create_relationships():
    """创建关系"""
    
    relationships = [
        # 案例与诈骗类型的关系
        ("MATCH (c:Case {id: 'case_001'}), (ft:FraudType {name: '仿冒电商客服'}) MERGE (c)-[:BELONGS_TO]->(ft)", "案例-诈骗类型关系"),
        ("MATCH (c:Case {id: 'case_002'}), (ft:FraudType {name: '冒充公检法'}) MERGE (c)-[:BELONGS_TO]->(ft)", "案例-诈骗类型关系"),
        ("MATCH (c:Case {id: 'case_003'}), (ft:FraudType {name: '虚假投资'}) MERGE (c)-[:BELONGS_TO]->(ft)", "案例-诈骗类型关系"),
        
        # 案例与技术的关系
        ("MATCH (c:Case {id: 'case_001'}), (t:Technique {name: '发送虚假短信'}) MERGE (c)-[:USES_TECHNIQUE]->(t)", "案例-技术关系"),
        ("MATCH (c:Case {id: 'case_002'}), (t:Technique {name: '电话诱导'}) MERGE (c)-[:USES_TECHNIQUE]->(t)", "案例-技术关系"),
        ("MATCH (c:Case {id: 'case_003'}), (t:Technique {name: '展示虚假盈利'}) MERGE (c)-[:USES_TECHNIQUE]->(t)", "案例-技术关系"),
        
        # 案例与渠道的关系
        ("MATCH (c:Case {id: 'case_001'}), (ch:Channel {name: '短信'}) MERGE (c)-[:USES_CHANNEL]->(ch)", "案例-渠道关系"),
        ("MATCH (c:Case {id: 'case_002'}), (ch:Channel {name: '电话'}) MERGE (c)-[:USES_CHANNEL]->(ch)", "案例-渠道关系"),
        ("MATCH (c:Case {id: 'case_003'}), (ch:Channel {name: '虚假网站'}) MERGE (c)-[:USES_CHANNEL]->(ch)", "案例-渠道关系"),
        
        # 技术与心理触发点的关系
        ("MATCH (t:Technique {name: '发送虚假短信'}), (tr:Trigger {name: '恐惧'}) MERGE (t)-[:EXPLOITS]->(tr)", "技术-触发点关系"),
        ("MATCH (t:Technique {name: '电话诱导'}), (tr:Trigger {name: '恐惧'}) MERGE (t)-[:EXPLOITS]->(tr)", "技术-触发点关系"),
        ("MATCH (t:Technique {name: '建立情感信任'}), (tr:Trigger {name: '孤独'}) MERGE (t)-[:EXPLOITS]->(tr)", "技术-触发点关系"),
        ("MATCH (t:Technique {name: '制造紧迫感'}), (tr:Trigger {name: '紧急'}) MERGE (t)-[:EXPLOITS]->(tr)", "技术-触发点关系"),
        ("MATCH (t:Technique {name: '展示虚假盈利'}), (tr:Trigger {name: '贪婪'}) MERGE (t)-[:EXPLOITS]->(tr)", "技术-触发点关系"),
    ]
    
    for query, description in relationships:
        try:
            write_to_neo4j(query)
            logger.info(f"{description}创建成功")
        except Exception as e:
            logger.error(f"{description}创建失败: {e}")

def verify_schema():
    """验证模式是否正确创建"""
    
    # 检查节点数量
    queries = [
        ("MATCH (ft:FraudType) RETURN count(ft) as count", "诈骗类型"),
        ("MATCH (t:Technique) RETURN count(t) as count", "诈骗技术"),
        ("MATCH (c:Channel) RETURN count(c) as count", "渠道"),
        ("MATCH (tr:Trigger) RETURN count(tr) as count", "心理触发点"),
        ("MATCH (ca:Case) RETURN count(ca) as count", "案例"),
    ]
    
    for query, name in queries:
        try:
            result = read_from_neo4j(query)
            count = result[0]['count'] if result else 0
            logger.info(f"{name}节点数量: {count}")
        except Exception as e:
            logger.error(f"查询{name}节点失败: {e}")
    
    # 检查关系数量
    relationship_queries = [
        ("MATCH ()-[r:BELONGS_TO]->() RETURN count(r) as count", "BELONGS_TO关系"),
        ("MATCH ()-[r:USES_TECHNIQUE]->() RETURN count(r) as count", "USES_TECHNIQUE关系"),
        ("MATCH ()-[r:USES_CHANNEL]->() RETURN count(r) as count", "USES_CHANNEL关系"),
        ("MATCH ()-[r:EXPLOITS]->() RETURN count(r) as count", "EXPLOITS关系"),
    ]
    
    for query, name in relationship_queries:
        try:
            result = read_from_neo4j(query)
            count = result[0]['count'] if result else 0
            logger.info(f"{name}数量: {count}")
        except Exception as e:
            logger.error(f"查询{name}失败: {e}")

def main():
    """主函数"""
    logger.info("开始初始化Neo4j数据库模式...")
    
    try:
        # 1. 创建约束
        logger.info("1. 创建约束...")
        create_constraints()
        
        # 2. 创建示例数据
        logger.info("2. 创建示例数据...")
        create_sample_data()
        
        # 3. 创建示例案例
        logger.info("3. 创建示例案例...")
        create_sample_cases()
        
        # 4. 创建关系
        logger.info("4. 创建关系...")
        create_relationships()
        
        # 5. 验证模式
        logger.info("5. 验证模式...")
        verify_schema()
        
        logger.info("✅ Neo4j数据库模式初始化完成！")
        
    except Exception as e:
        logger.error(f"❌ Neo4j数据库模式初始化失败: {e}")
        return False
    
    return True

if __name__ == "__main__":
    # 配置日志
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    success = main()
    sys.exit(0 if success else 1)