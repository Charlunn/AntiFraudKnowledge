<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useHead, definePageMeta } from '#imports'
import GraphSidebar from '~/components/fraud-graph/GraphSidebar.vue'
import GraphStage from '~/components/fraud-graph/GraphStage.vue'
import AdvancedDrawer from '~/components/fraud-graph/AdvancedDrawer.vue'
import BottomBar from '~/components/fraud-graph/BottomBar.vue'
import { useGraphStore } from '~/stores/useGraphStore'
import { useUIStore } from '~/stores/useUIStore'
import { useShare } from '~/composables/useShare'
import { useExport } from '~/composables/useExport'
import type { AdvancedAnalysisPayload, ExportPayload, NetworkAnalysisRequest } from '~/types/graph'
import { useI18n } from 'vue-i18n'
import { PanelLeft } from 'lucide-vue-next'

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

function toggleSidebar() {
  uiStore.toggleLeftRail(!showLeftRail.value)
}

useHead({
  title: '反诈知识图谱'
})

definePageMeta({
  layout: 'graph'
})
</script>

<template>
  <div class="relative flex h-[90vh] max-h-[90vh] w-full overflow-hidden bg-slate-50">
    <div class="relative container-grid flex h-full w-full items-stretch gap-6 overflow-hidden py-4">
      <button
        v-if="!showLeftRail"
        type="button"
        class="absolute left-0 top-1/2 z-30 flex -translate-y-1/2 -translate-x-1/2 items-center gap-2 rounded-full border border-border/50 bg-background/90 px-3 py-2 text-xs font-medium text-muted-foreground shadow backdrop-blur transition hover:text-foreground"
        @click="uiStore.toggleLeftRail(true)"
      >
        <PanelLeft class="size-4" aria-hidden="true" />
        {{ t('graph.controls.expandSidebar') }}
      </button>

      <GraphSidebar
        v-if="showLeftRail"
        class="z-20 h-full w-[320px] shrink-0 xl:w-[340px]"
        :selected="selectedElement"
        :ai-summary="aiExplain"
        :evidence-list="evidenceList"
        :redaction-message="redactionTag"
        @save="() => uiStore.openCommandPalette()"
        @share="handleShare"
        @help="() => uiStore.triggerHelp(true)"
        @read="() => uiStore.openCommandPalette()"
      />

      <div class="flex h-full flex-1 min-h-0 flex-col overflow-hidden">
        <GraphStage class="flex-1 min-h-0" :sidebar-expanded="showLeftRail" @toggle-sidebar="toggleSidebar" />

        <BottomBar
          class="mt-4 flex-shrink-0 border-t border-border/60 bg-background/90 px-4 py-3 sm:px-5 lg:px-6"
          :updated-at="lastUpdatedAt"
          @feedback="handleFeedback"
        />
      </div>
    </div>

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
