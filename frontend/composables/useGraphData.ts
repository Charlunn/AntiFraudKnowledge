import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { $fetch } from 'ofetch'

// 图数据类型定义
export interface GraphNode {
  id: string
  name: string
  category?: string
  type?: string
  value?: number
  degree?: number
  betweenness?: number
  pagerank?: number
  community?: number
  properties?: Record<string, any>
  x?: number
  y?: number
  neighbors?: string[]
}

export interface GraphLink {
  source: string
  target: string
  value?: number
  weight?: number
  label?: string
  type?: string
  frequency?: number
  properties?: Record<string, any>
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
  categories?: Array<{ name: string; itemStyle?: { color: string } }>
}

// API响应类型
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// 查询参数类型
export interface GraphQueryParams {
  node_types?: string[]
  relationship_types?: string[]
  limit?: number
  properties?: Record<string, any>
  time_range?: {
    start: string
    end: string
  }
}

export interface AnalysisParams {
  analysis_type: 'shortest_path' | 'all_paths' | 'k_hop_neighbors' | 'degree_centrality' | 'betweenness_centrality' | 'pagerank' | 'louvain_community' | 'label_propagation'
  source_node?: string
  target_node?: string
  k?: number
  max_paths?: number
  [key: string]: any
}

export interface ComplexQueryParams {
  query_type: 'time_range' | 'property_filter' | 'multi_hop' | 'composite'
  conditions: Record<string, any>
}

