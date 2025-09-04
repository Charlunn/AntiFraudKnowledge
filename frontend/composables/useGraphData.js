import { ref, reactive, computed } from 'vue'

/**
 * 知识图谱数据管理组合式函数
 * 提供图数据的获取、分析、操作等功能
 */
export function useGraphData() {
  // 响应式状态
  const graphData = ref({
    nodes: [],
    links: []
  })
  
  const loading = ref(false)
  const error = ref(null)
  const selectedNodes = ref(new Set())
  const expandedNodes = ref(new Set())
  
  // 计算属性
  const nodeCount = computed(() => graphData.value.nodes?.length || 0)
  const linkCount = computed(() => graphData.value.links?.length || 0)
  const nodeTypes = computed(() => {
    const types = new Set()
    graphData.value.nodes?.forEach(node => {
      if (node.type) types.add(node.type)
    })
    return Array.from(types)
  })
  
  // 模拟数据生成函数
  const generateMockGraphData = (options = {}) => {
    const { limit = 50, nodeTypes = ['Person', 'Company', 'Account', 'Transaction'] } = options
    
    const nodes = []
    const links = []
    
    // 生成节点
    for (let i = 0; i < limit; i++) {
      const nodeType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)]
      const node = {
        id: `node_${i}`,
        label: `${nodeType}_${i}`,
        type: nodeType,
        properties: {
          name: `${nodeType} ${i}`,
          created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          risk_score: Math.random() * 100,
          degree: Math.floor(Math.random() * 20) + 1
        },
        x: Math.random() * 800,
        y: Math.random() * 600
      }
      nodes.push(node)
    }
    
    // 生成连接
    const relationshipTypes = ['OWNS', 'TRANSFERS', 'USES', 'LOCATED_AT', 'WORKS_FOR', 'RELATED_TO']
    const linkCount = Math.min(limit * 2, 100)
    
    for (let i = 0; i < linkCount; i++) {
      const sourceIndex = Math.floor(Math.random() * nodes.length)
      let targetIndex = Math.floor(Math.random() * nodes.length)
      
      // 避免自环
      while (targetIndex === sourceIndex) {
        targetIndex = Math.floor(Math.random() * nodes.length)
      }
      
      const relationshipType = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)]
      const link = {
        id: `link_${i}`,
        source: nodes[sourceIndex].id,
        target: nodes[targetIndex].id,
        type: relationshipType,
        properties: {
          weight: Math.random(),
          created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          confidence: Math.random()
        }
      }
      links.push(link)
    }
    
    return { nodes, links }
  }
  
  // API调用函数（目前使用模拟数据）
  const fetchInitialGraph = async (options = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const { $api } = useNuxtApp()
      const response = await $api.graph.getInitialGraph(options)
      
      graphData.value = response.data
    } catch (err) {
      error.value = '获取图数据失败: ' + err.message
      console.error('Failed to fetch initial graph:', err)
    } finally {
      loading.value = false
    }
  }
  
  const fetchFilteredGraph = async (filters = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const { $api } = useNuxtApp()
      const response = await $api.graph.getFilteredGraph(filters)
      
      // 模拟过滤逻辑
      let mockData = generateMockGraphData({ limit: filters.limit || 50 })
      
      // 应用节点类型过滤
      if (filters.node_types && filters.node_types.length > 0) {
        mockData.nodes = mockData.nodes.filter(node => 
          filters.node_types.includes(node.type)
        )
        // 过滤相关的连接
        const nodeIds = new Set(mockData.nodes.map(n => n.id))
        mockData.links = mockData.links.filter(link => 
          nodeIds.has(link.source) && nodeIds.has(link.target)
        )
      }
      
      graphData.value = mockData
    } catch (err) {
      error.value = '过滤图数据失败: ' + err.message
      console.error('Failed to fetch filtered graph:', err)
    } finally {
      loading.value = false
    }
  }
  
  const performAnalysis = async (analysisParams) => {
    loading.value = true
    error.value = null
    
    try {
      const { $api } = useNuxtApp()
      const response = await $api.graph.performAnalysis(analysisParams)
      
      const mockResult = {
        analysis_type: analysisParams.analysis_type,
        parameters: analysisParams,
        result: {
          execution_time: Math.random() * 2000 + 500,
          timestamp: new Date().toISOString()
        }
      }
      
      // 根据分析类型生成不同的结果
      switch (analysisParams.analysis_type) {
        case 'shortest_path':
          mockResult.result.path = [
            analysisParams.source_node,
            `intermediate_${Math.floor(Math.random() * 100)}`,
            analysisParams.target_node
          ]
          mockResult.result.path_length = mockResult.result.path.length - 1
          break
          
        case 'k_hop_neighbors':
          mockResult.result.neighbors = Array.from({ length: Math.floor(Math.random() * 20) + 5 }, 
            (_, i) => `neighbor_${i}`
          )
          mockResult.result.neighbor_count = mockResult.result.neighbors.length
          break
          
        case 'degree_centrality':
          mockResult.result.centrality_scores = Object.fromEntries(
            graphData.value.nodes.slice(0, 10).map(node => [
              node.id, 
              Math.random()
            ])
          )
          break
          
        case 'pagerank':
          mockResult.result.pagerank_scores = Object.fromEntries(
            graphData.value.nodes.slice(0, 10).map(node => [
              node.id, 
              Math.random() * 0.1
            ])
          )
          break
          
        case 'louvain_community':
          mockResult.result.communities = {
            community_count: Math.floor(Math.random() * 5) + 2,
            modularity: Math.random() * 0.5 + 0.3,
            node_communities: Object.fromEntries(
              graphData.value.nodes.slice(0, 20).map(node => [
                node.id,
                Math.floor(Math.random() * 4)
              ])
            )
          }
          break
      }
      
      return mockResult
    } catch (err) {
      error.value = '执行分析失败: ' + err.message
      console.error('Failed to perform analysis:', err)
      return null
    } finally {
      loading.value = false
    }
  }
  
  const performComplexQuery = async (queryParams) => {
    loading.value = true
    error.value = null
    
    try {
      const { $api } = useNuxtApp()
      const response = await $api.graph.performComplexQuery(queryParams)
      
      const mockResult = {
        query_type: queryParams.query_type,
        conditions: queryParams.conditions,
        execution_time: Math.random() * 3000 + 1000,
        timestamp: new Date().toISOString(),
        result_count: Math.floor(Math.random() * 50) + 10,
        nodes: generateMockGraphData({ limit: 20 }).nodes,
        links: []
      }
      
      return mockResult
    } catch (err) {
      error.value = '执行复杂查询失败: ' + err.message
      console.error('Failed to perform complex query:', err)
      return null
    } finally {
      loading.value = false
    }
  }
  
  const expandNode = async (nodeId) => {
    if (expandedNodes.value.has(nodeId)) return
    
    loading.value = true
    try {
      const { $api } = useNuxtApp()
      const response = await $api.graph.expandNode(nodeId)
      
      // 模拟扩展节点数据
      const newNodes = Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, i) => ({
        id: `${nodeId}_expanded_${i}`,
        label: `Expanded ${i}`,
        type: 'Related',
        properties: {
          name: `Related Node ${i}`,
          parent: nodeId
        },
        x: Math.random() * 800,
        y: Math.random() * 600
      }))
      
      const newLinks = newNodes.map((node, i) => ({
        id: `${nodeId}_link_${i}`,
        source: nodeId,
        target: node.id,
        type: 'EXPANDED_FROM',
        properties: {}
      }))
      
      // 添加到现有图数据
      graphData.value.nodes.push(...newNodes)
      graphData.value.links.push(...newLinks)
      expandedNodes.value.add(nodeId)
      
    } catch (err) {
      error.value = '扩展节点失败: ' + err.message
      console.error('Failed to expand node:', err)
    } finally {
      loading.value = false
    }
  }
  
  const collapseNode = (nodeId) => {
    if (!expandedNodes.value.has(nodeId)) return
    
    // 移除扩展的节点和连接
    const expandedNodeIds = graphData.value.nodes
      .filter(node => node.properties?.parent === nodeId)
      .map(node => node.id)
    
    graphData.value.nodes = graphData.value.nodes.filter(
      node => !expandedNodeIds.includes(node.id)
    )
    
    graphData.value.links = graphData.value.links.filter(
      link => !expandedNodeIds.includes(link.source) && !expandedNodeIds.includes(link.target)
    )
    
    expandedNodes.value.delete(nodeId)
  }
  
  const toggleNodeSelection = (nodeId) => {
    if (selectedNodes.value.has(nodeId)) {
      selectedNodes.value.delete(nodeId)
    } else {
      selectedNodes.value.add(nodeId)
    }
  }
  
  const resetGraph = () => {
    graphData.value = { nodes: [], links: [] }
    selectedNodes.value.clear()
    expandedNodes.value.clear()
    error.value = null
  }
  
  const clearError = () => {
    error.value = null
  }
  
  return {
    // 状态
    graphData,
    loading,
    error,
    selectedNodes,
    expandedNodes,
    
    // 计算属性
    nodeCount,
    linkCount,
    nodeTypes,
    
    // 方法
    fetchInitialGraph,
    fetchFilteredGraph,
    performAnalysis,
    performComplexQuery,
    expandNode,
    collapseNode,
    toggleNodeSelection,
    resetGraph,
    clearError
  }
}