import os
import logging
from neo4j import GraphDatabase, Driver, Session, Transaction, Result
from neo4j.exceptions import ServiceUnavailable, Neo4jError, CypherSyntaxError
from typing import List, Dict, Any, Optional, Tuple

# 从 Django settings 获取配置 (或者直接从环境变量读取)
# 确保 Django 项目已正确加载设置
try:
    from django.conf import settings
    NEO4J_URI = settings.NEO4J_URI
    NEO4J_USERNAME = settings.NEO4J_USERNAME
    NEO4J_PASSWORD = settings.NEO4J_PASSWORD
except ImportError:
    # 如果在 Django 环境外使用（例如，脚本），则直接从环境变量读取
    NEO4J_URI = os.environ.get('NEO4J_URI', 'bolt://localhost:7687')
    NEO4J_USERNAME = os.environ.get('NEO4J_USERNAME', 'neo4j')
    NEO4J_PASSWORD = os.environ.get('NEO4J_PASSWORD', 'password')

logger = logging.getLogger(__name__)

class Neo4jConnection:
    """
    使用单例模式管理 Neo4j Driver 实例。
    确保整个应用程序生命周期中只有一个 Driver 实例。
    """
    _instance: Optional['Neo4jConnection'] = None
    _driver: Optional[Driver] = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(Neo4jConnection, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        """
        初始化 Neo4j Driver。
        使用 __new__ 和 _initialized 标志确保 __init__ 只执行一次。
        """
        if self._initialized:
            return
        try:
            logger.info(f"Initializing Neo4j Driver for URI: {NEO4J_URI}")
            self._driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
            # 验证连接
            self.check_connection()
            self._initialized = True
            logger.info("Neo4j Driver initialized successfully.")
        except ServiceUnavailable as e:
            logger.error(f"Could not connect to Neo4j at {NEO4J_URI}: {e}")
            self._driver = None
            # 在无法连接时可以考虑抛出异常或采取其他策略
            raise
        except Exception as e:
            logger.error(f"An unexpected error occurred during Neo4j Driver initialization: {e}")
            self._driver = None
            raise

    def get_driver(self) -> Optional[Driver]:
        """获取 Neo4j Driver 实例"""
        if self._driver is None and not self._initialized:
             # 尝试重新初始化，以防首次失败
             try:
                 self.__init__()
             except Exception:
                 logger.error("Failed to re-initialize Neo4j Driver.")
                 return None
        elif self._driver is None and self._initialized:
             logger.error("Neo4j Driver was initialized but is None. Connection might have failed previously.")
             return None
        return self._driver

    def close(self):
        """关闭 Neo4j Driver 连接"""
        if self._driver is not None:
            logger.info("Closing Neo4j Driver.")
            self._driver.close()
            Neo4jConnection._driver = None
            Neo4jConnection._instance = None # Reset instance for potential re-creation
            self._initialized = False
            logger.info("Neo4j Driver closed.")

    def check_connection(self):
        """验证与数据库的连接"""
        if self._driver is None:
             logger.error("Cannot check connection, driver is not initialized.")
             raise ServiceUnavailable("Neo4j driver not initialized.")
        try:
            self._driver.verify_connectivity()
            logger.info("Neo4j connection verified successfully.")
        except ServiceUnavailable as e:
            logger.error(f"Neo4j connection verification failed: {e}")
            raise
        except Exception as e:
            logger.error(f"An unexpected error occurred during connection verification: {e}")
            raise

# --- 辅助函数 ---

_connection_singleton = None

def get_neo4j_driver() -> Optional[Driver]:
    """
    获取全局唯一的 Neo4j Driver 实例。
    如果实例不存在或已关闭，则尝试创建。
    """
    global _connection_singleton
    if _connection_singleton is None or _connection_singleton.get_driver() is None:
        try:
            _connection_singleton = Neo4jConnection()
        except Exception as e:
            logger.error(f"Failed to get Neo4j driver instance: {e}")
            return None
    return _connection_singleton.get_driver()

def close_neo4j_driver():
    """关闭全局 Neo4j Driver 实例"""
    global _connection_singleton
    if _connection_singleton:
        _connection_singleton.close()
        _connection_singleton = None

def _execute_read_tx(tx: Transaction, cypher_query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    在只读事务中执行 Cypher 查询并处理结果。
    将 Neo4j Record 对象转换为字典列表。
    """
    result: Result = tx.run(cypher_query, params or {})
    # 将 Record 转换为字典，以便序列化器处理
    # 注意：这是一种简化处理，可能需要根据查询返回的具体结构进行调整
    # 例如，直接返回 Node/Relationship 对象可能更适合某些序列化器
    records_list = [record.data() for record in result]
    logger.debug(f"Query executed. Returned {len(records_list)} records.")
    return records_list

def read_from_neo4j(cypher_query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    执行只读 Neo4j 查询。

    Args:
        cypher_query: 要执行的 Cypher 查询语句。
        params: 查询参数字典。

    Returns:
        查询结果列表，每个元素是一个字典。

    Raises:
        ServiceUnavailable: 如果无法连接到数据库。
        CypherSyntaxError: 如果 Cypher 查询语法错误。
        Exception: 其他数据库错误。
    """
    driver = get_neo4j_driver()
    if not driver:
        raise ServiceUnavailable("Neo4j driver is not available.")

    records: List[Dict[str, Any]] = []
    session: Optional[Session] = None
    print("111111111111111111111111111111111111")
    print(params)
    try:
        # 使用 execute_read 进行只读事务管理
        # database_ 参数指定要操作的数据库，对于 Neo4j 4.x+ 可能需要配置
        # 对于默认数据库，可以省略或设为 'neo4j'
        with driver.session(database=getattr(settings, 'NEO4J_DATABASE', 'neo4j')) as session:
            records = session.execute_read(_execute_read_tx, cypher_query, params)

        logger.info(f"Read query executed successfully: {cypher_query[:100]}...")
    except ServiceUnavailable as e:
        logger.error(f"Neo4j Service Unavailable: {e}. Query: {cypher_query[:100]}...")
        raise
    except CypherSyntaxError as e:
        logger.error(f"Cypher Syntax Error: {e}. Query: {cypher_query}")
        raise
    except Neo4jError as e:
        logger.error(f"Neo4j database error: {e}. Query: {cypher_query[:100]}...")
        # 可以根据需要处理更具体的 Neo4jError 子类
        raise Exception(f"Database error: {e}") from e # 重新抛出为通用异常或特定应用异常
    except Exception as e:
        logger.error(f"An unexpected error occurred during read operation: {e}. Query: {cypher_query[:100]}...")
        raise
    finally:
        # driver.session() 使用了上下文管理器，会自动关闭 session
        pass

    return records

# --- 可选：添加写操作函数 ---
# def _execute_write_tx(tx: Transaction, cypher_query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
#     result: Result = tx.run(cypher_query, params or {})
#     summary = result.consume()
#     logger.info(f"Write operation summary: {summary.counters}")
#     # 对于写操作，通常关注摘要信息，但也可能需要返回结果
#     return [record.data() for record in result] # 如果需要返回数据

# def write_to_neo4j(cypher_query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
#     driver = get_neo4j_driver()
#     if not driver:
#         raise ServiceUnavailable("Neo4j driver is not available.")
#     results: List[Dict[str, Any]] = []
#     try:
#         with driver.session(database=getattr(settings, 'NEO4J_DATABASE', 'neo4j')) as session:
#             results = session.execute_write(_execute_write_tx, cypher_query, params)
#         logger.info(f"Write query executed successfully: {cypher_query[:100]}...")
#     except ServiceUnavailable as e:
#         logger.error(f"Neo4j Service Unavailable during write: {e}")
#         raise
#     except Neo4jError as e:
#         logger.error(f"Neo4j database error during write: {e}")
#         raise Exception(f"Database error during write: {e}") from e
#     except Exception as e:
#         logger.error(f"An unexpected error occurred during write operation: {e}")
#         raise
#     return results