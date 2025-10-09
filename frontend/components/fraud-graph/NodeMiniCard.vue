<script setup lang="ts">
import Badge from '~/components/ui/badge.vue'
import type { RiskLevel } from '~/types/graph'

const props = defineProps<{
  title: string
  type: string
  badges: string[]
  updatedAt: string
  riskLevel: RiskLevel
  sourceLabel?: string
}>()

const riskColorMap: Record<RiskLevel, string> = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700'
}
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/70 p-4">
    <div class="flex items-center justify-between gap-2">
      <Badge variant="outline" class="rounded-full border-border/60 bg-card/40 text-xs uppercase text-muted-foreground">
        {{ type }}
      </Badge>
      <span class="rounded-full px-2 py-1 text-xs font-medium" :class="riskColorMap[riskLevel]">
        {{ riskLevel.toUpperCase() }}
      </span>
    </div>
    <h3 class="text-base font-semibold leading-tight text-foreground">
      {{ title }}
    </h3>
    <div class="flex flex-wrap items-center gap-2">
      <Badge
        v-for="badge in badges"
        :key="badge"
        variant="outline"
        class="rounded-full border-transparent bg-muted/60 text-[11px] font-medium tracking-wide text-muted-foreground"
      >
        {{ badge }}
      </Badge>
    </div>
    <div class="mt-auto flex items-center justify-between text-xs text-muted-foreground">
      <span>{{ sourceLabel }}</span>
      <time :datetime="updatedAt">{{ new Date(updatedAt).toLocaleString() }}</time>
    </div>
  </div>
</template>
