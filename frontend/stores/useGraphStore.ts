import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '#imports'
import {
  fetchFilteredGraph,
  fetchGraphMetadata,
  fetchInitialGraph,
  fetchNodeNeighborhood,
  fetchUniversalSearch
} from '~/api/graph'
import type { GraphApiLink, GraphApiNode, GraphApiPayload, GraphInitialResponse } from '~/api/graph'
import type {
  AdvancedAnalysisPayload,
  GraphElement,
  GraphFilters,
  GraphMetadataLabelSummary,
  GraphMetadataNodeSummary,
  GraphMetadataRelationshipSummary,
  GraphMetadataResponse,
  GraphNodeElement,
  GraphEdgeElement,
  GraphUniversalRelationship,
  GraphUniversalSearchResult,
  LayoutType,
  NetworkAnalysisRequest,
  RedactionLevel,
  RiskLevel,
  ScenarioPayload,
  TimelineConfig
} from '~/types/graph'
import mockGraph from '~/mocks/graph/elements.json'
import {
  aiExplainSections,
  defaultScenario,
  evidenceListMock,
  pitfalls as pitfallsMock,
  trendingInsights
} from '~/mocks/graph/insights'
import { useUIStore } from './useUIStore'

interface GraphStateMetadata {
  nodes: GraphMetadataNodeSummary[]
  labels: GraphMetadataLabelSummary[]
  relationships: GraphMetadataRelationshipSummary[]
  pagination: {
    skip: number
    limit: number
    hasMore: boolean
  }
}

interface FilterRequestOptions {
  limit?: number
}

interface FocusOptions {
  limit?: number
}

const DEFAULT_LIMIT = 80
const FALLBACK_METADATA_LIMIT = 10

function createDefaultFilters(): GraphFilters {
  return {
    types: [],
    channels: [],
    roles: [],
    confidence: 0.6,
    regions: [],
    sources: [],
    nodeKinds: [],
    edgeKinds: [],
    focusNodes: [],
    searchTerm: ''
  }
}

const redactionMessages: Record<RedactionLevel, string> = {
  weak: 'graph.rightPanel.redactionWeak',
  medium: 'graph.rightPanel.redactionMedium',
  strong: 'graph.rightPanel.redactionStrong'
}

function cloneNode(node: GraphNodeElement): GraphNodeElement {
  return {
    data: { ...node.data },
    position: node.position ? { ...node.position } : undefined,
    classes: node.classes
  }
}

function cloneEdge(edge: GraphEdgeElement): GraphEdgeElement {
  return {
    data: { ...edge.data },
    classes: edge.classes
  }
}

function mergeUniqueNodes(base: GraphNodeElement[], incoming: GraphNodeElement[]): GraphNodeElement[] {
  const map = new Map<string, GraphNodeElement>()
  base.forEach((node) => map.set(node.data.id, cloneNode(node)))
  incoming.forEach((node) => map.set(node.data.id, cloneNode(node)))
  return Array.from(map.values())
}

function mergeUniqueEdges(base: GraphEdgeElement[], incoming: GraphEdgeElement[]): GraphEdgeElement[] {
  const map = new Map<string, GraphEdgeElement>()
  base.forEach((edge) => map.set(edge.data.id, cloneEdge(edge)))
  incoming.forEach((edge) => map.set(edge.data.id, cloneEdge(edge)))
  return Array.from(map.values())
}

function unwrapApiResponse<T>(response: unknown): T | null {
  if (!response || typeof response !== 'object') return null
  const payload = response as Record<string, unknown>
  if ('data' in payload && payload.data !== undefined && payload.data !== null) {
    return payload.data as T
  }
  return payload as unknown as T
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === 'low' || value === 'medium' || value === 'high'
}

