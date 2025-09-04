<template>
  <div class="graph-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>知识图谱可视化</h1>
      <div class="header-actions">
        <ClientOnly>
          <button @click="showQueryPanel = !showQueryPanel" class="btn btn-primary">
            {{ showQueryPanel ? '隐藏' : '显示' }}查询面板
          </button>
          <button @click="refreshGraph" class="btn btn-secondary" :disabled="loading">
            {{ loading ? '加载中...' : '刷新图谱' }}
          </button>
        </ClientOnly>
      </div>
    </div>

    <!-- 查询面板 -->
    <div v-if="showQueryPanel" class="query-panel">
      <div class="query-section">
        <h3>基础查询</h3>
        <div class="query-form">
          <div class="form-group">
            <label>节点类型:</label>
            <select v-model="queryParams.node_types" multiple class="form-control">
              <option v-for="type in availableNodeTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>关系类型:</label>
            <select v-model="queryParams.relationship_types" multiple class="form-control">
              <option v-for="type in availableRelationshipTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>限制数量:</label>
            <input v-model.number="queryParams.limit" type="number" class="form-control" min="1" max="1000" />
          </div>
          
          <div class="form-actions">
            <button @click="executeBasicQuery" class="btn btn-primary" :disabled="loading">
              执行查询
            </button>
            <button @click="resetQuery" class="btn btn-secondary">
              重置
            </button>
          </div>
        </div>
      </div>

      <!-- 高级分析 -->
      <div class="query-section">
        <h3>图分析</h3>
        <div class="analysis-form">
          <div class="form-group">
            <label>分析类型:</label>
            <select v-model="analysisParams.analysis_type" class="form-control">
              <option value="shortest_path">最短路径</option>
              <option value="all_paths">所有路径</option>
              <option value="k_hop_neighbors">K跳邻居</option>
              <option value="degree_centrality">度中心性</option>
              <option value="betweenness_centrality">介数中心性</option>
              <option value="pagerank">PageRank</option>
              <option value="louvain_community">Louvain社区发现</option>
              <option value="label_propagation">标签传播</option>
            </select>
          </div>
          
          <div v-if="needsSourceNode" class="form-group">
            <label>源节点ID:</label>
            <input v-model="analysisParams.source_node" type="text" class="form-control" 
                   placeholder="输入节点ID或从图中选择" />
          </div>
          
          <div v-if="needsTargetNode" class="form-group">
            <label>目标节点ID:</label>
            <input v-model="analysisParams.target_node" type="text" class="form-control" 
                   placeholder="输入节点ID或从图中选择" />
          </div>
          
          <div v-if="needsKValue" class="form-group">
            <label>K值 (跳数):</label>
            <input v-model.number="analysisParams.k" type="number" class="form-control" min="1" max="5" />
          </div>
          
          <div class="form-actions">
            <button @click="executeAnalysis" class="btn btn-success" :disabled="loading">
              执行分析
            </button>
          </div>
        </div>
      </div>

      <!-- 复杂查询 -->
      <div class="query-section">
        <h3>复杂查询</h3>
        <div class="complex-query-form">
          <div class="form-group">
            <label>查询类型:</label>
            <select v-model="complexQueryParams.query_type" class="form-control">
              <option value="time_range">时间范围查询</option>
              <option value="property_filter">属性过滤查询</option>
              <option value="multi_hop">多跳查询</option>
              <option value="composite">复合查询</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>查询条件 (JSON格式):</label>
            <textarea v-model="complexQueryConditions" class="form-control" rows="4" 
                      placeholder='例如: {"property_name": "value", "min_degree": 5}'></textarea>
          </div>
          
          <div class="form-actions">
            <button @click="executeComplexQuery" class="btn btn-warning" :disabled="loading">
              执行复杂查询
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息面板 -->
    <div class="stats-panel">
      <div class="stat-item">
        <span class="stat-label">节点数量:</span>
        <span class="stat-value">{{ nodeCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">关系数量:</span>
        <span class="stat-value">{{ linkCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">节点类型:</span>
        <span class="stat-value">{{ nodeTypes?.length || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已选择:</span>
        <span class="stat-value">{{ selectedNodes?.size || 0 }}</span>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
        <button @click="clearError" class="error-close">×</button>
      </div>
    </div>

    <!-- 图可视化组件 -->
    <div class="graph-container">
      <ClientOnly>
        <GraphVisualization
          :graph-data="graphData"
          :interactive="true"
          @node-click="handleNodeClick"
          @node-expand="handleNodeExpand"
          @node-collapse="handleNodeCollapse"
          @layout-change="handleLayoutChange"
        />
        <template #fallback>
          <div class="loading-placeholder">
            <div class="loading-spinner"></div>
            <p>正在加载图谱可视化...</p>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- 分析结果面板 -->
    <div v-if="analysisResult" class="analysis-result-panel">
      <div class="result-header">
        <h3>分析结果</h3>
        <button @click="closeAnalysisResult" class="close-btn">×</button>
      </div>
      <div class="result-content">
        <pre>{{ JSON.stringify(analysisResult, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import GraphVisualization from '~/components/GraphVisualization.vue'
import { useGraphData } from '~/composables/useGraphData'
// 类型将在运行时从useGraphData中获取

// 页面元数据
useHead({
  title: '知识图谱可视化 - 反欺诈知识图谱系统',
  meta: [
    { name: 'description', content: '基于Neo4j的反欺诈知识图谱可视化系统，支持图数据查询、分析和交互式可视化' }
  ]
})

// 使用图数据管理
const {
  graphData,
  loading,
  error,
  selectedNodes,
  expandedNodes,
  nodeCount,
  linkCount,
  nodeTypes,
  fetchInitialGraph,
  fetchFilteredGraph,
  performAnalysis,
  performComplexQuery,
  expandNode,
  collapseNode,
  toggleNodeSelection,
  resetGraph
} = useGraphData()

// 页面状态
const showQueryPanel = ref(false)
const analysisResult = ref(null)

// 查询参数
const queryParams = ref({
  node_types: [],
  relationship_types: [],
  limit: 50
})

const analysisParams = ref({
  analysis_type: 'shortest_path',
  source_node: '',
  target_node: '',
  k: 2
})

const complexQueryParams = ref({
  query_type: 'node_filter',
  conditions: []
})

const complexQueryConditions = ref('{}')

// 可用的节点和关系类型（这些应该从后端API获取）
const availableNodeTypes = ref([
  'Person', 'Company', 'Account', 'Transaction', 'Device', 'Location'
])

const availableRelationshipTypes = ref([
  'OWNS', 'TRANSFERS', 'USES', 'LOCATED_AT', 'WORKS_FOR', 'RELATED_TO'
])

// 计算属性
const needsSourceNode = computed(() => {
  return ['shortest_path', 'all_paths', 'k_hop_neighbors'].includes(analysisParams.value.analysis_type)
})

const needsTargetNode = computed(() => {
  return ['shortest_path', 'all_paths'].includes(analysisParams.value.analysis_type)
})

const needsKValue = computed(() => {
  return analysisParams.value.analysis_type === 'k_hop_neighbors'
})

// 生命周期
onMounted(async () => {
  // 确保在客户端环境中才加载数据
  if (typeof window !== 'undefined') {
    await nextTick()
    await fetchInitialGraph({ limit: 50 })
  }
})

// 监听复杂查询条件变化
watch(complexQueryConditions, (newValue) => {
  try {
    complexQueryParams.value.conditions = JSON.parse(newValue)
  } catch (e) {
    // 忽略JSON解析错误，用户可能还在输入
  }
})

// 事件处理方法
const handleNodeClick = (node) => {
  console.log('Node clicked:', node)
  toggleNodeSelection(node.id)
  
  // 如果需要源节点或目标节点，自动填充
  if (needsSourceNode.value && !analysisParams.value.source_node) {
    analysisParams.value.source_node = node.id
  } else if (needsTargetNode.value && !analysisParams.value.target_node && analysisParams.value.source_node !== node.id) {
    analysisParams.value.target_node = node.id
  }
}

const handleNodeExpand = async (node) => {
  console.log('Expanding node:', node)
  await expandNode(node.id)
}

const handleNodeCollapse = (node) => {
  console.log('Collapsing node:', node)
  collapseNode(node.id)
}

const handleLayoutChange = (layoutType) => {
  console.log('Layout changed to:', layoutType)
}

// 查询方法
const executeBasicQuery = async () => {
  const params = { ...queryParams.value }
  
  // 清理空数组
  if (params.node_types?.length === 0) {
    delete params.node_types
  }
  if (params.relationship_types?.length === 0) {
    delete params.relationship_types
  }
  
  await fetchFilteredGraph(params)
}

const executeAnalysis = async () => {
  const params = { ...analysisParams.value }
  
  // 验证必需参数
  if (needsSourceNode.value && !params.source_node) {
    alert('请选择或输入源节点ID')
    return
  }
  
  if (needsTargetNode.value && !params.target_node) {
    alert('请选择或输入目标节点ID')
    return
  }
  
  const result = await performAnalysis(params)
  if (result) {
    analysisResult.value = result
    
    // 如果结果包含图数据，更新可视化
    if (result.nodes && result.links) {
      // 这里可以选择替换当前图数据或合并
      // graphData.value = result
    }
  }
}

const executeComplexQuery = async () => {
  try {
    const conditions = JSON.parse(complexQueryConditions.value)
    const params = {
      ...complexQueryParams.value,
      conditions
    }
    
    const result = await performComplexQuery(params)
    if (result) {
      // 更新图数据
      // graphData.value = result
      analysisResult.value = result
    }
  } catch (e) {
    alert('查询条件JSON格式错误，请检查语法')
  }
}

const refreshGraph = async () => {
  resetGraph()
  await fetchInitialGraph({ limit: 50 })
}

const resetQuery = () => {
  queryParams.value = {
    node_types: [],
    relationship_types: [],
    limit: 100
  }
}

const clearError = () => {
  // 这里需要在useGraphData中添加clearError方法
  // error.value = null
}

const closeAnalysisResult = () => {
  analysisResult.value = null
}
</script>

<style scoped>
.graph-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
}

.query-panel {
  display: flex;
  gap: 24px;
  padding: 20px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  overflow-x: auto;
}

.query-section {
  min-width: 300px;
  flex-shrink: 0;
}

.query-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.query-form,
.analysis-form,
.complex-query-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-control[multiple] {
  min-height: 80px;
}

textarea.form-control {
  resize: vertical;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.stats-panel {
  display: flex;
  gap: 24px;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.error-message {
  padding: 12px 24px;
  background: #f8d7da;
  border-bottom: 1px solid #f5c6cb;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-icon {
  font-size: 18px;
}

.error-text {
  flex: 1;
  color: #721c24;
  font-size: 14px;
}

.error-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #721c24;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.error-close:hover {
  background: rgba(114, 28, 36, 0.1);
}

.graph-container {
  flex: 1;
  min-height: 0;
  position: relative;
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.analysis-result-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 800px;
  max-height: 80%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.result-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  color: #333;
  background: #e9ecef;
}

.result-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.result-content pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #333;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  overflow: auto;
}
</style>