export const useGraphData = () => {
  // 响应式状态
  const graphData: Ref<GraphData> = ref({ nodes: [], links: [] })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedNodes = ref<Set<string>>(new Set())
  const expandedNodes = ref<Set<string>>(new Set())
  
  // API基础URL - 使用相对路径，通过代理转发
  const API_BASE = '/api/graph'
  
  // 计算属性
  const nodeCount = computed(() => graphData.value.nodes?.length || 0)
  const linkCount = computed(() => graphData.value.links?.length || 0)
  const nodeTypes = computed(() => {
    if (!graphData.value.nodes || !Array.isArray(graphData.value.nodes)) {
      return []
    }
    const types = new Set(graphData.value.nodes.map(node => node.category || node.type || 'unknown'))
    return Array.from(types)
  })
  
  // 工具函数
  const handleApiError = (err: any): string => {
    console.error('API Error:', err)
    if (err.response?.data?.error) {
      return err.response.data.error
    }
    if (err.response?.data?.message) {
      return err.response.data.message
    }
    if (err.message) {
      return err.message
    }
    return '请求失败，请稍后重试'
  }
  
  const makeRequest = async <T>(url: string, options: any = {}): Promise<T> => {
    try {
      const response = await $fetch<ApiResponse<T>>(url, {
        baseURL: API_BASE,
        ...options
      })
      
      if (!response.success) {
        throw new Error(response.error || response.message || '请求失败')
      }
      
      return response.data
    } catch (err) {
      throw new Error(handleApiError(err))
    }
  }
  
  // API方法
  
  /**
   * 获取初始图数据
   */
  const fetchInitialGraph = async (params: GraphQueryParams = {}): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      const data = await makeRequest<GraphData>('/initial/', {
        method: 'GET',
        query: params
      })
      
      graphData.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取图数据失败'
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取过滤后的图数据
   */
  const fetchFilteredGraph = async (params: GraphQueryParams): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      const data = await makeRequest<GraphData>('/filtered/', {
        method: 'GET',
        query: params
      })
      
      graphData.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取过滤图数据失败'
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取节点详情
   */
  const fetchNodeDetail = async (nodeId: string): Promise<GraphNode | null> => {
    loading.value = true
    error.value = null
    
    try {
      const data = await makeRequest<GraphNode>(`/node/${nodeId}/`, {
        method: 'GET'
      })
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取节点详情失败'
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 创建节点
   */
  const createNode = async (nodeData: Partial<GraphNode>): Promise<GraphNode | null> => {
    loading.value = true
    error.value = null
    
    try {
      const data = await makeRequest<GraphNode>('/nodes/', {
        method: 'POST',
        body: nodeData
      })
      
      // 更新本地数据
      graphData.value.nodes.push(data)
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建节点失败'
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 更新节点
   */
  const updateNode = async (nodeId: string, nodeData: Partial<GraphNode>): Promise<GraphNode | null> => {
    loading.value = true
    error.value = null
    
    try {
      const data = await makeRequest<GraphNode>(`/nodes/${nodeId}/`, {
        method: 'PUT',
        body: nodeData
      })
      
      // 更新本地数据
      const index = graphData.value.nodes.findIndex(node => node.id === nodeId)
      if (index !== -1) {
        graphData.value.nodes[index] = { ...graphData.value.nodes[index], ...data }
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新节点失败'
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 删除节点
   */
  const deleteNode = async (nodeId: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      await makeRequest(`/nodes/${nodeId}/`, {
        method: 'DELETE'
      })
      
      // 更新本地数据
      graphData.value.nodes = graphData.value.nodes.filter(node => node.id !== nodeId)
      graphData.value.links = graphData.value.links.filter(
        link => link.source !== nodeId && link.target !== nodeId
      )
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除节点失败'
      return false
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 创建关系
   */
  const createRelationship = async (relationshipData: Partial<GraphLink>): Promise<GraphLink | null> => {
    loading.value = true
    error.value = null
    
    try {
      const data = await makeRequest<GraphLink>('/relationships/', {
        method: 'POST',
        body: relationshipData
      })
      
      // 更新本地数据
      graphData.value.links.push(data)
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建关系失败'
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 执行图分析
   */
  const performAnalysis = async (params: AnalysisParams): Promise<any> => {
    loading.value = true
    error.value = null
    
    try {
      const data = await makeRequest('/analysis/', {
        method: 'POST',
        body: params
      })
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '图分析失败'
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 执行复杂查询
   */
  const performComplexQuery = async (params: ComplexQueryParams): Promise<GraphData | null> => {
    loading.value = true
    error.value = null
    
    try {
      const data = await makeRequest<GraphData>('/complex-query/', {
        method: 'POST',
        body: params
      })
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '复杂查询失败'
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取图统计信息
   */
  const fetchGraphStatistics = async (statType: string = 'basic'): Promise<any> => {
    loading.value = true
    error.value = null
    
    try {
      const data = await makeRequest(`/statistics/?stat_type=${statType}`, {
        method: 'GET'
      })
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取统计信息失败'
      return null
    } finally {
      loading.value = false
    }
  }
  
  // 本地数据操作方法
  
  /**
   * 展开节点（获取邻居节点）
   */
  const expandNode = async (nodeId: string): Promise<void> => {
    if (expandedNodes.value.has(nodeId)) {
      return
    }
    
    try {
      const neighbors = await performAnalysis({
        analysis_type: 'k_hop_neighbors',
        source_node: nodeId,
        k: 1
      })
      
      if (neighbors && neighbors.nodes && neighbors.links) {
        // 合并新节点（避免重复）
        const existingNodeIds = new Set(graphData.value.nodes.map(n => n.id))
        const newNodes = neighbors.nodes.filter((n: GraphNode) => !existingNodeIds.has(n.id))
        graphData.value.nodes.push(...newNodes)
        
        // 合并新边（避免重复）
        const existingLinks = new Set(
          graphData.value.links.map(l => `${l.source}-${l.target}`)
        )
        const newLinks = neighbors.links.filter(
          (l: GraphLink) => !existingLinks.has(`${l.source}-${l.target}`)
        )
        graphData.value.links.push(...newLinks)
        
        expandedNodes.value.add(nodeId)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '展开节点失败'
    }
  }
  
  /**
   * 折叠节点（移除邻居节点）
   */
  const collapseNode = (nodeId: string): void => {
    if (!expandedNodes.value.has(nodeId)) {
      return
    }
    
    // 获取该节点的直接邻居
    const neighbors = new Set<string>()
    graphData.value.links.forEach(link => {
      if (link.source === nodeId) {
        neighbors.add(link.target)
      } else if (link.target === nodeId) {
        neighbors.add(link.source)
      }
    })
    
    // 移除只与该节点相连的邻居节点
    const nodesToRemove = new Set<string>()
    neighbors.forEach(neighborId => {
      const connections = graphData.value.links.filter(
        link => (link.source === neighborId || link.target === neighborId) && 
               link.source !== nodeId && link.target !== nodeId
      )
      
      if (connections.length === 0) {
        nodesToRemove.add(neighborId)
      }
    })
    
    // 移除节点和相关边
    graphData.value.nodes = graphData.value.nodes.filter(
      node => !nodesToRemove.has(node.id)
    )
    graphData.value.links = graphData.value.links.filter(
      link => !nodesToRemove.has(link.source) && !nodesToRemove.has(link.target)
    )
    
    expandedNodes.value.delete(nodeId)
  }
  
  /**
   * 选择/取消选择节点
   */
  const toggleNodeSelection = (nodeId: string): void => {
    if (selectedNodes.value.has(nodeId)) {
      selectedNodes.value.delete(nodeId)
    } else {
      selectedNodes.value.add(nodeId)
    }
  }
  
  /**
   * 清除所有选择
   */
  const clearSelection = (): void => {
    selectedNodes.value.clear()
  }
  
  /**
   * 重置图数据
   */
  const resetGraph = (): void => {
    graphData.value = { nodes: [], links: [] }
    selectedNodes.value.clear()
    expandedNodes.value.clear()
    error.value = null
  }
  
  /**
   * 搜索节点
   */
  const searchNodes = (query: string): GraphNode[] => {
    if (!query.trim()) {
      return []
    }
    
    const lowerQuery = query.toLowerCase()
    return graphData.value.nodes.filter(node => 
      node.name.toLowerCase().includes(lowerQuery) ||
      node.id.toLowerCase().includes(lowerQuery) ||
      (node.category && node.category.toLowerCase().includes(lowerQuery))
    )
  }
  
  return {
    // 状态
    graphData: readonly(graphData),
    loading: readonly(loading),
    error: readonly(error),
    selectedNodes: readonly(selectedNodes),
    expandedNodes: readonly(expandedNodes),
    
    // 计算属性
    nodeCount,
    linkCount,
    nodeTypes,
    
    // API方法
    fetchInitialGraph,
    fetchFilteredGraph,
    fetchNodeDetail,
    createNode,
    updateNode,
    deleteNode,
    createRelationship,
    performAnalysis,
    performComplexQuery,
    fetchGraphStatistics,
    
    // 本地操作方法
    expandNode,
    collapseNode,
    toggleNodeSelection,
    clearSelection,
    resetGraph,
    searchNodes
  }
}

// 导出类型
export type { GraphNode, GraphLink, GraphData, GraphQueryParams, AnalysisParams, ComplexQueryParams }