<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import type cytoscapeType from 'cytoscape'
import Button from '~/components/ui/button.vue'
import type { GraphElement, LayoutType, TimelineConfig } from '~/types/graph'

const props = withDefaults(
  defineProps<{
    elements: GraphElement[]
    layout: LayoutType
    selectedId?: string | null
    loading?: boolean
    error?: string | null
    timeline?: TimelineConfig
  }>(),
  {
    selectedId: null,
    loading: false,
    error: null,
    timeline: () => ({
      enabled: false,
      range: [new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), new Date().toISOString()]
    })
  }
)

const emit = defineEmits<{
  (e: 'select', id: string | null): void
  (e: 'expand', nodeId: string): void
  (e: 'subgraph', nodeId: string): void
  (e: 'retry'): void
  (e: 'focus-node', nodeId: string): void
}>()

const containerRef = shallowRef<HTMLElement | null>(null)
const cy = shallowRef<cytoscapeType.Core | null>(null)
const isReady = shallowRef(false)
const isBoxSelect = shallowRef(false)

let cytoscape: typeof cytoscapeType | null = null

const baseStyle: cytoscapeType.Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'background-color': '#2563eb',
      'border-color': '#bfdbfe',
      'border-width': 2,
      'width': 'data(size)',
      'height': 'data(size)',
      'shape': 'ellipse',
      color: '#0f172a',
      label: 'data(label)',
      'text-wrap': 'wrap',
      'text-max-width': 140,
      'font-size': 12,
      'text-halign': 'center',
      'text-valign': 'center',
      'text-outline-color': '#eff6ff',
      'text-outline-width': 2,
      'shadow-color': 'rgba(15, 23, 42, 0.18)',
      'shadow-blur': 16,
      'shadow-offset-x': 0,
      'shadow-offset-y': 6
    }
  },
  {
    selector: 'edge',
    style: {
      width: 2,
      'line-color': '#cbd5f5',
      'target-arrow-color': '#94a3f1',
      'target-arrow-shape': 'triangle',
      'target-arrow-fill': 'filled',
      'curve-style': 'bezier',
      'arrow-scale': 1.1,
      'opacity': 0.8,
      label: 'data(label)',
      'font-size': 11,
      color: '#475569',
      'text-background-color': '#ffffff',
      'text-background-opacity': 0.85,
      'text-background-padding': 3,
      'text-border-color': '#e2e8f0',
      'text-border-width': 1,
      'text-border-opacity': 0.5
    }
  },
  {
    selector: '.is-selected',
    style: {
      'border-color': '#38bdf8',
      'border-width': 4,
      'background-color': '#1d4ed8',
      'color': '#0f172a',
      'shadow-color': 'rgba(56, 189, 248, 0.35)',
      'shadow-blur': 20
    }
  },
  {
    selector: '.faded',
    style: {
      opacity: 0.2
    }
  }
]

const layoutConfig: Record<LayoutType, cytoscapeType.LayoutOptions> = {
  force: {
    name: 'cola',
    animate: true,
    refresh: 1,
    infinite: true,
    maxSimulationTime: 4000,
    padding: 40,
    randomize: false,
    avoidOverlap: true,
    fit: false,
    edgeLength: 160,
    nodeSpacing: (node: any) => 24 + (node.data('size') ?? 32) * 0.35
  } as unknown as cytoscapeType.LayoutOptions,
  hierarchy: {
    name: 'breadthfirst',
    directed: true,
    padding: 30,
    spacingFactor: 1.2,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: true
  },
  timeline: {
    name: 'cose-bilkent',
    animate: false,
    randomize: false,
    idealEdgeLength: 140,
    nodeRepulsion: 4500,
    gravity: 0.8,
    numIter: 2000
  }
}

async function ensureCytoscape() {
  if (cytoscape) return cytoscape
  const cytoscapeModule = await import('cytoscape')
  const colaModule = await import('cytoscape-cola')
  const coseModule = await import('cytoscape-cose-bilkent')
  cytoscapeModule.default.use(colaModule.default)
  cytoscapeModule.default.use(coseModule.default)
  cytoscape = cytoscapeModule.default
  return cytoscape
}

function buildElements(): cytoscapeType.ElementDefinition[] {
  return props.elements.map((element) => {
    const data = { ...element.data } as cytoscapeType.NodeDataDefinition | cytoscapeType.EdgeDataDefinition & {
      size?: number
    }

    if (element.group === 'nodes') {
      data.size = typeof data.size === 'number' && Number.isFinite(data.size) ? data.size : 40
    }

    return {
      group: element.group,
      data
    }
  })
}