function toGraphNode(node: GraphApiNode): GraphNodeElement {
  const riskLevel = isRiskLevel(node.properties?.riskLevel) ? (node.properties?.riskLevel as RiskLevel) : 'medium'
  const badges = Array.isArray(node.properties?.badges)
    ? (node.properties?.badges as unknown[]).map(String)
    : []
  const source = typeof node.properties?.source === 'string' ? (node.properties?.source as string) : 'unknown'
  const suspiciousScore = typeof node.properties?.suspiciousScore === 'number' ? (node.properties?.suspiciousScore as number) : undefined
  const relatedCases = typeof node.properties?.relatedCases === 'number' ? (node.properties?.relatedCases as number) : undefined
  const degree = typeof node.properties?.degree === 'number' ? (node.properties?.degree as number) : undefined
  const updatedAt = typeof node.properties?.updatedAt === 'string' ? (node.properties?.updatedAt as string) : new Date().toISOString()

  return {
    data: {
      id: node.id,
      label: node.name ?? node.id,
      type: node.category ?? 'unknown',
      riskLevel,
      badges,
      updatedAt,
      source,
      relatedCases: relatedCases ?? (typeof node.value === 'number' ? node.value : undefined),
      suspiciousScore,
      degree,
      size: typeof node.symbolSize === 'number' ? node.symbolSize : undefined
    }
  }
}

function toGraphEdge(edge: GraphApiLink, index: number): GraphEdgeElement {
  const label = typeof edge.label === 'string' ? edge.label : edge.label?.formatter ?? edge.type ?? ''
  const updatedAt = typeof edge.properties?.updatedAt === 'string' ? (edge.properties?.updatedAt as string) : new Date().toISOString()
  const sourceTag = typeof edge.properties?.sourceTag === 'string' ? (edge.properties?.sourceTag as string) : 'api'
  const confidence = typeof edge.properties?.confidence === 'number' ? (edge.properties?.confidence as number) : undefined
  const id =
    typeof edge.properties?.id === 'string'
      ? (edge.properties?.id as string)
      : `${edge.source}-${edge.target}-${edge.type ?? index}`

  return {
    data: {
      id,
      source: edge.source,
      target: edge.target,
      label,
      type: edge.type ?? 'related',
      weight: typeof edge.value === 'number' ? edge.value : undefined,
      confidence,
      updatedAt,
      sourceTag
    }
  }
}

function transformGraphPayload(payload?: GraphApiPayload | null): { nodes: GraphNodeElement[]; edges: GraphEdgeElement[] } {
  if (!payload) {
    return { nodes: [], edges: [] }
  }

  const nodes = (payload.nodes ?? []).map((node) => toGraphNode(node))
  const edges = (payload.links ?? []).map((edge, index) => toGraphEdge(edge, index))
  return { nodes, edges }
}

function buildMetadataFromGraph(
  nodes: GraphNodeElement[],
  edges: GraphEdgeElement[],
  limit: number
): GraphStateMetadata {
  const degreeMap = new Map<string, number>()
  edges.forEach((edge) => {
    degreeMap.set(edge.data.source, (degreeMap.get(edge.data.source) ?? 0) + 1)
    degreeMap.set(edge.data.target, (degreeMap.get(edge.data.target) ?? 0) + 1)
  })

  const nodeItems: GraphMetadataNodeSummary[] = nodes
    .map((node) => ({
      id: node.data.id,
      elementId: node.data.id,
      labels: node.data.type ? [node.data.type] : [],
      name: node.data.label,
      degree: degreeMap.get(node.data.id) ?? node.data.degree ?? 0,
      properties: {
        source: node.data.source,
        riskLevel: node.data.riskLevel,
        badges: node.data.badges,
        suspiciousScore: node.data.suspiciousScore
      }
    }))
    .sort((a, b) => b.degree - a.degree)

  const limitedNodes = nodeItems.slice(0, limit)

  const labelCounts = new Map<string, number>()
  nodes.forEach((node) => {
    const key = node.data.type ?? 'unknown'
    labelCounts.set(key, (labelCounts.get(key) ?? 0) + 1)
  })

  const relationshipCounts = new Map<string, number>()
  edges.forEach((edge) => {
    const key = edge.data.type ?? 'related'
    relationshipCounts.set(key, (relationshipCounts.get(key) ?? 0) + 1)
  })

  return {
    nodes: limitedNodes,
    labels: Array.from(labelCounts.entries()).map(([label, count]) => ({ label, count })),
    relationships: Array.from(relationshipCounts.entries()).map(([type, count]) => ({ type, count })),
    pagination: {
      skip: limitedNodes.length,
      limit,
      hasMore: nodeItems.length > limit
    }
  }
}

