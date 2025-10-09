<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
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

function clear() {
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
}

const labelOptions = computed(() => props.nodeLabels ?? [])
const relationshipOptions = computed(() => props.relationships ?? [])
const nodeOptions = computed(() => props.nodes ?? [])
</script>

<template>
  <Card class="rounded-2xl border-border/70 bg-card/90 shadow-sm backdrop-blur">
    <CardHeader>
      <CardTitle class="text-base font-semibold whitespace-nowrap">{{ $t('graph.quickFilters.title') }}</CardTitle>
    </CardHeader>
    <CardContent class="space-y-5 text-xs md:text-sm">
      <section v-if="labelOptions.length">
        <h3 class="mb-2 text-muted-foreground whitespace-nowrap">{{ $t('graph.quickFilters.type') }}</h3>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="option in labelOptions"
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

      <section v-if="relationshipOptions.length">
        <h3 class="mb-2 text-muted-foreground whitespace-nowrap">{{ $t('graph.quickFilters.channel') }}</h3>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="option in relationshipOptions"
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

      <section v-if="nodeOptions.length">
        <header class="mb-2 flex items-center justify-between text-muted-foreground">
          <h3 class="font-medium whitespace-nowrap">{{ $t('graph.sidebar.insight') }}</h3>
          <Badge variant="outline" class="rounded-full border-border/60 text-[11px] text-muted-foreground">
            {{ $t('graph.trending.delta') }}
          </Badge>
        </header>
        <div class="space-y-2">
          <button
            v-for="option in nodeOptions"
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
          <span v-if="!loading">{{ $t('graph.quickFilters.apply') }} +10</span>
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
    <CardFooter class="flex items-center justify-between">
      <Button variant="ghost" size="sm" class="rounded-full" @click="clear">
        {{ $t('graph.quickFilters.clear') }}
      </Button>
      <Button size="sm" class="rounded-full px-4" @click="emit('apply')">
        {{ $t('graph.quickFilters.apply') }}
      </Button>
    </CardFooter>
  </Card>
</template>
