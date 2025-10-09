<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import Sheet from '~/components/ui/sheet/Sheet.vue'
import SheetContent from '~/components/ui/sheet/SheetContent.vue'
import SheetHeader from '~/components/ui/sheet/SheetHeader.vue'
import SheetTitle from '~/components/ui/sheet/SheetTitle.vue'
import SheetDescription from '~/components/ui/sheet/SheetDescription.vue'
import Button from '~/components/ui/button.vue'
import Badge from '~/components/ui/badge.vue'
import type { AdvancedAnalysisPayload, ExportPayload, GraphFilters, LayoutType, NetworkAnalysisRequest, RedactionLevel } from '~/types/graph'

type AvailableFilters = {
  nodeTypes: string[]
  edgeTypes: string[]
  regions: string[]
  channels: string[]
  sources: string[]
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    availableFilters: AvailableFilters
    defaultConfidence: number
    exportFormats: ExportPayload['type'][]
    layout: LayoutType
    filters: GraphFilters
    timelineRange: [string, string]
    redaction: RedactionLevel
  }>(),
  {
    modelValue: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'runAnalysis', payload: NetworkAnalysisRequest): void
  (e: 'export', payload: ExportPayload): void
  (e: 'apply', payload: AdvancedAnalysisPayload): void
  (e: 'setRedaction', level: RedactionLevel): void
}>()

const open = ref(props.modelValue)
const localFilters = reactive<GraphFilters>({ ...props.filters })
const localLayout = ref<LayoutType>(props.layout)
const localConfidence = ref(props.defaultConfidence)
const redactionLevel = ref<RedactionLevel>(props.redaction)
const timeline = reactive({
  enabled: false,
  range: [...props.timelineRange] as [string, string]
})

watch(
  () => props.modelValue,
  (value) => {
    open.value = value
  }
)

watch(open, (value) => emit('update:modelValue', value))

watch(
  () => props.filters,
  (value) => Object.assign(localFilters, value),
  { deep: true }
)

watch(
  () => props.layout,
  (value) => {
    localLayout.value = value
  }
)

watch(
  () => props.defaultConfidence,
  (value) => {
    localConfidence.value = value
  }
)

watch(
  () => props.redaction,
  (value) => {
    redactionLevel.value = value
  }
)

watch(
  () => props.timelineRange,
  (value) => {
    timeline.range[0] = value[0]
    timeline.range[1] = value[1]
  }
)

const layoutOptions: LayoutType[] = ['force', 'hierarchy', 'timeline']
const analysisOptions: NetworkAnalysisRequest['algorithm'][] = ['louvain', 'leiden', 'degree', 'betweenness', 'shortestPath']

function toggleFilter(key: keyof GraphFilters, value: string) {
  const current = new Set(localFilters[key] as string[])
  if (current.has(value)) current.delete(value)
  else current.add(value)
  ;(localFilters[key] as string[]) = Array.from(current)
}

function runAnalysis(algorithm: NetworkAnalysisRequest['algorithm']) {
  emit('runAnalysis', { algorithm })
}

function applyAdvanced() {
  emit('apply', {
    layout: localLayout.value,
    redaction: redactionLevel.value,
    filters: { ...localFilters, confidence: localConfidence.value },
    timeline: {
      enabled: timeline.enabled,
      range: timeline.range
    }
  })
}

function exportGraph(type: ExportPayload['type']) {
  emit('export', { type })
}

function setRedaction(level: RedactionLevel) {
  redactionLevel.value = level
  emit('setRedaction', level)
}
</script>

