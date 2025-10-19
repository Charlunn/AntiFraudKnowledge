<script setup lang="ts">
import { reactive, computed, watch, ref } from 'vue'
import Card from '~/components/ui/card.vue'
import CardHeader from '~/components/ui/card-header.vue'
import CardTitle from '~/components/ui/card-title.vue'
import CardContent from '~/components/ui/card-content.vue'
import CardFooter from '~/components/ui/card-footer.vue'
import Button from '~/components/ui/button.vue'
import Badge from '~/components/ui/badge.vue'
import type {
  GraphFilters,
  GraphMetadataLabelSummary,
  GraphMetadataNodeSummary,
  GraphMetadataRelationshipSummary
} from '~/types/graph'

const LABEL_LIMIT = 8
const RELATIONSHIP_LIMIT = 8
const NODE_LIMIT = 6

const props = withDefaults(
  defineProps<{
    modelValue: GraphFilters
    nodeLabels: GraphMetadataLabelSummary[]
    relationships: GraphMetadataRelationshipSummary[]
    nodes: GraphMetadataNodeSummary[]
    loading?: boolean
    hasMoreNodes?: boolean
  }>(),
  {
    loading: false,
    hasMoreNodes: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: GraphFilters): void
  (e: 'apply'): void
  (e: 'load-more-nodes'): void
}>()

const localFilters = reactive<GraphFilters>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (value) => Object.assign(localFilters, value)
)

watch(
  () => ({ ...localFilters }),
  (value) => emit('update:modelValue', value),
  { deep: true }
)

const showAllLabels = ref(false)
const showAllRelationships = ref(false)
const showAllNodes = ref(false)

const sortedLabelOptions = computed(() =>
  [...(props.nodeLabels ?? [])].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
)
const sortedRelationshipOptions = computed(() =>
  [...(props.relationships ?? [])].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
)
const sortedNodeOptions = computed(() =>
  [...(props.nodes ?? [])].sort((a, b) => (b.degree ?? 0) - (a.degree ?? 0))
)

const visibleLabelOptions = computed(() =>
  showAllLabels.value ? sortedLabelOptions.value : sortedLabelOptions.value.slice(0, LABEL_LIMIT)
)
const visibleRelationshipOptions = computed(() =>
  showAllRelationships.value
    ? sortedRelationshipOptions.value
    : sortedRelationshipOptions.value.slice(0, RELATIONSHIP_LIMIT)
)
const visibleNodeOptions = computed(() =>
  showAllNodes.value ? sortedNodeOptions.value : sortedNodeOptions.value.slice(0, NODE_LIMIT)
)

const remainingLabels = computed(
  () => Math.max(sortedLabelOptions.value.length - visibleLabelOptions.value.length, 0)
)
const remainingRelationships = computed(
  () => Math.max(sortedRelationshipOptions.value.length - visibleRelationshipOptions.value.length, 0)
)
const remainingNodes = computed(
  () => Math.max(sortedNodeOptions.value.length - visibleNodeOptions.value.length, 0)
)

const selectedNodeSet = computed(() => new Set(localFilters.focusNodes))

function toggleFilter(key: keyof GraphFilters, value: string) {
  const current = new Set(localFilters[key] as string[])
  if (current.has(value)) current.delete(value)
  else current.add(value)
  ;(localFilters[key] as string[]) = Array.from(current)
}

function toggleFocusNode(nodeId: string) {
  const focusNodes = new Set(localFilters.focusNodes)
  if (focusNodes.has(nodeId)) focusNodes.delete(nodeId)
  else focusNodes.add(nodeId)
  localFilters.focusNodes = Array.from(focusNodes)
}

function resetFilters() {
  Object.assign(localFilters, {
    types: [],
    channels: [],
    roles: [],
    confidence: 0.6,
    regions: [],
    sources: [],
    nodeKinds: [],
    edgeKinds: [],
    focusNodes: [],
    searchTerm: ''
  })
  showAllLabels.value = false
  showAllRelationships.value = false
  showAllNodes.value = false
}
</script>

