<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Badge from '~/components/ui/badge.vue'
import Button from '~/components/ui/button.vue'
import type { RiskLevel } from '~/types/graph'

const props = defineProps<{
  level: RiskLevel
}>()

const riskColors: Record<RiskLevel, string> = {
  low: 'from-emerald-400 to-emerald-500',
  medium: 'from-amber-400 to-amber-500',
  high: 'from-rose-500 to-rose-600'
}

const { tm } = useI18n()
const checklistSteps = computed(() => (tm('graph.riskBar.steps') as string[]) || [])
</script>

<template>
  <div class="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm backdrop-blur">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p class="text-sm font-medium text-muted-foreground">{{ $t('graph.riskBar.title') }}</p>
        <h3 class="text-xl font-semibold text-foreground">
          {{ level.toUpperCase() }}
        </h3>
      </div>
      <Badge variant="outline" class="rounded-full border-border/70 text-xs text-muted-foreground">
        {{ $t('graph.riskBar.cta') }}
      </Badge>
    </div>
    <div class="flex items-center gap-2">
      <div class="flex-1 overflow-hidden rounded-full bg-muted/40">
        <div
          class="h-3 rounded-full bg-gradient-to-r transition-all duration-500"
          :class="riskColors[level]"
          :style="{ width: level === 'low' ? '33%' : level === 'medium' ? '66%' : '100%' }"
        />
      </div>
      <span class="text-xs text-muted-foreground uppercase">{{ level }}</span>
    </div>
    <ol class="grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
      <li v-for="(step, index) in checklistSteps" :key="index" class="flex items-center gap-2">
        <span class="flex size-6 items-center justify-center rounded-full border border-border/70 text-xs font-semibold text-muted-foreground">
          {{ index + 1 }}
        </span>
        <span>{{ step }}</span>
      </li>
    </ol>
    <Button size="sm" class="self-start rounded-full px-4 text-xs">{{ $t('graph.riskBar.cta') }}</Button>
  </div>
</template>
