<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import SceneWizard from './SceneWizard.vue'
import QuickFilters from './QuickFilters.vue'
import Card from '~/components/ui/card.vue'
import CardHeader from '~/components/ui/card-header.vue'
import CardTitle from '~/components/ui/card-title.vue'
import CardContent from '~/components/ui/card-content.vue'
import Badge from '~/components/ui/badge.vue'
import { useGraphStore } from '~/stores/useGraphStore'
import type { ScenarioPayload } from '~/types/graph'
import { TrendingUp, ShieldAlert } from 'lucide-vue-next'

const graphStore = useGraphStore()
const { filters, trending, pitfalls } = storeToRefs(graphStore)

const filterState = computed({
  get: () => filters.value,
  set: (value) => graphStore.setFilters(value)
})

function handleScenarioComplete(payload: ScenarioPayload) {
  graphStore.setScenario(payload)
  graphStore.resetView()
}
</script>

<template>
  <aside class="flex h-full flex-col gap-4">
    <SceneWizard @complete="handleScenarioComplete" />

    <QuickFilters v-model="filterState" @apply="graphStore.initialize()" />

    <Card class="rounded-2xl border-border/70 bg-card/90 shadow-sm backdrop-blur">
      <CardHeader class="flex flex-row items-center gap-2">
        <TrendingUp class="size-5 text-emerald-500" aria-hidden="true" />
        <CardTitle class="text-base font-semibold">{{ $t('graph.trending.title') }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-xs md:text-sm">
        <div
          v-for="item in trending"
          :key="item.id"
          class="rounded-xl border border-border/60 bg-background/80 p-3"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-medium text-foreground">{{ $t(item.title) }}</h3>
            <Badge variant="outline" class="rounded-full border-emerald-200 bg-emerald-100 text-xs text-emerald-700">
              {{ $t('graph.trending.delta') }} {{ Math.round(item.delta * 100) }}%
            </Badge>
          </div>
          <p class="mt-2 leading-relaxed text-muted-foreground">{{ $t(item.description) }}</p>
        </div>
      </CardContent>
    </Card>

    <Card class="rounded-2xl border-border/70 bg-card/90 shadow-sm backdrop-blur">
      <CardHeader class="flex flex-row items-center gap-2">
        <ShieldAlert class="size-5 text-amber-500" aria-hidden="true" />
        <CardTitle class="text-base font-semibold">{{ $t('graph.pitfalls.title') }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-xs md:text-sm">
        <div
          v-for="item in pitfalls"
          :key="item.id"
          class="rounded-xl border border-dashed border-border/70 bg-background/80 p-3"
        >
          <h3 class="font-medium text-foreground">{{ $t(item.title) }}</h3>
          <ol class="mt-2 list-decimal space-y-1 pl-4 text-muted-foreground">
            <li v-for="tip in item.guidance" :key="tip">{{ $t(tip) }}</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  </aside>
</template>