function metadataNodeToGraphNode(node: GraphMetadataNodeSummary, index: number): GraphNodeElement {
  return {
    data: {
      id: node.elementId ?? node.id ?? `search-node-${index}`,
      label: node.name ?? node.id ?? `节点-${index + 1}`,
      type: node.labels[0] ?? 'unknown',
      riskLevel: 'medium',
      badges: Array.isArray(node.properties?.badges)
        ? (node.properties?.badges as unknown[]).map(String)
        : [],
      updatedAt: new Date().toISOString(),
      source: typeof node.properties?.source === 'string' ? (node.properties?.source as string) : 'search',
      relatedCases: typeof node.properties?.relatedCases === 'number' ? (node.properties?.relatedCases as number) : undefined,
      suspiciousScore: typeof node.properties?.suspiciousScore === 'number' ? (node.properties?.suspiciousScore as number) : undefined,
      degree: node.degree,
      size: 42 + Math.min(node.degree, 20) * 2
    }
  }
}

function metadataRelationshipToEdge(rel: GraphUniversalRelationship, index: number): GraphEdgeElement | null {
  if (!rel.source || !rel.target) {
    return null
  }

  return {
    data: {
      id: rel.id ?? `search-edge-${index}`,
      source: rel.source,
      target: rel.target,
      label: rel.type ?? '关联',
      type: rel.type ?? 'related',
      weight: undefined,
      confidence: undefined,
      updatedAt: new Date().toISOString(),
      sourceTag: 'search'
    }
  }
}

function hasFilterCriteria(filters: GraphFilters): boolean {
  return (
    filters.nodeKinds.length > 0 ||
    filters.edgeKinds.length > 0 ||
    filters.searchTerm.trim().length > 0 ||
    filters.sources.length > 0 ||
    filters.regions.length > 0 ||
    filters.roles.length > 0 ||
    filters.types.length > 0 ||
    filters.channels.length > 0
  )
}

function performLocalSearch(
  query: string,
  nodes: GraphNodeElement[],
  edges: GraphEdgeElement[]
): { nodes: GraphNodeElement[]; edges: GraphEdgeElement[] } {
  const lower = query.toLowerCase()
  const matchedNodes = nodes.filter((node) => {
    return (
      node.data.label.toLowerCase().includes(lower) ||
      node.data.id.toLowerCase().includes(lower) ||
      (node.data.source ?? '').toLowerCase().includes(lower)
    )
  })

  if (!matchedNodes.length) {
    return { nodes: [], edges: [] }
  }

  const nodeIdSet = new Set(matchedNodes.map((node) => node.data.id))
  const matchedEdges = edges.filter((edge) => {
    return (
      edge.data.label.toLowerCase().includes(lower) ||
      nodeIdSet.has(edge.data.source) ||
      nodeIdSet.has(edge.data.target)
    )
  })

  matchedEdges.forEach((edge) => {
    nodeIdSet.add(edge.data.source)
    nodeIdSet.add(edge.data.target)
  })

  const finalNodes = nodes.filter((node) => nodeIdSet.has(node.data.id))
  const finalEdges = matchedEdges.filter(
    (edge) => nodeIdSet.has(edge.data.source) && nodeIdSet.has(edge.data.target)
  )

  return {
    nodes: finalNodes.map(cloneNode),
    edges: finalEdges.map(cloneEdge)
  }
}

