from neo4j import GraphDatabase
import os
from django.conf import settings

# Neo4j数据库连接配置
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password"

# 初始化驱动
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# 定义一个辅助函数执行写事务
def run_write(tx, query):
    tx.run(query)

def init_knowledge_graph():
    """初始化反诈骗知识图谱数据"""
    print("开始初始化反诈骗知识图谱数据...")
    
    with driver.session() as session:
        # 清空所有现有数据
        print("清空现有数据...")
        session.execute_write(run_write, "MATCH (n) DETACH DELETE n")
        print("现有数据已清空")
        
        # 1. 创建诈骗类型节点
        print("创建诈骗类型节点...")
        session.execute_write(run_write, """
            MERGE (:诈骗类型 { name: '刷单返利类诈骗' })
            MERGE (:诈骗类型 { name: '虚假网络投资理财类诈骗' })
            MERGE (:诈骗类型 { name: '虚假购物服务类诈骗' })
            MERGE (:诈骗类型 { name: '冒充电商物流客服类诈骗' })
            MERGE (:诈骗类型 { name: '虚假贷款类诈骗' })
            MERGE (:诈骗类型 { name: '虚假征信类诈骗' })
            MERGE (:诈骗类型 { name: '冒充领导熟人类诈骗' })
            MERGE (:诈骗类型 { name: '冒充公检法及政府机关类诈骗' })
            MERGE (:诈骗类型 { name: '网络婚恋交友类诈骗' })
            MERGE (:诈骗类型 { name: '网络游戏产品虚假交易类诈骗' })
            MERGE (:诈骗类型 { name: '虚假中奖类诈骗' })
        """)

        # 2. 创建心理漏洞节点
        print("创建心理漏洞节点...")
        session.execute_write(run_write, """
            MERGE (:心理漏洞 { name: '金钱诱惑' })
            MERGE (:心理漏洞 { name: '贪小便宜' })
            MERGE (:心理漏洞 { name: '恐惧心理' })
            MERGE (:心理漏洞 { name: '权威顺从' })
            MERGE (:心理漏洞 { name: '信任熟人' })
            MERGE (:心理漏洞 { name: '情感依赖' })
            MERGE (:心理漏洞 { name: '同情心' })
            MERGE (:心理漏洞 { name: '急需用钱' })
        """)

        # 3. 创建作案工具节点
        print("创建作案工具节点...")
        session.execute_write(run_write, """
            MERGE (:作案工具 { name: '虚假刷单APP' })
            MERGE (:作案工具 { name: '虚假投资平台' })
            MERGE (:作案工具 { name: '伪造合同' })
            MERGE (:作案工具 { name: '屏幕共享软件' })
            MERGE (:作案工具 { name: '虚假贷款APP' })
            MERGE (:作案工具 { name: '伪造社交账号' })
            MERGE (:作案工具 { name: '伪造证件' })
            MERGE (:作案工具 { name: '钓鱼网站' })
            MERGE (:作案工具 { name: '欺诈邮件' })
        """)

        # 4. 创建平台节点
        print("创建平台节点...")
        session.execute_write(run_write, """
            MERGE (:平台 { name: '微信' })
            MERGE (:平台 { name: '相亲网站' })
            MERGE (:平台 { name: '网站广告' })
            MERGE (:平台 { name: '电话' })
            MERGE (:平台 { name: '微博' })
            MERGE (:平台 { name: '短信' })
            MERGE (:平台 { name: '游戏交易平台' })
            MERGE (:平台 { name: '电子邮件' })
        """)

        # 5. 插入典型诈骗案例数据
        print("创建诈骗案例数据...")
        
        # 案例1: 刷单返利诈骗 — 江苏徐州曹某被骗刷单
        session.execute_write(run_write, """
            MATCH (st:诈骗类型 { name: '刷单返利类诈骗' }),
                  (plat:平台 { name: '微信' }),
                  (tool:作案工具 { name: '虚假刷单APP' }),
                  (vul1:心理漏洞 { name: '金钱诱惑' }),
                  (vul2:心理漏洞 { name: '急需用钱' })
            CREATE (scam:诈骗者 { name: '兼职刷单诈骗团伙' }),
                  (victim:受害人 { name: '曹某（江苏徐州）', location: '江苏徐州' }),
                  (acc:账户 { name: '某银行账户(尾号5627)' }),
                  (scam)-[:实施诈骗 { date: '2023-03', amount: 42000 }]->(victim),
                  (scam)-[:利用]->(vul1),
                  (scam)-[:利用]->(vul2),
                  (scam)-[:利用平台]->(plat),
                  (scam)-[:使用工具]->(tool),
                  (acc)-[:属于]->(scam),
                  (victim)-[:转账至 { amount: 42000, date: '2023-03' }]->(acc),
                  (scam)-[:实施诈骗类型]->(st);
        """)

        # 案例2: 投资理财+交友诈骗 — 安徽阜阳张某被骗感情投资
        session.execute_write(run_write, """
            MATCH (st:诈骗类型 { name: '虚假网络投资理财类诈骗' }),
                  (plat:平台 { name: '相亲网站' }),
                  (tool:作案工具 { name: '虚假投资平台' }),
                  (vul1:心理漏洞 { name: '金钱诱惑' }),
                  (vul2:心理漏洞 { name: '情感依赖' })
            CREATE (scam:诈骗者 { name: '李某', location: '未知' }),
                  (victim:受害人 { name: '张某（安徽阜阳）', location: '安徽阜阳' }),
                  (acc:账户 { name: '某银行账户(尾号8891)' }),
                  (scam)-[:实施诈骗 { date: '2023-03', amount: 1400000 }]->(victim),
                  (scam)-[:利用]->(vul1),
                  (scam)-[:利用]->(vul2),
                  (scam)-[:利用平台]->(plat),
                  (scam)-[:使用工具]->(tool),
                  (acc)-[:属于]->(scam),
                  (victim)-[:转账至 { amount: 1400000, date: '2023-03' }]->(acc),
                  (scam)-[:实施诈骗类型]->(st);
        """)

        # 案例3: 虚假购物服务诈骗 — 四川攀枝花王某购买测绘仪器被骗
        session.execute_write(run_write, """
            MATCH (st:诈骗类型 { name: '虚假购物服务类诈骗' }),
                  (plat1:平台 { name: '网站广告' }),
                  (plat2:平台 { name: '微信' }),
                  (tool:作案工具 { name: '伪造合同' }),
                  (vul:心理漏洞 { name: '贪小便宜' })
            CREATE (scam:诈骗者 { name: '假卖家客服', location: '未知' }),
                  (victim:受害人 { name: '王某（四川攀枝花）', location: '四川攀枝花' }),
                  (acc:账户 { name: '某银行账户(尾号1310)' }),
                  (scam)-[:实施诈骗 { date: '2024-04', amount: 13000 }]->(victim),
                  (scam)-[:利用]->(vul),
                  (scam)-[:利用平台]->(plat1),
                  (scam)-[:利用平台]->(plat2),
                  (scam)-[:使用工具]->(tool),
                  (acc)-[:属于]->(scam),
                  (victim)-[:转账至 { amount: 13000, date: '2024-04' }]->(acc),
                  (scam)-[:实施诈骗类型]->(st);
        """)

        # 案例4: 冒充物流客服诈骗 — 四川宜宾张某快递理赔被骗
        session.execute_write(run_write, """
            MATCH (st:诈骗类型 { name: '冒充电商物流客服类诈骗' }),
                  (plat1:平台 { name: '电话' }),
                  (plat2:平台 { name: '微信' }),
                  (tool:作案工具 { name: '屏幕共享软件' }),
                  (vul:心理漏洞 { name: '恐惧心理' })
            CREATE (scam:诈骗者 { name: '假物流客服', location: '未知' }),
                  (victim:受害人 { name: '张某（四川宜宾）', location: '四川宜宾' }),
                  (acc:账户 { name: '某银行账户(尾号4505)' }),
                  (scam)-[:实施诈骗 { date: '2023-10', amount: 50000 }]->(victim),
                  (scam)-[:利用]->(vul),
                  (scam)-[:利用平台]->(plat1),
                  (scam)-[:利用平台]->(plat2),
                  (scam)-[:使用工具]->(tool),
                  (acc)-[:属于]->(scam),
                  (victim)-[:转账至 { amount: 50000, date: '2023-10' }]->(acc),
                  (scam)-[:实施诈骗类型]->(st);
        """)

        # 案例5: 虚假贷款诈骗 — 河南郑州李某急需资金被骗
        session.execute_write(run_write, """
            MATCH (st:诈骗类型 { name: '虚假贷款类诈骗' }),
                  (plat:平台 { name: '短信' }),
                  (tool:作案工具 { name: '虚假贷款APP' }),
                  (vul1:心理漏洞 { name: '急需用钱' }),
                  (vul2:心理漏洞 { name: '贪小便宜' })
            CREATE (scam:诈骗者 { name: '虚假贷款公司', location: '未知' }),
                  (victim:受害人 { name: '李某（河南郑州）', location: '河南郑州' }),
                  (acc:账户 { name: '某银行账户(尾号7788)' }),
                  (scam)-[:实施诈骗 { date: '2023-08', amount: 25000 }]->(victim),
                  (scam)-[:利用]->(vul1),
                  (scam)-[:利用]->(vul2),
                  (scam)-[:利用平台]->(plat),
                  (scam)-[:使用工具]->(tool),
                  (acc)-[:属于]->(scam),
                  (victim)-[:转账至 { amount: 25000, date: '2023-08' }]->(acc),
                  (scam)-[:实施诈骗类型]->(st);
        """)

        # 案例6: 冒充公检法诈骗 — 广东深圳赵某被恐吓转账
        session.execute_write(run_write, """
            MATCH (st:诈骗类型 { name: '冒充公检法及政府机关类诈骗' }),
                  (plat:平台 { name: '电话' }),
                  (tool:作案工具 { name: '伪造证件' }),
                  (vul1:心理漏洞 { name: '恐惧心理' }),
                  (vul2:心理漏洞 { name: '权威顺从' })
            CREATE (scam:诈骗者 { name: '假冒警察', location: '未知' }),
                  (victim:受害人 { name: '赵某（广东深圳）', location: '广东深圳' }),
                  (acc:账户 { name: '某银行账户(尾号9999)' }),
                  (scam)-[:实施诈骗 { date: '2023-12', amount: 80000 }]->(victim),
                  (scam)-[:利用]->(vul1),
                  (scam)-[:利用]->(vul2),
                  (scam)-[:利用平台]->(plat),
                  (scam)-[:使用工具]->(tool),
                  (acc)-[:属于]->(scam),
                  (victim)-[:转账至 { amount: 80000, date: '2023-12' }]->(acc),
                  (scam)-[:实施诈骗类型]->(st);
        """)

    print("反诈骗知识图谱数据初始化完成！")
    driver.close()

if __name__ == "__main__":
    init_knowledge_graph()