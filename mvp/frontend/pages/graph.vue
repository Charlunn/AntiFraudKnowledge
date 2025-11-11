<template>
  <div class="space-y-6">
    <PageHeader title="知识图谱" description="以经典黑白配色呈现关键实体及其风险关系" />

    <Card class="border border-border/80">
      <CardHeader>
        <CardTitle>图谱概览</CardTitle>
        <CardDescription>实时呈现最新的风险关系网络</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-4 md:grid-cols-[2fr_1fr]">
          <ClientOnly>
            <VChart
              ref="chartRef"
              class="h-[420px] border border-border bg-background"
              :option="chartOptions"
              autoresize
            />
          </ClientOnly>
          <div class="border border-border bg-card p-4 text-sm">
            <p class="text-xs uppercase tracking-widest text-muted-foreground">图谱统计</p>
            <div class="mt-3 space-y-2">
              <p>节点总数：{{ metadata.nodes }}</p>
              <p>关系总数：{{ metadata.links }}</p>
            </div>
            <div class="mt-4 space-y-2">
              <p class="text-xs uppercase tracking-widest text-muted-foreground">节点详情</p>
              <div v-if="selectedNode">
                <p class="font-semibold">{{ selectedNode.label }}</p>
                <p class="text-xs text-muted-foreground">类别：{{ selectedNode.category || '未分类' }}</p>
                <p class="text-xs text-muted-foreground">风险等级：{{ riskLevelLabels[selectedNode.riskLevel] || '未标记' }}</p>
              </div>
              <p v-else class="text-xs text-muted-foreground">双击任意节点可查看其关联信息。</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 md:flex-row">
          <Input v-model="search" placeholder="搜索节点或关系关键字" class="flex-1" @keyup.enter="runSearch" />
          <Button variant="outline" @click="runSearch">搜索</Button>
          <Button @click="loadGraph">刷新图谱</Button>
        </div>

        <div v-if="searchResults.length" class="border border-dashed border-border/60 p-4 text-sm">
          <p class="text-xs uppercase tracking-widest text-muted-foreground">搜索结果</p>
          <ul class="mt-2 space-y-1">
            <li
              v-for="item in searchResults"
              :key="item.id"
              class="flex items-center justify-between border-b border-border/40 py-2"
            >
              <div>
                <p class="font-medium">{{ item.label }}</p>
                <p class="text-xs text-muted-foreground">类型：{{ item.type }}</p>
              </div>
              <Button size="sm" variant="ghost" @click="focusNode(item.id)">定位</Button>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, h } from 'vue'
import { use } from 'echarts/core'
import { GraphChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { TooltipComponent } from 'echarts/components'

use([GraphChart, CanvasRenderer, TooltipComponent])

const VChart = defineAsyncComponent({
  loader: () => (process.client ? import('vue-echarts') : Promise.resolve({ default: () => null })),
  suspensible: false,
  ssr: false,
  loadingComponent: {
    render() {
      return h(
        'div',
        {
          class:
            'h-[420px] border border-dashed border-border/60 bg-background flex items-center justify-center text-xs text-muted-foreground',
        },
        '图谱加载中...'
      )
    },
  },
})

const { $api } = useNuxtApp()
const chartRef = ref<any>(null)
const graphData = ref({ nodes: [] as any[], links: [] as any[] })
const selectedNode = ref<any>(null)
const metadata = reactive({ nodes: 0, links: 0 })
const search = ref('')
const searchResults = ref<any[]>([])
const riskLevelLabels: Record<string, string> = {
  high: '高风险',
  medium: '中风险',
  low: '低风险',
}

const chartOptions = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    formatter: (params: any) => (params.data && params.data.label) || params.name,
  },
  series: [
    {
      type: 'graph',
      layout: 'force',
      roam: true,
      focusNodeAdjacency: true,
      draggable: true,
      edgeSymbol: ['circle', 'arrow'],
      edgeSymbolSize: [6, 12],
      lineStyle: {
        color: 'rgba(9,9,11,0.5)',
        width: 1.1,
        opacity: 0.85,
        curveness: 0.22,
      },
      label: {
        show: false,
      },
      itemStyle: {
        borderColor: '#09090b',
        borderWidth: 1.5,
        shadowBlur: 8,
        shadowColor: 'rgba(9,9,11,0.12)',
      },
      data: graphData.value.nodes,
      links: graphData.value.links,
      force: {
        repulsion: 480,
        edgeLength: [90, 140],
        gravity: 0.05,
        friction: 0.16,
      },
      animationDuration: 1400,
      animationEasingUpdate: 'cubicInOut',
      emphasis: {
        focus: 'adjacency',
        scale: true,
        lineStyle: {
          width: 2,
          color: '#09090b',
          opacity: 1,
        },
      },
    },
  ],
}))
const normalizeRiskLevel = (value: any) => {
  const raw = (value ?? '').toString().trim()
  if (!raw) return 'medium'
  const lower = raw.toLowerCase()
  if (['high', 'high-risk', 'risk-high'].includes(lower) || /高/.test(raw)) return 'high'
  if (['low', 'low-risk', 'risk-low'].includes(lower) || /低/.test(raw)) return 'low'
  return 'medium'
}