function applyLocalFilters(
  filters: GraphFilters,
  baseNodes: GraphNodeElement[],
  baseEdges: GraphEdgeElement[]
): { nodes: GraphNodeElement[]; edges: GraphEdgeElement[] } {
  const nodeKinds = new Set(filters.nodeKinds)
  const edgeKinds = new Set(filters.edgeKinds)
  const search = filters.searchTerm.trim().toLowerCase()

  let filteredNodes = baseNodes.filter((node) => {
    if (nodeKinds.size && !nodeKinds.has(node.data.type)) return false
    if (filters.sources.length && !filters.sources.includes(node.data.source)) return false
    if (!search) return true
    return (
      node.data.label.toLowerCase().includes(search) ||
      node.data.id.toLowerCase().includes(search) ||
      (node.data.source ?? '').toLowerCase().includes(search)
    )
  })

  if (!filteredNodes.length && search) {
    filteredNodes = baseNodes.filter((node) => node.data.label.toLowerCase().includes(search))
  }

  const nodeIdSet = new Set(filteredNodes.map((node) => node.data.id))

  let filteredEdges = baseEdges.filter((edge) => {
    if (edgeKinds.size && !edgeKinds.has(edge.data.type)) return false
    if (filters.sources.length && !filters.sources.includes(edge.data.sourceTag)) return false

    const matchesSearch = search
      ? edge.data.label.toLowerCase().includes(search)
      : true

    return (
      matchesSearch &&
      (nodeIdSet.has(edge.data.source) || nodeIdSet.has(edge.data.target))
    )
  })

  filteredEdges.forEach((edge) => {
    nodeIdSet.add(edge.data.source)
    nodeIdSet.add(edge.data.target)
  })

  const finalNodes = baseNodes.filter((node) => nodeIdSet.has(node.data.id))
  const finalEdges = filteredEdges.filter(
    (edge) => nodeIdSet.has(edge.data.source) && nodeIdSet.has(edge.data.target)
  )

  return {
    nodes: finalNodes.map(cloneNode),
    edges: finalEdges.map(cloneEdge)
  }
}

