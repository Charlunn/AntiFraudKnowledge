<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import GraphCanvas from './GraphCanvas.vue'
import GraphToolbar from './GraphToolbar.vue'
import RiskBar from './RiskBar.vue'
import Button from '~/components/ui/button.vue'
import { useGraphStore } from '~/stores/useGraphStore'
import { useUIStore } from '~/stores/useUIStore'
import { useTimeline } from '~/composables/useTimeline'
import { Motion } from '@motionone/vue'
import { useI18n } from 'vue-i18n'

const graphStore = useGraphStore()
const uiStore = useUIStore()
const { tm } = useI18n()

const {
  visibleElements,
  layout,
  availableLayouts,
  isLoading,
  error,
  selectedId,
  scenario,
  redactionTag,
  timeline
} = storeToRefs(graphStore)

const canvasRef = ref<InstanceType<typeof GraphCanvas> | null>(null)
const boxSelectEnabled = ref(false)

const { timeline: timelineState, toggle, play, pause, isPlaying } = useTimeline(timeline.value)

watch(
  timeline,
  (value) => {
    timelineState.value.enabled = value.enabled
    timelineState.value.range = value.range
  },
  { deep: true }
)

watch(
  timelineState,
  (value) => {
    graphStore.updateTimeline(value)
    canvasRef.value?.focusTimeline()
  },
  { deep: true }
)

onMounted(() => {
  graphStore.initialize()
})

const timelineLabelKey = computed(() => uiStore.timeRangeLabel)

function handleSelect(id: string | null) {
  graphStore.selectElement(id)
}

function handleExpand(nodeId: string) {
  if (!nodeId) return
  graphStore.expandNode(nodeId)
}

function handleShowMore() {
  graphStore.showAllNeighbors()
}

function togglePlay() {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
  toggle(!timelineState.value.enabled)
}

const hasElements = computed(() => visibleElements.value.length > 0)
const emptySteps = computed(() => (tm('graph.graphStage.empty.steps') as string[]) || [])

function setBoxSelection(value: boolean) {
  boxSelectEnabled.value = value
  canvasRef.value?.setBoxSelection(value)
}

function zoomIn() {
  canvasRef.value?.zoomIn()
}

function zoomOut() {
  canvasRef.value?.zoomOut()
}

async function handleFocusNode(nodeId: string) {
  if (!nodeId) return
  await graphStore.focusOnNodes([nodeId])
  canvasRef.value?.resetView()
}

async function resetView() {
  await graphStore.resetView()
  canvasRef.value?.resetView()
}
</script>

<template>
  <section class="flex h-full flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <GraphToolbar
        :layout="layout"
        :layouts="availableLayouts"
        :is-playing="isPlaying"
        :box-select="boxSelectEnabled"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @box-select="setBoxSelection"
        @layout="graphStore.setLayout"
        @toggle-play="togglePlay"
        @reset="resetView"
        @show-more="handleShowMore"
      />
      <Button variant="ghost" size="sm" class="rounded-full px-3 text-xs text-muted-foreground">
        {{ $t(timelineLabelKey) }}
      </Button>
    </div>

    <ClientOnly>
      <GraphCanvas
        ref="canvasRef"
        :elements="visibleElements"
        :layout="layout"
        :selected-id="selectedId"
        :loading="isLoading"
        :error="error"
        :timeline="timelineState"
        @select="handleSelect"
        @expand="handleExpand"
        @subgraph="handleExpand"
        @focus-node="handleFocusNode"
        @retry="graphStore.initialize()"
      />
      <template #fallback>
        <div class="flex min-h-[320px] flex-1 items-center justify-center rounded-3xl border border-dashed border-border/60 bg-muted/30 sm:min-h-[420px] lg:min-h-[520px]">
          <div class="space-y-2 text-center">
            <p class="text-sm font-medium text-muted-foreground">{{ $t('graph.graphStage.loading.title') }}</p>
            <p class="text-xs text-muted-foreground/70">{{ $t('graph.graphStage.loading.tip') }}</p>
          </div>
        </div>
      </template>
    </ClientOnly>

    <div
      v-if="!isLoading && !hasElements"
      class="rounded-3xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground"
    >
      <h3 class="font-semibold text-foreground">{{ $t('graph.graphStage.empty.title') }}</h3>
      <ol class="mt-2 list-decimal space-y-1 pl-4 text-xs">
        <li v-for="step in emptySteps" :key="step">{{ step }}</li>
      </ol>
    </div>

    <Motion
      :initial="{ opacity: 0, y: 12 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4, delay: 0.1 }"
    >
      <RiskBar :level="scenario.riskLevel" />
    </Motion>
  </section>
</template>
