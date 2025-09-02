/**
 * 知识图谱相关API工具类
 */
import apiClient from './http.js';

/**
 * 获取初始知识图谱数据
 * @returns {Promise}
 */
export function getInitialGraph() {
  return apiClient.get('/graph/initial/');
}

/**
 * 根据条件筛选知识图谱数据
 * @param {Object} filters - 筛选条件
 * @returns {Promise}
 */
export function getFilteredGraph(filters) {
  return apiClient.post('/graph/filtered/', filters);
}

/**
 * 获取单个节点的详细信息
 * @param {string} nodeId - 节点ID
 * @returns {Promise}
 */
export function getNodeDetails(nodeId) {
  return apiClient.get(`/graph/nodes/${nodeId}/`);
}