async function mountGraph() {
  const lib = await ensureCytoscape()
  if (!containerRef.value) return

  cy.value = lib({
    container: containerRef.value,
    elements: buildElements(),
    style: baseStyle,
    boxSelectionEnabled: isBoxSelect.value,
    layout: layoutConfig[props.layout]
  })

  cy.value.nodes().forEach((node) => node.unlock())

  cy.value.on('tap', 'node', (event) => {
    const originalEvent = event.originalEvent as MouseEvent | undefined
    const nodeId = event.target.id()
    if (originalEvent?.shiftKey) {
      emit('subgraph', nodeId)
      return
    }
    emit('select', nodeId)
  })

  cy.value.on('tap', 'edge', (event) => {
    emit('select', event.target.id())
  })

  cy.value.on('tap', (event) => {
    if (event.target === cy.value) {
      emit('select', null)
    }
  })

  cy.value.on('cxttap', 'node', (event) => {
    emit('expand', event.target.id())
  })

  cy.value.on('dbltap', 'node', (event) => {
    emit('focus-node', event.target.id())
  })

  cy.value
    .elements()
    .unselectify()
    .selectify()

  isReady.value = true
  highlightSelection(props.selectedId)
}

function highlightSelection(id: string | null) {
  if (!cy.value) return
  cy.value.elements().removeClass('is-selected')
  if (id) {
    cy.value.$id(id).addClass('is-selected')
  }
}

function rerunLayout() {
  if (!cy.value) return
  const layoutOptions = { ...layoutConfig[props.layout] }
  const layout = cy.value.layout(layoutOptions)
  layout.run()
}

function updateElements() {
  if (!cy.value) return
  cy.value.batch(() => {
    cy.value?.elements().remove()
    cy.value?.add(buildElements())
  })
  rerunLayout()
  highlightSelection(props.selectedId)
}

function setBoxSelection(enabled: boolean) {
  isBoxSelect.value = enabled
  cy.value?.boxSelectionEnabled(enabled)
}

function zoomIn() {
  if (!cy.value) return
  cy.value.zoom(cy.value.zoom() * 1.2)
}

function zoomOut() {
  if (!cy.value) return
  cy.value.zoom(cy.value.zoom() * 0.8)
}

function resetView() {
  if (!cy.value) return
  cy.value.fit(undefined, 32)
}

function focusTimeline() {
  if (!cy.value) return
  const elements = cy.value.elements()
  elements.forEach((element) => {
    const updatedAt = (element.data('updatedAt') ?? '') as string
    if (!updatedAt || !props.timeline?.enabled) {
      element.removeClass('faded')
      return
    }
    const [start, end] = props.timeline.range.map((time) => new Date(time).getTime())
    const current = new Date(updatedAt).getTime()
    if (current < start || current > end) {
      element.addClass('faded')
    } else {
      element.removeClass('faded')
    }
  })
}

watch(
  () => props.layout,
  () => nextTick(rerunLayout)
)

watch(
  () => props.elements,
  () => nextTick(updateElements),
  { deep: true }
)

watch(
  () => props.selectedId,
  (id) => highlightSelection(id ?? null)
)

watch(
  () => props.timeline,
  () => focusTimeline(),
  { deep: true }
)

onMounted(async () => {
  await mountGraph()
  await nextTick()
  resetView()
})

onBeforeUnmount(() => {
  cy.value?.destroy()
  cy.value = null
})

defineExpose({
  zoomIn,
  zoomOut,
  resetView,
  setBoxSelection,
  focusTimeline
})
</script>

<template>
  <div class="relative h-full min-h-[320px] w-full overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-slate-50 via-white/90 to-slate-100 shadow-inner sm:min-h-[420px] lg:min-h-[520px]">
    <div
      v-if="loading"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur"
      role="status"
    >
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-primary/40 border-t-primary" />
      <p class="text-sm text-muted-foreground">{{ $t('graph.graphStage.loading.title') }}</p>
      <p class="text-xs text-muted-foreground/80">{{ $t('graph.graphStage.loading.tip') }}</p>
    </div>

    <div
      v-else-if="error && !elements.length"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur"
      role="alert"
    >
      <p class="text-sm font-medium text-destructive">{{ error }}</p>
      <Button size="sm" class="rounded-full px-4" @click="emit('retry')">
        {{ $t('graph.graphStage.error.retry') }}
      </Button>
    </div>

    <div v-else ref="containerRef" class="h-full w-full" role="presentation" />
  </div>
</template>
