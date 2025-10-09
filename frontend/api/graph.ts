import { apiClient } from './base'
import type { ApiResponse } from '~/types/api'
import type { GraphMetadataResponse, GraphUniversalSearchResult } from '~/types/graph'

export interface GraphApiNode {
  id: string
  name?: string
  category?: string
  symbolSize?: number
  value?: number
  properties?: Record<string, unknown>
}

export interface GraphApiLink {
  source: string
  target: string
  type?: string
  value?: number
  label?: string | { formatter?: string }
  properties?: Record<string, unknown>
}

export interface GraphApiPayload {
  nodes: GraphApiNode[]
  links: GraphApiLink[]
  counts?: {
    nodes?: number
    links?: number
  }
}

export interface GraphInitialResponse {
  graph: GraphApiPayload
  meta?: {
    limit?: number
    returned_nodes?: number
    returned_links?: number
  }
}

export interface GraphMetadataRequest {
  nodeLimit?: number
  nodeSkip?: number
  relationshipLimit?: number
  labelLimit?: number
}

export interface GraphFilterRequest {
  nodeTypes?: string[]
  relationshipTypes?: string[]
  search?: string
  limit?: number
}

export interface GraphUniversalSearchRequest {
  nodeLimit?: number
  relationshipLimit?: number
}

export async function fetchInitialGraph(limit = 50): Promise<ApiResponse<GraphInitialResponse>> {
  return await apiClient.get('/graph/initial/', {
    params: { limit }
  })
}

export async function fetchGraphMetadata(
  params: GraphMetadataRequest = {}
): Promise<ApiResponse<GraphMetadataResponse>> {
  return await apiClient.get('/graph/metadata/', {
    params: {
      node_limit: params.nodeLimit,
      node_skip: params.nodeSkip,
      relationship_limit: params.relationshipLimit,
      label_limit: params.labelLimit
    }
  })
}

export async function fetchFilteredGraph(
  filters: GraphFilterRequest
): Promise<ApiResponse<GraphInitialResponse>> {
  const params: Record<string, string | number | undefined> = {
    limit: filters.limit
  }

  if (filters.nodeTypes?.length) {
    params.node_types = filters.nodeTypes.join(',')
  }
  if (filters.relationshipTypes?.length) {
    params.relationship_types = filters.relationshipTypes.join(',')
  }
  if (filters.search) {
    params.search = filters.search
  }

  return await apiClient.get('/graph/filtered/', {
    params
  })
}

export async function fetchNodeNeighborhood(
  nodeId: string,
  limit = 100
): Promise<ApiResponse<GraphInitialResponse>> {
  return await apiClient.get(`/graph/node/${encodeURIComponent(nodeId)}/expand/`, {
    params: { limit }
  })
}

export async function fetchUniversalSearch(
  query: string,
  options: GraphUniversalSearchRequest = {}
): Promise<ApiResponse<GraphUniversalSearchResult>> {
  return await apiClient.get('/graph/search/universal/', {
    params: {
      query,
      node_limit: options.nodeLimit,
      relationship_limit: options.relationshipLimit
    }
  })
}