<template>
  <Sheet :open="open" @update:open="(value: boolean) => (open = value)">
    <SheetContent side="right" class="w-full max-w-md overflow-y-auto border-l border-border/60 bg-background/95 backdrop-blur">
      <SheetHeader class="space-y-2 text-left">
        <SheetTitle class="text-lg font-semibold">
          {{ $t('graph.advancedDrawer.title') }}
        </SheetTitle>
        <SheetDescription class="text-sm text-muted-foreground">
          {{ $t('graph.advancedDrawer.filters') }}
        </SheetDescription>
      </SheetHeader>

      <section class="mt-6 space-y-3">
        <h3 class="text-sm font-semibold text-foreground">{{ $t('graph.graphStage.toolbar.layout.label') }}</h3>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="option in layoutOptions"
            :key="option"
            size="sm"
            variant="ghost"
            class="rounded-full border border-border/60 px-3 text-xs"
            :class="{ 'border-primary bg-primary/10 text-primary': localLayout === option }"
            @click="localLayout = option"
          >
            {{ $t(`graph.graphStage.toolbar.layout.${option}`) }}
          </Button>
        </div>
      </section>

      <section class="mt-6 space-y-3">
        <header class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-foreground">{{ $t('graph.advancedDrawer.filters') }}</h3>
          <Badge variant="outline" class="rounded-full border-border/60 text-xs">
            {{ $t('graph.quickFilters.confidence') }} {{ Math.round(localConfidence * 100) }}%
          </Badge>
        </header>

        <div class="space-y-4 text-xs">
          <div>
            <p class="mb-2 text-muted-foreground">{{ $t('graph.advancedDrawer.nodes') }}</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="item in props.availableFilters.nodeTypes"
                :key="item"
                size="sm"
                variant="ghost"
                class="rounded-full border border-border/60 px-3"
                :class="{ 'border-primary bg-primary/10 text-primary': localFilters.nodeKinds.includes(item) }"
                @click="toggleFilter('nodeKinds', item)"
              >
                {{ $t(`graph.quickFilters.chips.${item}`) }}
              </Button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-muted-foreground">{{ $t('graph.advancedDrawer.edges') }}</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="item in props.availableFilters.edgeTypes"
                :key="item"
                size="sm"
                variant="ghost"
                class="rounded-full border border-border/60 px-3"
                :class="{ 'border-primary bg-primary/10 text-primary': localFilters.edgeKinds.includes(item) }"
                @click="toggleFilter('edgeKinds', item)"
              >
                {{ $t(`graph.sources.${item}`) }}
              </Button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-muted-foreground">{{ $t('graph.quickFilters.channel') }}</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="item in props.availableFilters.channels"
                :key="item"
                size="sm"
                variant="ghost"
                class="rounded-full border border-border/60 px-3"
                :class="{ 'border-primary bg-primary/10 text-primary': localFilters.channels.includes(item) }"
                @click="toggleFilter('channels', item)"
              >
                {{ item }}
              </Button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-muted-foreground">{{ $t('graph.advancedDrawer.regions') }}</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="item in props.availableFilters.regions"
                :key="item"
                size="sm"
                variant="ghost"
                class="rounded-full border border-border/60 px-3"
                :class="{ 'border-primary bg-primary/10 text-primary': localFilters.regions.includes(item) }"
                @click="toggleFilter('regions', item)"
              >
                {{ item }}
              </Button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-muted-foreground">{{ $t('graph.advancedDrawer.sources') }}</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="item in props.availableFilters.sources"
                :key="item"
                size="sm"
                variant="ghost"
                class="rounded-full border border-border/60 px-3"
                :class="{ 'border-primary bg-primary/10 text-primary': localFilters.sources.includes(item) }"
                @click="toggleFilter('sources', item)"
              >
                {{ item }}
              </Button>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs text-muted-foreground">{{ $t('graph.quickFilters.confidence') }}</label>
          <input
            v-model.number="localConfidence"
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            class="w-full accent-primary"
          />
        </div>
      </section>

      <section class="mt-8 space-y-3">
        <h3 class="text-sm font-semibold text-foreground">{{ $t('graph.advancedDrawer.analysis') }}</h3>
        <p class="text-xs text-muted-foreground">{{ $t('graph.advancedDrawer.analysisHint') }}</p>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="algorithm in analysisOptions"
            :key="algorithm"
            size="sm"
            variant="ghost"
            class="rounded-full border border-border/60 px-3 text-xs"
            @click="runAnalysis(algorithm)"
          >
            {{ algorithm }}
          </Button>
        </div>
      </section>

      <section class="mt-8 space-y-3">
        <h3 class="text-sm font-semibold text-foreground">{{ $t('graph.advancedDrawer.timeline') }}</h3>
        <div class="flex items-center justify-between text-xs text-muted-foreground">
          <label class="flex items-center gap-2">
            <input v-model="timeline.enabled" type="checkbox" class="size-4 accent-primary" />
            <span>{{ timeline.enabled ? $t('graph.states.enabled') : $t('graph.states.disabled') }}</span>
          </label>
          <span>{{ new Date(timeline.range[0]).toLocaleDateString() }} ~ {{ new Date(timeline.range[1]).toLocaleDateString() }}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <label class="flex flex-col gap-1">
            <span>{{ $t('graph.advancedDrawer.start') }}</span>
            <input v-model="timeline.range[0]" type="date" class="rounded-md border border-border/60 bg-background px-2 py-1" />
          </label>
          <label class="flex flex-col gap-1">
            <span>{{ $t('graph.advancedDrawer.end') }}</span>
            <input v-model="timeline.range[1]" type="date" class="rounded-md border border-border/60 bg-background px-2 py-1" />
          </label>
        </div>
      </section>

      <section class="mt-8 space-y-3">
        <h3 class="text-sm font-semibold text-foreground">{{ $t('graph.advancedDrawer.importExport') }}</h3>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="format in exportFormats"
            :key="format"
            size="sm"
            variant="ghost"
            class="rounded-full border border-border/60 px-3 text-xs"
            @click="exportGraph(format)"
          >
            {{ format.toUpperCase() }}
          </Button>
        </div>
      </section>

      <section class="mt-8 space-y-3">
        <h3 class="text-sm font-semibold text-foreground">{{ $t('graph.advancedDrawer.redaction') }}</h3>
        <div class="flex items-center gap-2 text-xs">
          <Button
            v-for="level in ['weak', 'medium', 'strong']"
            :key="level"
            size="sm"
            variant="ghost"
            class="rounded-full border border-border/60 px-3"
            :class="{ 'border-primary bg-primary/10 text-primary': redactionLevel === level }"
            @click="setRedaction(level as RedactionLevel)"
          >
            {{ level }}
          </Button>
        </div>
      </section>

      <footer class="sticky bottom-0 mt-6 flex items-center justify-between border-t border-border/60 bg-background/80 py-4">
        <Button variant="ghost" size="sm" class="rounded-full px-3" @click="open = false">
          {{ $t('graph.states.close') }}
        </Button>
        <Button size="sm" class="rounded-full px-4" @click="applyAdvanced">
          {{ $t('graph.advancedDrawer.apply') }}
        </Button>
      </footer>
    </SheetContent>
  </Sheet>
</template>
