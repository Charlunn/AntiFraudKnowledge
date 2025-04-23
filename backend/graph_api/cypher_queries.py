# backend/graph_api/cypher_queries.py

# Cypher 查询语句常量

# 获取初始图谱数据，用于首次加载可视化
# 注意：LIMIT 50 仅为示例，应根据实际数据量和前端性能调整
# 返回节点 n, m 以及它们之间的关系 r
GET_INITIAL_GRAPH_CYPHER = """
MATCH (n)-[r]-(m)
RETURN n, r, m
LIMIT 50
"""

# 根据属性值过滤图谱数据
# 警告：这是一个非常基础的过滤示例，仅匹配具有特定属性值的节点及其一度邻居。
# 对于实际的反欺诈应用，需要更复杂的查询，可能涉及：
# - 匹配特定的节点标签 (例如 :User, :Transaction, :Device)
# - 匹配特定的关系类型 (例如 :PERFORMED_TRANSACTION, :USED_DEVICE)
# - 匹配更长的路径模式 (例如多跳关联)
# - 使用图算法（如社区检测、路径查找）识别可疑模式 [30, 31, 32, 33, 34]
# - 结合多个过滤条件
# 这个查询的灵活性和性能可能不足以满足生产需求，需要根据具体场景进行深度优化。
GET_FILTERED_GRAPH_CYPHER = """
MATCH (n {prop: $value})-[r]-(m) // $value 将作为参数传入
RETURN n, r, m
LIMIT 50 // 同样需要调整 LIMIT
"""

# 获取特定节点的详细信息及其直接邻居
# 使用 elementId() 获取 Neo4j 内部 ID 进行精确匹配可能更可靠，
# 但这里使用一个假设的唯一属性 'node_id' 作为示例。
# 如果使用内部 ID，查询应类似 MATCH (n) WHERE elementId(n) = $node_element_id...
GET_NODE_DETAIL_CYPHER = """
MATCH (n {name: $node_id})-[r]-(m) // $node_id 将作为参数传入
RETURN n, r, m
"""
# MATCH (n) WHERE elementId(n) = $node_id
# MATCH (n)-[r]-(m)
# RETURN n, r, m
# --- 其他可能的查询示例 (供参考) ---

# 查询特定用户及其执行的交易
GET_USER_TRANSACTIONS_CYPHER = """
MATCH (u:User {user_id: $user_id})-->(t:Transaction)
RETURN u, t
LIMIT 100
"""

# 查询共享同一设备或 IP 地址的用户（潜在欺诈信号）
GET_SHARED_IDENTIFIER_USERS_CYPHER = """
MATCH (u1:User)-->(identifier)<--(u2:User)
WHERE id(u1) < id(u2) // 避免重复和自环
RETURN u1, u2, identifier
LIMIT 50
"""