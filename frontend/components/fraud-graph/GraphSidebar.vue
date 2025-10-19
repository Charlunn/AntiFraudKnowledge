<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Component } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import QuickFilters from './QuickFilters.vue'
import RightPanel from './RightPanel.vue'
import Card from '~/components/ui/card.vue'
import CardHeader from '~/components/ui/card-header.vue'
import CardTitle from '~/components/ui/card-title.vue'
import CardContent from '~/components/ui/card-content.vue'
import Badge from '~/components/ui/badge.vue'
import type { AIExplainSection, EvidenceItem, GraphEdgeElement, GraphNodeElement } from '~/types/graph'
import { useGraphStore } from '~/stores/useGraphStore'
import { Filter, TrendingUp, ShieldAlert, Lightbulb } from 'lucide-vue-next'

type TabId = 'filters' | 'trending' | 'pitfalls' | 'insight'

const props = defineProps<{
  selected: GraphNodeElement | GraphEdgeElement | null
  aiSummary: AIExplainSection[]
  evidenceList: EvidenceItem[]
  redactionMessage: string
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'share', format: 'h5' | 'png'): void
  (e: 'help'): void
  (e: 'read'): void
}>()

const graphStore = useGraphStore()
const { filters, metadataForFilters, metadataLoading, trending, pitfalls } = storeToRefs(graphStore)
const { t } = useI18n()

const filterState = computed({
  get: () => filters.value,
  set: (value) => graphStore.setFilters(value)
})

const tabItems = computed<Array<{ id: TabId; label: string; icon: Component }>>(() => [
  { id: 'filters', label: t('graph.sidebar.filters'), icon: Filter },
  { id: 'trending', label: t('graph.sidebar.trending'), icon: TrendingUp },
  { id: 'pitfalls', label: t('graph.sidebar.pitfalls'), icon: ShieldAlert },
  { id: 'insight', label: t('graph.sidebar.insight'), icon: Lightbulb }
])

const activeTab = ref<TabId>('filters')

function selectTab(id: TabId) {
  activeTab.value = id
}

function applyFilters() {
  graphStore.applyFilters()
}

function loadMoreNodes() {
  graphStore.loadMoreMetadataNodes()
}

onMounted(() => {
  graphStore.loadMetadata()
})
</script>

<template>
  <aside class="flex h-full min-h-[520px] flex-col gap-4 rounded-3xl border border-border/50 bg-card/95 p-4 shadow-md backdrop-blur">
    <nav class="flex w-full items-center gap-1 rounded-2xl bg-muted/40 p-1">
      <button
        v-for="tab in tabItems"
        :key="tab.id"
        type="button"
        class="flex items-center gap-2 rounded-full text-xs font-semibold transition-all duration-200 ease-in-out"
        :class="tab.id === activeTab
          ? 'flex-1 min-w-0 justify-start bg-background px-3 py-2 text-foreground shadow-sm'
          : 'w-12 flex-none justify-center px-0 py-2 text-muted-foreground hover:text-foreground'"
        :aria-pressed="tab.id === activeTab"
        :title="tab.label"
        @click="selectTab(tab.id)"
      >
        <component :is="tab.icon" class="size-4 shrink-0" aria-hidden="true" />
        <span v-if="tab.id === activeTab" class="truncate whitespace-nowrap">{{ tab.label }}</span>
      </button>
    </nav>

    <div class="flex-1 overflow-y-auto pr-1">
      <Transition name="sidebar-tab" mode="out-in">
        <div :key="activeTab" class="flex h-full flex-col gap-4">
          <template v-if="activeTab === 'filters'">
            <QuickFilters
              v-model="filterState"
              :node-labels="metadataForFilters.labels"
              :relationships="metadataForFilters.relationships"
              :nodes="metadataForFilters.nodes"
              :loading="metadataLoading"
              :has-more-nodes="metadataForFilters.pagination.hasMore"
              class="rounded-2xl border border-border/50 bg-background/90 p-3 shadow-sm"
              @apply="applyFilters"
              @load-more-nodes="loadMoreNodes"
            />
          </template>

          <template v-else-if="activeTab === 'trending'">
            <Card class="rounded-2xl border-border/60 bg-background/85 shadow-sm">
              <CardHeader class="flex min-w-0 flex-row items-center gap-2">
                <TrendingUp class="size-5 text-emerald-500" aria-hidden="true" />
                <CardTitle class="truncate whitespace-nowrap text-base font-semibold">{{ t('graph.trending.title') }}</CardTitle>
              </CardHeader>
              <CardContent class="space-y-3 text-xs md:text-sm">
                <div
                  v-for="item in trending"
                  :key="item.id"
                  class="rounded-xl border border-border/60 bg-muted/40 p-3"
                >
                  <div class="flex items-center justify-between gap-3">
                    <h3 class="truncate font-medium text-foreground">{{ t(item.title) }}</h3>
                    <Badge variant="outline" class="whitespace-nowrap rounded-full border-emerald-200 bg-emerald-100 text-xs text-emerald-700">
                      {{ t('graph.trending.delta') }} {{ Math.round(item.delta * 100) }}%
                    </Badge>
                  </div>
                  <p class="mt-2 leading-relaxed text-muted-foreground">{{ t(item.description) }}</p>
                </div>
              </CardContent>
            </Card>
          </template>

          <template v-else-if="activeTab === 'pitfalls'">
            <Card class="rounded-2xl border-border/60 bg-background/85 shadow-sm">
              <CardHeader class="flex min-w-0 flex-row items-center gap-2">
                <ShieldAlert class="size-5 text-amber-500" aria-hidden="true" />
                <CardTitle class="truncate whitespace-nowrap text-base font-semibold">{{ t('graph.pitfalls.title') }}</CardTitle>
              </CardHeader>
              <CardContent class="space-y-3 text-xs md:text-sm">
                <div
                  v-for="item in pitfalls"
                  :key="item.id"
                  class="rounded-xl border border-dashed border-border/70 bg-muted/30 p-3"
                >
                  <h3 class="font-medium text-foreground">{{ t(item.title) }}</h3>
                  <ol class="mt-2 list-decimal space-y-1 pl-4 text-muted-foreground">
                    <li v-for="tip in item.guidance" :key="tip">{{ t(tip) }}</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </template>

          <template v-else>
            <RightPanel
              embedded
              :selected="props.selected"
              :ai-summary="props.aiSummary"
              :evidence-list="props.evidenceList"
              :redaction-message="props.redactionMessage"
              @save="$emit('save')"
              @share="(format) => $emit('share', format)"
              @help="$emit('help')"
              @read="$emit('read')"
            />
          </template>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-tab-enter-active,
.sidebar-tab-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.sidebar-tab-enter-from,
.sidebar-tab-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
