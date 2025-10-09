export type RiskLevel = 'low' | 'medium' | 'high'
export type LayoutType = 'force' | 'hierarchy' | 'timeline'
export type RedactionLevel = 'weak' | 'medium' | 'strong'

export interface GraphNodeData {
  id: string
  label: string
  type: string
  riskLevel: RiskLevel
  badges: string[]
  updatedAt: string
  source: string
  relatedCases?: number
  suspiciousScore?: number
  degree?: number
  size?: number
}

export interface GraphEdgeData {
  id: string
  source: string
  target: string
  label: string
  type: string
  weight?: number
  confidence?: number
  updatedAt: string
  sourceTag: string
}

export interface GraphNodeElement {
  data: GraphNodeData
  position?: {
    x: number
    y: number
  }
  classes?: string
}

export interface GraphEdgeElement {
  data: GraphEdgeData
  classes?: string
}

export type GraphElement = { group: 'nodes'; data: GraphNodeData } | { group: 'edges'; data: GraphEdgeData }

export interface TimelineConfig {
  enabled: boolean
  range: [string, string]
}

export interface GraphFilters {
  types: string[]
  channels: string[]
  roles: string[]
  confidence: number
  regions: string[]
  sources: string[]
  nodeKinds: string[]
  edgeKinds: string[]
  focusNodes: string[]
  searchTerm?: string
}

export interface GraphMetadataNodeSummary {
  id: string
  elementId?: string | null
  labels: string[]
  name?: string | null
  degree: number
  properties: Record<string, unknown>
}

export interface GraphMetadataLabelSummary {
  label: string
  count: number
}

export interface GraphMetadataRelationshipSummary {
  type: string
  count: number
}

export interface GraphMetadataResponse {
  nodes: {
    items: GraphMetadataNodeSummary[]
    pagination: {
      skip: number
      limit: number
      hasMore: boolean
    }
  }
  labels: GraphMetadataLabelSummary[]
  relationships: GraphMetadataRelationshipSummary[]
}

export interface GraphUniversalRelationship {
  id: string
  type: string
  source?: string
  target?: string
  properties: Record<string, unknown>
}

export interface GraphUniversalSearchResult {
  query: string
  nodes: GraphMetadataNodeSummary[]
  relationships: GraphUniversalRelationship[]
  meta: {
    node_limit: number
    relationship_limit: number
    returned_nodes: number
    returned_relationships: number
  }
}

export interface ScenarioStepOption {
  id: string
  label: string
  description?: string
}

export interface ScenarioStep {
  id: string
  label: string
  options: ScenarioStepOption[]
}

export interface ScenarioPayload {
  id: string
  title: string
  summary: string
  riskLevel: RiskLevel
}

export interface AIExplainSection {
  id: 'whyCommon' | 'howSpot' | 'whatNow'
  title: string
  bullets: string[]
}

export interface EvidenceItem {
  id: string
  title: string
  description: string
  source: string
  timestamp: string
  url?: string
}

export interface AdvancedAnalysisPayload {
  layout: LayoutType
  redaction: RedactionLevel
  filters: GraphFilters
  timeline: TimelineConfig
}

export interface NetworkAnalysisRequest {
  algorithm: 'louvain' | 'leiden' | 'degree' | 'betweenness' | 'shortestPath'
  seedNode?: string
  targetNode?: string
}

export interface ExportPayload {
  type: 'csv' | 'json' | 'graphml' | 'svg' | 'png'
  includeHidden?: boolean
}

export interface TrendingInsight {
  id: string
  title: string
  delta: number
  description: string
}

export interface PitfallInsight {
  id: string
  title: string
  guidance: [string, string, string]
}

export interface ShareOption {
  id: 'h5' | 'png'
  label: string
  description: string
}
