<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useHead } from '#imports'
import TopAppBar from '~/components/fraud-graph/TopAppBar.vue'
import GraphSidebar from '~/components/fraud-graph/GraphSidebar.vue'
import GraphStage from '~/components/fraud-graph/GraphStage.vue'
import AdvancedDrawer from '~/components/fraud-graph/AdvancedDrawer.vue'
import BottomBar from '~/components/fraud-graph/BottomBar.vue'
import Button from '~/components/ui/button.vue'
import { useGraphStore } from '~/stores/useGraphStore'
import { useUIStore } from '~/stores/useUIStore'
import { useShare } from '~/composables/useShare'
import { useExport } from '~/composables/useExport'
import type { AdvancedAnalysisPayload, ExportPayload, NetworkAnalysisRequest } from '~/types/graph'
import { useI18n } from 'vue-i18n'
import { PanelLeft, PanelLeftOpen } from 'lucide-vue-next'

const graphStore = useGraphStore()
const uiStore = useUIStore()
const { t } = useI18n()

const {
  selectedElement,
  aiExplain,
  evidenceList,
  redactionTag,
  redactionLevel,
  filters,
  layout,
  timeline,
  metadata,
  lastUpdatedAt
} = storeToRefs(graphStore)

const { advancedDrawerOpen, showLeftRail } = storeToRefs(uiStore)

const { share } = useShare()
const { exportGraph } = useExport()

const drawerBinding = computed({
  get: () => advancedDrawerOpen.value,
  set: (value: boolean) => uiStore.toggleAdvancedDrawer(value)
})

const availableFilters = computed(() => {
  const labels = metadata.value.labels ?? []
  const relationships = metadata.value.relationships ?? []
  const nodeSummaries = metadata.value.nodes ?? []

  const nodeTypes = labels.map((item) => item.label)
  const edgeTypes = relationships.map((item) => item.type)

  const sources = Array.from(
    new Set(
      nodeSummaries
        .map((item) => {
          const source = item.properties?.source
          return typeof source === 'string' ? source : null
        })
        .filter((value): value is string => Boolean(value))
    )
  )

  const inferredChannels = Array.from(
    new Set(
      nodeSummaries.flatMap((item) => {
        const raw = (item.properties?.channel ?? item.properties?.channels) as
          | string
          | string[]
          | undefined
        if (Array.isArray(raw)) return raw.map(String)
        if (typeof raw === 'string') return [raw]
        return []
      })
    )
  )

  const inferredRegions = Array.from(
    new Set(
      nodeSummaries.flatMap((item) => {
        const raw = (item.properties?.region ?? item.properties?.regions) as
          | string
          | string[]
          | undefined
        if (Array.isArray(raw)) return raw.map(String)
        if (typeof raw === 'string') return [raw]
        return []
      })
    )
  )

  return {
    nodeTypes,
    edgeTypes,
    regions: inferredRegions.length ? inferredRegions : ['华北', '华东', '华南'],
    channels: inferredChannels.length ? inferredChannels : ['sms', 'social', 'app'],
    sources
  }
})

async function handleShare(format: 'h5' | 'png') {
  await share(format)
}

async function handleExport(payload: ExportPayload) {
  await exportGraph(payload)
}

async function handleRunAnalysis(payload: NetworkAnalysisRequest) {
  await graphStore.runNetworkAnalysis(payload)
}

async function handleApply(payload: AdvancedAnalysisPayload) {
  await graphStore.applyAdvanced(payload)
}

function handleFeedback() {
  uiStore.recordFeedback()
}

const layoutGridClass = computed(() => (showLeftRail.value ? 'xl:grid-cols-[minmax(280px,340px)_1fr]' : 'xl:grid-cols-1'))

useHead({
  title: '反诈知识图谱'
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <TopAppBar />

    <main class="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-3 py-5 sm:px-5 lg:px-6">
      <div class="flex flex-wrap items-center justify-end gap-2 px-1 sm:px-0">
        <Button variant="ghost" size="sm" class="rounded-full px-3 text-xs" @click="uiStore.toggleLeftRail()">
          <component :is="showLeftRail ? PanelLeftOpen : PanelLeft" class="mr-1 size-4" aria-hidden="true" />
          {{ showLeftRail ? t('graph.controls.collapseSidebar') : t('graph.controls.expandSidebar') }}
        </Button>
      </div>

      <div class="grid gap-5" :class="layoutGridClass">
        <GraphSidebar
          v-if="showLeftRail"
          class="order-2 xl:order-1"
          :selected="selectedElement"
          :ai-summary="aiExplain"
          :evidence-list="evidenceList"
          :redaction-message="redactionTag"
          @save="() => uiStore.openCommandPalette()"
          @share="handleShare"
          @help="() => uiStore.triggerHelp(true)"
          @read="() => uiStore.openCommandPalette()"
        />

        <section class="order-1 xl:order-2">
          <GraphStage />
        </section>
      </div>

      <BottomBar :updated-at="lastUpdatedAt" @feedback="handleFeedback" />
    </main>

    <AdvancedDrawer
      v-model="drawerBinding"
      :available-filters="availableFilters"
      :default-confidence="filters.confidence"
      :export-formats="['csv', 'json', 'graphml', 'svg', 'png']"
      :layout="layout"
      :filters="filters"
      :timeline-range="timeline.range"
      :redaction="redactionLevel"
      @run-analysis="handleRunAnalysis"
      @export="handleExport"
      @apply="handleApply"
      @set-redaction="graphStore.setRedaction"
    />
  </div>
</template>