<template>
  <Card class="flex h-full flex-col overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-sm backdrop-blur">
    <CardHeader class="shrink-0 border-b border-border/50">
      <CardTitle class="text-base font-semibold whitespace-nowrap">{{ $t('graph.quickFilters.title') }}</CardTitle>
    </CardHeader>
    <CardContent class="flex-1 space-y-5 overflow-y-auto pr-1 text-xs md:text-sm">
      <section v-if="sortedLabelOptions.length">
        <header class="mb-2 flex items-center justify-between text-muted-foreground">
          <h3 class="font-medium whitespace-nowrap">{{ $t('graph.quickFilters.type') }}</h3>
          <Button
            v-if="remainingLabels"
            variant="link"
            class="h-auto px-0 text-[11px]"
            @click="showAllLabels = !showAllLabels"
          >
            {{ showAllLabels ? $t('graph.quickFilters.showLess') : $t('graph.quickFilters.showMore', { count: remainingLabels }) }}
          </Button>
        </header>
        <div class="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
          <Button
            v-for="option in visibleLabelOptions"
            :key="option.label"
            size="sm"
            variant="ghost"
            class="flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-xs whitespace-nowrap"
            :class="{ 'border-primary bg-primary/10 text-primary': localFilters.nodeKinds.includes(option.label) }"
            @click="toggleFilter('nodeKinds', option.label)"
          >
            <span class="font-medium">{{ option.label }}</span>
            <span class="text-[11px] text-muted-foreground">({{ option.count }})</span>
          </Button>
        </div>
      </section>

      <section v-if="sortedRelationshipOptions.length">
        <header class="mb-2 flex items-center justify-between text-muted-foreground">
          <h3 class="font-medium whitespace-nowrap">{{ $t('graph.quickFilters.channel') }}</h3>
          <Button
            v-if="remainingRelationships"
            variant="link"
            class="h-auto px-0 text-[11px]"
            @click="showAllRelationships = !showAllRelationships"
          >
            {{ showAllRelationships ? $t('graph.quickFilters.showLess') : $t('graph.quickFilters.showMore', { count: remainingRelationships }) }}
          </Button>
        </header>
        <div class="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
          <Button
            v-for="option in visibleRelationshipOptions"
            :key="option.type"
            size="sm"
            variant="ghost"
            class="flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-xs whitespace-nowrap"
            :class="{ 'border-primary bg-primary/10 text-primary': localFilters.edgeKinds.includes(option.type) }"
            @click="toggleFilter('edgeKinds', option.type)"
          >
            <span class="font-medium">{{ option.type }}</span>
            <span class="text-[11px] text-muted-foreground">({{ option.count }})</span>
          </Button>
        </div>
      </section>

      <section v-if="sortedNodeOptions.length">
        <header class="mb-2 flex items-center justify-between text-muted-foreground">
          <h3 class="font-medium whitespace-nowrap">{{ $t('graph.sidebar.insight') }}</h3>
          <div class="flex items-center gap-2">
            <Badge variant="outline" class="rounded-full border-border/60 text-[11px] text-muted-foreground">
              {{ $t('graph.trending.delta') }}
            </Badge>
            <Button
              v-if="remainingNodes"
              variant="link"
              class="h-auto px-0 text-[11px]"
              @click="showAllNodes = !showAllNodes"
            >
              {{ showAllNodes ? $t('graph.quickFilters.showLess') : $t('graph.quickFilters.showMore', { count: remainingNodes }) }}
            </Button>
          </div>
        </header>
        <div class="space-y-2">
          <button
            v-for="option in visibleNodeOptions"
            :key="option.elementId || option.id"
            type="button"
            class="flex w-full items-center justify-between rounded-xl border border-border/60 bg-background/90 px-3 py-2 text-left transition hover:border-primary/50 hover:bg-primary/5"
            :class="{ 'border-primary bg-primary/10 text-primary-foreground': selectedNodeSet.has(option.elementId || option.id) }"
            @click="toggleFocusNode(option.elementId || option.id)"
          >
            <div class="min-w-0 pr-4">
              <p class="truncate text-sm font-medium text-foreground">
                {{ option.name || option.id }}
              </p>
              <p class="truncate text-[11px] text-muted-foreground">
                {{ option.labels.join(', ') }}
              </p>
            </div>
            <Badge variant="outline" class="rounded-full border-border/70 text-[11px] text-muted-foreground">
              {{ option.degree }}
            </Badge>
          </button>
        </div>
        <Button
          v-if="hasMoreNodes"
          variant="ghost"
          size="sm"
          class="mt-2 w-full rounded-full border border-border/70 text-xs"
          :disabled="loading"
          @click="emit('load-more-nodes')"
        >
          <span v-if="!loading">{{ $t('graph.quickFilters.loadMore') }}</span>
          <span v-else>{{ $t('graph.graphStage.loading.title') }}</span>
        </Button>
      </section>

      <section>
        <div class="flex items-center justify-between text-muted-foreground">
          <span class="whitespace-nowrap">{{ $t('graph.quickFilters.confidence') }}</span>
          <Badge variant="outline" class="rounded-full border-border/70 text-muted-foreground">
            {{ Math.round(localFilters.confidence * 100) }}%
          </Badge>
        </div>
        <input
          v-model.number="localFilters.confidence"
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          class="mt-2 w-full accent-primary"
          aria-label="confidence"
        />
      </section>
    </CardContent>
    <CardFooter class="sticky bottom-0 flex items-center justify-between gap-2 border-t border-border/60 bg-card/95 px-4 py-3 backdrop-blur">
      <Button variant="ghost" size="sm" class="rounded-full" @click="resetFilters">
        {{ $t('graph.quickFilters.reset') }}
      </Button>
      <Button size="sm" class="rounded-full px-4" @click="emit('apply')">
        {{ $t('graph.quickFilters.apply') }}
      </Button>
    </CardFooter>
  </Card>
</template>
