<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import GraphCanvas from './GraphCanvas.vue'
import GraphToolbar from './GraphToolbar.vue'
import { useGraphStore } from '~/stores/useGraphStore'
import { useUIStore } from '~/stores/useUIStore'
import { useI18n } from 'vue-i18n'
import { useRoute } from '#imports'

const props = defineProps<{
  sidebarExpanded: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const graphStore = useGraphStore()
const uiStore = useUIStore()
const { tm, locale } = useI18n()
const route = useRoute()

const {
  visibleElements,
  layout,
  isLoading,
  error,
  selectedId,
  timeline
} = storeToRefs(graphStore)

const { showAdvancedButtonBadge, locale: storeLocale } = storeToRefs(uiStore)

const availableLayouts = computed(() => graphStore.availableLayouts)

const canvasRef = ref<InstanceType<typeof GraphCanvas> | null>(null)
const boxSelectEnabled = ref(false)

watch(
  () => storeLocale.value,
  (next) => {
    if (next !== locale.value) {
      locale.value = next
    }
  },
  { immediate: true }
)

watch(
  () => locale.value,
  (next) => {
    if (next !== storeLocale.value) {
      uiStore.switchLocale(next as 'zh' | 'en')
    }
  }
)

onMounted(() => {
  const mockParam = route.query.mock
  const shouldForceMock = Array.isArray(mockParam)
    ? mockParam.some((value) => ['1', 'true', 'yes'].includes(String(value).toLowerCase()))
    : typeof mockParam === 'string'
      ? ['1', 'true', 'yes'].includes(mockParam.toLowerCase())
      : false

  if (shouldForceMock) {
    graphStore.loadMockGraph({ resetInitial: true })
    return
  }

  graphStore.initialize()
})

const hasElements = computed(() => visibleElements.value.length > 0)
const emptySteps = computed(() => (tm('graph.graphStage.empty.steps') as string[]) || [])

function handleSelect(id: string | null) {
  graphStore.selectElement(id)
}

function handleExpand(nodeId: string) {
  if (!nodeId) return
  graphStore.expandNode(nodeId)
}

async function handleShowMore() {
  await graphStore.showAllNeighbors()
}

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

function toggleLocale() {
  const next = locale.value === 'zh' ? 'en' : 'zh'
  locale.value = next
}

function openAdvanced() {
  uiStore.toggleAdvancedDrawer(true)
}

function openHelp() {
  uiStore.triggerHelp(true)
}
</script>

<template>
  <section class="flex h-full min-h-0 flex-col gap-4">
    <GraphToolbar
      :layout="layout"
      :layouts="availableLayouts"
      :box-select="boxSelectEnabled"
      :locale="locale"
      :show-advanced-badge="showAdvancedButtonBadge"
      :sidebar-expanded="props.sidebarExpanded"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @box-select="setBoxSelection"
      @layout="graphStore.setLayout"
      @reset="resetView"
      @show-more="handleShowMore"
      @toggle-locale="toggleLocale"
      @toggle-help="openHelp"
      @toggle-advanced="openAdvanced"
      @toggle-sidebar="emit('toggle-sidebar')"
    />

    <div class="flex-1 min-h-0">
      <ClientOnly>
        <template #default>
          <div class="h-full">
            <GraphCanvas
              ref="canvasRef"
              :elements="visibleElements"
              :layout="layout"
              :selected-id="selectedId"
              :loading="isLoading"
              :error="error"
              :timeline="timeline"
              @select="handleSelect"
              @expand="handleExpand"
              @subgraph="handleExpand"
              @focus-node="handleFocusNode"
              @retry="graphStore.initialize()"
            />
          </div>
        </template>
        <template #fallback>
          <div class="flex h-full min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-border/60 bg-muted/30 sm:min-h-[420px] lg:min-h-[520px]">
            <div class="space-y-2 text-center">
              <p class="text-sm font-medium text-muted-foreground">{{ $t('graph.graphStage.loading.title') }}</p>
              <p class="text-xs text-muted-foreground/70">{{ $t('graph.graphStage.loading.tip') }}</p>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <div
      v-if="!isLoading && !hasElements"
      class="rounded-3xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground"
    >
      <h3 class="font-semibold text-foreground">{{ $t('graph.graphStage.empty.title') }}</h3>
      <ol class="mt-2 list-decimal space-y-1 pl-4 text-xs">
        <li v-for="step in emptySteps" :key="step">{{ step }}</li>
      </ol>
    </div>
  </section>
</template>
