<template>
  <div class="space-y-6">
    <PageHeader title="知识图谱" description="以黑白配色呈现关键实体及其关系" />

    <Card class="border border-border/80">
      <CardHeader>
        <CardTitle>图谱概览</CardTitle>
        <CardDescription>Neo4j 数据通过 ECharts Graph 动态渲染</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-4 md:grid-cols-[2fr_1fr]">
          <ClientOnly>
            <VChart
              ref="chartRef"
              class="h-[420px] rounded-2xl border border-border/60 bg-background"
              :option="chartOptions"
              autoresize
            />
          </ClientOnly>
          <div class="rounded-2xl border border-border/70 bg-card p-4 text-sm">
            <p class="text-xs uppercase tracking-widest text-muted-foreground">图谱统计</p>
            <div class="mt-3 space-y-2">
              <p>节点数：{{ metadata.nodes }}</p>
              <p>关系数：{{ metadata.links }}</p>
            </div>
            <div class="mt-4 space-y-2">
              <p class="text-xs uppercase tracking-widest text-muted-foreground">节点详情</p>
              <div v-if="selectedNode">
                <p class="font-semibold">{{ selectedNode.label }}</p>
                <p class="text-xs text-muted-foreground">类别：{{ selectedNode.category }}</p>
                <p class="text-xs text-muted-foreground">风险：{{ selectedNode.riskLevel }}</p>
              </div>
              <p v-else class="text-xs text-muted-foreground">点击节点可查看更多信息。</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 md:flex-row">
          <Input v-model="search" placeholder="搜索节点或关系关键字" class="flex-1" />
          <Button variant="outline" @click="runSearch">搜索</Button>
          <Button @click="loadGraph">刷新图谱</Button>
        </div>

        <div v-if="searchResults.length" class="rounded-2xl border border-dashed border-border/60 p-4 text-sm">
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
            'h-[420px] rounded-2xl border border-dashed border-border/60 bg-background flex items-center justify-center text-xs text-muted-foreground',
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
      symbolSize: 36,
      edgeSymbol: ['none', 'arrow'],
      lineStyle: {
        color: '#0f0f0f',
        width: 1,
        opacity: 0.35,
      },
      label: {
        show: true,
        formatter: '{b}',
        color: '#0f0f0f',
      },
      data: graphData.value.nodes,
      links: graphData.value.links,
      force: {
        repulsion: 240,
        edgeLength: 90,
      },
    },
  ],
}))

const normalizeRiskLevel = (value: any) => {
  const raw = (value ?? '').toString().toLowerCase()
  if (!raw) return 'medium'
  if (['high', '高危', 'high-risk'].includes(raw)) return 'high'
  if (['low', '低危'].includes(raw)) return 'low'
  return 'medium'
}

const mapNode = (node: any) => {
  const props = node.properties || {}
  const riskLevel = normalizeRiskLevel(
    props.riskLevel || props.risk_level || props.risk || node.riskLevel || node.risk_level
  )
  const colors: Record<string, string> = {
    high: '#ef4444',
    medium: '#0f172a',
    low: '#22c55e',
  }

  return {
    name: node.id,
    label: node.name || node.id,
    category: node.category || props.category || '未知',
    riskLevel,
    value: node.value || 1,
    itemStyle: {
      color: colors[riskLevel] || colors.medium,
      borderColor: '#0f172a',
    },
    properties: props,
  }
}

const mapLink = (edge: any) => ({
  source: edge.source,
  target: edge.target,
  value: edge.value || 1,
  label: edge.label || { show: true, formatter: edge.type || '' },
  lineStyle: edge.lineStyle || { width: 2, curveness: 0.1 },
  properties: edge.properties || {},
  type: edge.type || '',
})

const bindClick = () => {
  const instance = chartRef.value ? chartRef.value.chart : null
  if (!instance) return
  instance.off('click')
  instance.on('click', (params: any) => {
    if (params.dataType === 'node') {
      selectedNode.value = params.data
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
  await nextTick()
  bindClick()
}

const runSearch = async () => {
  if (!search.value.trim()) return
  const response = await $api.get('/graph/search/universal/', { params: { query: search.value } })
  searchResults.value = response.data.nodes ? response.data.nodes.slice(0, 5) : []
}

const focusNode = async (nodeId: string) => {
  const response = await $api.get(`/graph/node/${nodeId}/expand/`, { params: { limit: 30 } })
  const graph = response.data.graph || response.data
  graphData.value = {
    nodes: graph.nodes.map(mapNode),
    links: graph.links.map(mapLink),
  }
  selectedNode.value = graphData.value.nodes.find((node) => node.name === nodeId)
  searchResults.value = []
  await nextTick()
  bindClick()
}

onMounted(loadGraph)
</script>