const getNodeDimensions = (label: string) => {
  const safeLabel = label || ''
  const width = Math.min(220, Math.max(96, safeLabel.length * 12))
  return { width, height: 48 }
}

const mapNode = (node: any) => {
  const props = node.properties || {}
  const riskLevel = normalizeRiskLevel(
    props.riskLevel || props.risk_level || props.risk || node.riskLevel || node.risk_level
  )
  const labelText = node.name || node.id
  const { width, height } = getNodeDimensions(labelText)
  const palette: Record<string, { fill: string; border: string; shadow: string; text: string }> = {
    high: {
      fill: '#09090b',
      border: '#000000',
      shadow: 'rgba(9,9,11,0.35)',
      text: '#f8fafc',
    },
    medium: {
      fill: '#f8fafc',
      border: '#09090b',
      shadow: 'rgba(9,9,11,0.18)',
      text: '#09090b',
    },
    low: {
      fill: '#e4e4e7',
      border: '#a1a1aa',
      shadow: 'rgba(15,15,23,0.12)',
      text: '#18181b',
    },
  }
  const paletteEntry = palette[riskLevel] || palette.medium

  return {
    name: node.id,
    label: labelText,
    category: node.category || props.category || '未分类',
    riskLevel,
    value: node.value || 1,
    draggable: true,
    symbol: 'roundRect',
    symbolSize: [width, height],
    itemStyle: {
      color: paletteEntry.fill,
      borderColor: paletteEntry.border,
      borderWidth: 1.6,
      shadowBlur: 10,
      shadowColor: paletteEntry.shadow,
    },
    label: {
      show: true,
      color: paletteEntry.text,
      fontWeight: 600,
      fontSize: 12,
      position: 'inside',
      align: 'center',
      verticalAlign: 'middle',
      width: width - 16,
      overflow: 'break',
      lineHeight: 18,
      padding: [0, 6],
    },
    properties: props,
  }
}
const mapLink = (edge: any) => ({
  source: edge.source,
  target: edge.target,
  value: edge.value || 1,
  label:
    edge.label || {
      show: true,
      formatter: edge.type || '关联',
      backgroundColor: '#09090b',
      color: '#f4f4f5',
      padding: [2, 8],
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 500,
    },
  lineStyle:
    edge.lineStyle || {
      width: 1.2,
      curveness: 0.22,
      color: 'rgba(9,9,11,0.45)',
      shadowBlur: 4,
      shadowColor: 'rgba(9,9,11,0.2)',
    },
  properties: edge.properties || {},
  type: edge.type || '',
})
const bindGraphEvents = () => {
  const instance = chartRef.value ? chartRef.value.chart : null
  if (!instance) return
  instance.off('click')
  instance.off('dblclick')
  instance.on('click', (params: any) => {
    if (params.dataType === 'node') {
      selectedNode.value = params.data
    }
  })
  instance.on('dblclick', async (params: any) => {
    if (params.dataType === 'node' && params.data?.name) {
      await focusNode(params.data.name)
    }
  })
}

const loadGraph = async () => {
  const response = await $api.get('/graph/initial/', { params: { limit: 80 } })
  const graph = response.data.graph || { nodes: [], links: [] }
  graphData.value = {
    nodes: graph.nodes.map(mapNode),
    links: graph.links.map(mapLink),
  }
  metadata.nodes = (graph.counts && graph.counts.nodes) || graph.nodes.length
  metadata.links = (graph.counts && graph.counts.links) || graph.links.length
  selectedNode.value = null
  await nextTick()
  bindGraphEvents()
}

const runSearch = async () => {
  const query = search.value.trim()
  if (!query) {
    searchResults.value = []
    return
  }
  try {
    const response = await $api.get('/graph/search/universal/', { params: { query } })
    searchResults.value = response.data.nodes ? response.data.nodes.slice(0, 5) : []
  } catch (error) {
    console.error('Failed to search graph', error)
    searchResults.value = []
  }
}

const focusNode = async (nodeId: string) => {
  if (!nodeId) return
  try {
    const response = await $api.get(`/graph/node/${nodeId}/expand/`, { params: { limit: 30 } })
    const graph = response.data.graph || response.data
    graphData.value = {
      nodes: graph.nodes.map(mapNode),
      links: graph.links.map(mapLink),
    }
    selectedNode.value = graphData.value.nodes.find((node) => node.name === nodeId) || null
    searchResults.value = []
    await nextTick()
    bindGraphEvents()
  } catch (error) {
    console.error('Failed to focus node', error)
  }
}

onMounted(loadGraph)
</script>