export const useGraphStore = defineStore('graph', () => {
  const uiStore = useUIStore()
  const runtimeConfig = useRuntimeConfig?.()
  const configMockFlag = Boolean(
    runtimeConfig?.public?.graphUseMock ??
      runtimeConfig?.public?.useGraphMock ??
      runtimeConfig?.public?.graphMock ??
      false
  )
  const envMockFlag =
    typeof process !== 'undefined' && process?.env?.NUXT_PUBLIC_GRAPH_USE_MOCK === 'true'
  const isMockMode = ref(configMockFlag || envMockFlag)
  const mockDataset = mockGraph as unknown as {
    nodes: GraphNodeElement[]
    edges: GraphEdgeElement[]
  }

  const layout = ref<LayoutType>('force')
  const availableLayouts: LayoutType[] = ['force', 'hierarchy', 'timeline']
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const graphLimit = ref(DEFAULT_LIMIT)

  const filters = ref<GraphFilters>(createDefaultFilters())
  const redactionLevel = ref<RedactionLevel>('medium')
  const timeline = ref<TimelineConfig>({
    enabled: false,
    range: [
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      new Date().toISOString()
    ]
  })

  const nodes = ref<GraphNodeElement[]>([])
  const edges = ref<GraphEdgeElement[]>([])
  const sourceNodes = ref<GraphNodeElement[]>([])
  const sourceEdges = ref<GraphEdgeElement[]>([])
  const initialNodes = ref<GraphNodeElement[]>([])
  const initialEdges = ref<GraphEdgeElement[]>([])

const metadata = ref<GraphStateMetadata>({
  nodes: [],
  labels: [],
  relationships: [],
  pagination: {
    skip: 0,
    limit: FALLBACK_METADATA_LIMIT,
    hasMore: false
  }
})

const metadataBaseline = ref<GraphStateMetadata | null>(null)
  const metadataLoading = ref(false)
  const searchResults = ref<GraphUniversalSearchResult | null>(null)

  const trending = ref(trendingInsights)
  const pitfalls = ref(pitfallsMock)
  const aiExplain = ref(aiExplainSections)
  const evidenceList = ref(evidenceListMock)
  const scenario = ref(defaultScenario)
  const selectedId = ref<string | null>(null)
  const lastUpdatedAt = ref(new Date().toISOString())

  function setSourceGraph(
    nextNodes: GraphNodeElement[],
    nextEdges: GraphEdgeElement[],
    options: { resetInitial?: boolean } = {}
  ) {
    sourceNodes.value = nextNodes.map(cloneNode)
    sourceEdges.value = nextEdges.map(cloneEdge)
    nodes.value = sourceNodes.value.map(cloneNode)
    edges.value = sourceEdges.value.map(cloneEdge)
    console.info('[GraphStore] Source graph updated', {
      sourceNodes: sourceNodes.value.length,
      sourceEdges: sourceEdges.value.length
    })

    if (options.resetInitial) {
      initialNodes.value = sourceNodes.value.map(cloneNode)
      initialEdges.value = sourceEdges.value.map(cloneEdge)
      metadataBaseline.value = null
    }

    filters.value.focusNodes = []
    selectedId.value = null
    lastUpdatedAt.value = new Date().toISOString()
  }

  function setCurrentGraph(nextNodes: GraphNodeElement[], nextEdges: GraphEdgeElement[]) {
    nodes.value = nextNodes.map(cloneNode)
    edges.value = nextEdges.map(cloneEdge)
    selectedId.value = null
    lastUpdatedAt.value = new Date().toISOString()
  }

  function loadMockGraph(options: { resetInitial?: boolean; limit?: number } = {}) {
    const resetInitial = options.resetInitial ?? !initialNodes.value.length
    const limit = options.limit ?? graphLimit.value ?? DEFAULT_LIMIT
    graphLimit.value = limit
    isMockMode.value = true
    setSourceGraph(mockDataset.nodes, mockDataset.edges, { resetInitial })
    updateMetadataFromSource()
    isLoading.value = false
    error.value = null
  }

  function updateMetadataFromSource() {
    const summary = buildMetadataFromGraph(
      sourceNodes.value,
      sourceEdges.value,
      metadata.value.pagination.limit
    )
    metadata.value = summary
    if (!metadataBaseline.value) {
      metadataBaseline.value = JSON.parse(JSON.stringify(summary)) as GraphStateMetadata
    }
    const suggestions = summary.nodes
      .map((item) => item.name || item.id)
      .filter((item): item is string => Boolean(item))
      .slice(0, 8)
    if (suggestions.length) {
      uiStore.setSearchSuggestions(suggestions)
    }
  }

  function setLayout(next: LayoutType) {
    if (!availableLayouts.includes(next)) return
    layout.value = next
  }

  async function initialize(limit = graphLimit.value) {
    error.value = null
    graphLimit.value = limit

    if (isMockMode.value) {
      loadMockGraph({ resetInitial: !sourceNodes.value.length, limit })
      return
    }

    isLoading.value = true

    try {
      const response = await fetchInitialGraph(limit)
      const payload = unwrapApiResponse<GraphInitialResponse>(response)
      if (payload?.graph) {
        const { nodes: nextNodes, edges: nextEdges } = transformGraphPayload(payload.graph)
        console.info('[GraphStore] Initial graph loaded', {
          nodes: nextNodes.length,
          edges: nextEdges.length
        })
        setSourceGraph(nextNodes, nextEdges, { resetInitial: true })
        if (!metadata.value.nodes.length) {
          updateMetadataFromSource()
        }
        return
      }
      throw new Error('Graph payload is empty')
    } catch (err) {
      console.warn('Failed to load graph from API, using fallback data.', err)
      loadMockGraph({ resetInitial: true, limit })
    } finally {
      isLoading.value = false
    }
  }

  function setFilters(value: GraphFilters) {
    filters.value = { ...createDefaultFilters(), ...value }
  }

  function applyFocusLocally(nodeIds: string[]) {
    if (!nodeIds.length) {
      resetView()
      return
    }

    const focusSet = new Set(nodeIds)
    const relatedEdges = sourceEdges.value.filter(
      (edge) => focusSet.has(edge.data.source) || focusSet.has(edge.data.target)
    )
    relatedEdges.forEach((edge) => {
      focusSet.add(edge.data.source)
      focusSet.add(edge.data.target)
    })

    const relatedNodes = sourceNodes.value.filter((node) => focusSet.has(node.data.id))
    const filteredEdges = relatedEdges.filter(
      (edge) => focusSet.has(edge.data.source) && focusSet.has(edge.data.target)
    )
    setCurrentGraph(relatedNodes, filteredEdges)
  }

  async function applyFilters(options: FilterRequestOptions = {}) {
    const limit = options.limit ?? graphLimit.value
    graphLimit.value = limit

    const focusIds = filters.value.focusNodes
    const hasCriteria = hasFilterCriteria(filters.value)

    if (!hasCriteria && !focusIds.length) {
      resetView()
      return
    }

    if (!hasCriteria && focusIds.length) {
      await focusOnNodes(focusIds, { limit })
      return
    }

    const baseNodes = initialNodes.value.length ? initialNodes.value : sourceNodes.value
    const baseEdges = initialEdges.value.length ? initialEdges.value : sourceEdges.value

    if (isMockMode.value) {
      const result = applyLocalFilters(filters.value, baseNodes, baseEdges)
      if (!result.nodes.length && !focusIds.length) {
        error.value = '没有符合条件的数据'
        setCurrentGraph(sourceNodes.value, sourceEdges.value)
        return
      }
      error.value = null
      setCurrentGraph(result.nodes, result.edges)
      if (focusIds.length) {
        applyFocusLocally(focusIds)
      }
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetchFilteredGraph({
        nodeTypes: filters.value.nodeKinds.length ? filters.value.nodeKinds : undefined,
        relationshipTypes: filters.value.edgeKinds.length ? filters.value.edgeKinds : undefined,
        search: filters.value.searchTerm.trim() || undefined,
        limit
      })

      const payload = unwrapApiResponse<GraphInitialResponse>(response)
      if (payload?.graph) {
        const { nodes: nextNodes, edges: nextEdges } = transformGraphPayload(payload.graph)
        if (!nextNodes.length && !focusIds.length) {
          error.value = '没有符合条件的数据'
          setCurrentGraph(sourceNodes.value, sourceEdges.value)
          return
        }
        error.value = null
        setCurrentGraph(nextNodes, nextEdges)
        if (focusIds.length) {
          applyFocusLocally(focusIds)
        }
        return
      }
      throw new Error('Filtered graph is empty')
    } catch (err) {
      console.warn('Falling back to local filtering because remote filter failed.', err)
      const result = applyLocalFilters(filters.value, baseNodes, baseEdges)
      if (!result.nodes.length && !focusIds.length) {
        error.value = '没有符合条件的数据'
        setCurrentGraph(sourceNodes.value, sourceEdges.value)
        return
      }
      error.value = null
      setCurrentGraph(result.nodes, result.edges)
      if (focusIds.length) {
        applyFocusLocally(focusIds)
      }
    } finally {
      isLoading.value = false
    }
  }

  async function loadMetadata(reset = true) {
    if (metadataLoading.value) return
    if (isMockMode.value) {
      updateMetadataFromSource()
      return
    }

    metadataLoading.value = true
    try {
      const limit = metadata.value.pagination.limit
      const skip = reset ? 0 : metadata.value.pagination.skip
      const response = await fetchGraphMetadata({
        nodeLimit: limit,
        nodeSkip: skip,
        relationshipLimit: 20,
        labelLimit: 20
      })

      const payload = unwrapApiResponse<GraphMetadataResponse>(response)
      if (payload) {
        const existingNodes = reset ? [] : metadata.value.nodes
        const mergedMap = new Map<string, GraphMetadataNodeSummary>()
        existingNodes.forEach((item) => mergedMap.set(item.elementId ?? item.id, item))
        payload.nodes.items.forEach((item) => {
          mergedMap.set(item.elementId ?? item.id, item)
        })

        metadata.value = {
          nodes: Array.from(mergedMap.values()),
          labels: payload.labels,
          relationships: payload.relationships,
          pagination: {
            skip: payload.nodes.pagination.skip + payload.nodes.items.length,
            limit: payload.nodes.pagination.limit,
            hasMore: payload.nodes.pagination.hasMore
          }
        }
        if (!metadataBaseline.value) {
          metadataBaseline.value = JSON.parse(JSON.stringify(metadata.value)) as GraphStateMetadata
        }

        const suggestions = metadata.value.nodes
          .map((item) => item.name || item.id)
          .filter((item): item is string => Boolean(item))
          .slice(0, 8)
        if (suggestions.length) {
          uiStore.setSearchSuggestions(suggestions)
        }
        return
      }

      updateMetadataFromSource()
    } catch (err) {
      console.warn('Failed to load metadata from API, using local fallback.', err)
      updateMetadataFromSource()
    } finally {
      metadataLoading.value = false
    }
  }

  async function loadMoreMetadataNodes() {
    if (!metadata.value.pagination.hasMore) return
    await loadMetadata(false)
  }

  function selectElement(id: string | null) {
    selectedId.value = id
  }

  async function expandNode(nodeId: string) {
    if (!nodeId) return
    if (isMockMode.value) {
      applyFocusLocally([nodeId])
      return
    }

    isLoading.value = true
    try {
      const response = await fetchNodeNeighborhood(nodeId, graphLimit.value)
      const payload = unwrapApiResponse<GraphInitialResponse>(response)
      if (payload?.graph) {
        const { nodes: incomingNodes, edges: incomingEdges } = transformGraphPayload(payload.graph)
        const mergedNodes = mergeUniqueNodes(sourceNodes.value, incomingNodes)
        const mergedEdges = mergeUniqueEdges(sourceEdges.value, incomingEdges)
        setSourceGraph(mergedNodes, mergedEdges, { resetInitial: true })
        updateMetadataFromSource()
      }
    } catch (err) {
      console.warn('Failed to expand node.', err)
    } finally {
      isLoading.value = false
    }
  }

  async function focusOnNodes(nodeIds: string[], options: FocusOptions = {}) {
    const uniqueIds = Array.from(new Set(nodeIds.filter(Boolean)))
    filters.value.focusNodes = uniqueIds

    if (!uniqueIds.length) {
      resetView()
      return
    }

    if (isMockMode.value) {
      applyFocusLocally(uniqueIds)
      return
    }

    let hasRemoteResult = false
    isLoading.value = true
    try {
      const response = await fetchNodeNeighborhood(uniqueIds[0], options.limit ?? graphLimit.value)
      const payload = unwrapApiResponse<GraphInitialResponse>(response)
      if (payload?.graph) {
        const { nodes: nextNodes, edges: nextEdges } = transformGraphPayload(payload.graph)
        setCurrentGraph(nextNodes, nextEdges)
        hasRemoteResult = true
      }
    } catch (err) {
      console.warn('Failed to focus using remote neighborhood, falling back locally.', err)
    } finally {
      isLoading.value = false
    }

    if (!hasRemoteResult) {
      applyFocusLocally(uniqueIds)
    }
  }

  async function showAllNeighbors() {
    const nextLimit = graphLimit.value + 20
    graphLimit.value = nextLimit

    if (filters.value.focusNodes.length) {
      await focusOnNodes(filters.value.focusNodes, { limit: nextLimit })
      return
    }

    if (hasFilterCriteria(filters.value)) {
      await applyFilters({ limit: nextLimit })
    } else {
      await initialize(nextLimit)
    }
  }

  async function runNetworkAnalysis(request: NetworkAnalysisRequest) {
    // 简易分析：选中度数最高的节点以提示用户
    const sorted = [...sourceNodes.value].sort(
      (a, b) => (b.data.degree ?? 0) - (a.data.degree ?? 0)
    )
    if (sorted.length) {
      selectedId.value = sorted[0].data.id
    }

    if (request.algorithm === 'timeline') {
      layout.value = 'timeline'
    }
  }

  async function applyAdvanced(payload: AdvancedAnalysisPayload) {
    layout.value = payload.layout
    redactionLevel.value = payload.redaction
    filters.value = { ...createDefaultFilters(), ...payload.filters }
    timeline.value = {
      enabled: payload.timeline.enabled,
      range: [...payload.timeline.range] as [string, string]
    }

    await applyFilters()
  }

  function setRedaction(level: RedactionLevel) {
    redactionLevel.value = level
  }

  function updateTimeline(next: TimelineConfig) {
    timeline.value = {
      enabled: next.enabled,
      range: [...next.range] as [string, string]
    }
  }

  function resetView() {
    setCurrentGraph(sourceNodes.value, sourceEdges.value)
    filters.value.focusNodes = []
    searchResults.value = null
  }

  async function performUniversalSearch(query: string) {
    const trimmed = query.trim()
    if (!trimmed) return

    filters.value.searchTerm = trimmed
    error.value = null

    if (isMockMode.value) {
      const fallback = performLocalSearch(trimmed, sourceNodes.value, sourceEdges.value)
      if (fallback.nodes.length || fallback.edges.length) {
        setSourceGraph(fallback.nodes, fallback.edges, { resetInitial: false })
        updateMetadataFromSource()
      } else {
        resetView()
      }
      return
    }

    isLoading.value = true

    try {
      const response = await fetchUniversalSearch(trimmed, {
        nodeLimit: 30,
        relationshipLimit: 40
      })

      const payload = unwrapApiResponse<GraphUniversalSearchResult>(response)

      if (payload) {
        searchResults.value = payload
        const searchNodes = payload.nodes.map((node, index) => metadataNodeToGraphNode(node, index))
        const searchEdges = payload.relationships
          .map((rel, index) => metadataRelationshipToEdge(rel, index))
          .filter((edge): edge is GraphEdgeElement => edge !== null)

        if (searchNodes.length || searchEdges.length) {
          setSourceGraph(searchNodes, searchEdges, { resetInitial: true })
          updateMetadataFromSource()
        } else {
          const fallback = performLocalSearch(trimmed, sourceNodes.value, sourceEdges.value)
          setCurrentGraph(fallback.nodes, fallback.edges)
        }

        const suggestions = payload.nodes
          .map((item) => item.name || item.id)
          .filter((item): item is string => Boolean(item))
          .slice(0, 8)
        if (suggestions.length) {
          uiStore.setSearchSuggestions(suggestions)
        }
        return
      }

      const fallback = performLocalSearch(trimmed, sourceNodes.value, sourceEdges.value)
      setCurrentGraph(fallback.nodes, fallback.edges)
    } catch (err) {
      console.warn('Universal search failed, falling back locally.', err)
      const fallback = performLocalSearch(trimmed, initialNodes.value, initialEdges.value)
      if (fallback.nodes.length || fallback.edges.length) {
        setSourceGraph(fallback.nodes, fallback.edges, { resetInitial: false })
      }
    } finally {
      isLoading.value = false
    }
  }

  const visibleElements = computed<GraphElement[]>(() => [
    ...nodes.value.map((node) => ({ group: 'nodes', data: node.data } as GraphElement)),
    ...edges.value.map((edge) => ({ group: 'edges', data: edge.data } as GraphElement))
  ])

  const selectedElement = computed<GraphNodeElement | GraphEdgeElement | null>(() => {
    if (!selectedId.value) return null
    return (
      nodes.value.find((node) => node.data.id === selectedId.value) ??
      edges.value.find((edge) => edge.data.id === selectedId.value) ??
      null
    )
  })

  const redactionTag = computed(() => redactionMessages[redactionLevel.value])
  const metadataForFilters = computed<GraphStateMetadata>(() => metadataBaseline.value ?? metadata.value)

  function setScenario(payload: ScenarioPayload) {
    scenario.value = payload
  }

  if (process.client) {
    const nuxtApp = useNuxtApp()
    nuxtApp.hook('app:mounted', () => {
      ;(window as typeof window & {
        __GRAPH_STORE__?: {
          state: () => {
            nodes: GraphNodeElement[]
            edges: GraphEdgeElement[]
            visibleElements: GraphElement[]
          }
          actions: {
            initialize: typeof initialize
            resetView: typeof resetView
            focusOnNodes: typeof focusOnNodes
          }
        }
      }).__GRAPH_STORE__ = {
        state: () => ({
          nodes: nodes.value.map(cloneNode),
          edges: edges.value.map(cloneEdge),
          visibleElements: visibleElements.value.slice()
        }),
        actions: {
          initialize,
          resetView,
          focusOnNodes
        }
      }
    })
  }

  return {
    layout,
    availableLayouts,
    isLoading,
    error,
    nodes,
    edges,
    filters,
    metadata,
    metadataForFilters,
    metadataLoading,
    searchResults,
    visibleElements,
    selectedElement,
    selectedId,
    timeline,
    redactionLevel,
    redactionTag,
    aiExplain,
    evidenceList,
    trending,
    pitfalls,
    scenario,
    lastUpdatedAt,
    initialize,
    setFilters,
    applyFilters,
    loadMetadata,
    loadMoreMetadataNodes,
    selectElement,
    expandNode,
    focusOnNodes,
    showAllNeighbors,
    runNetworkAnalysis,
    applyAdvanced,
    setLayout,
    setRedaction,
    updateTimeline,
    resetView,
    performUniversalSearch,
    loadMockGraph,
    isMockMode,
    setScenario
  }
})
