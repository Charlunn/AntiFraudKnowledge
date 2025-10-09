<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import Card from '~/components/ui/card.vue'
import CardHeader from '~/components/ui/card-header.vue'
import CardTitle from '~/components/ui/card-title.vue'
import CardContent from '~/components/ui/card-content.vue'
import CardFooter from '~/components/ui/card-footer.vue'
import Button from '~/components/ui/button.vue'
import Badge from '~/components/ui/badge.vue'
import { useScenarioStore } from '~/stores/useScenarioStore'
import type { ScenarioPayload } from '~/types/graph'
import { CheckCircle2 } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'complete', payload: ScenarioPayload): void
}>()

const scenarioStore = useScenarioStore()
const { steps, selections, isComplete, scenarioPreview, isSubmitting } = storeToRefs(scenarioStore)
const { t } = useI18n()

const activeIndex = ref(0)

const activeStep = computed(() => steps.value[activeIndex.value])

const actionLabel = computed(() =>
  activeIndex.value < steps.value.length - 1 ? 'graph.sceneWizard.next' : 'graph.sceneWizard.submit'
)

async function handleSubmit() {
  if (!isComplete.value) return
  const result = await scenarioStore.submit()
  if (result) {
    emit('complete', result)
  }
}

function goNext() {
  if (activeIndex.value < steps.value.length - 1) {
    activeIndex.value += 1
  } else {
    handleSubmit()
  }
}

function goPrev() {
  if (activeIndex.value > 0) {
    activeIndex.value -= 1
  }
}

function selectOption(optionId: string) {
  scenarioStore.select(activeStep.value.id, optionId)
}

function reset() {
  scenarioStore.reset()
  activeIndex.value = 0
}

const displayTitle = computed(() => {
  if (scenarioPreview.value.id === 'baseline') {
    return t(scenarioPreview.value.title)
  }
  const [who, ask] = scenarioPreview.value.id.split('-')
  if (!who || !ask) {
    return t(scenarioPreview.value.title)
  }
  return `${t(`graph.sceneWizard.options.${who}.label`)} · ${t(`graph.sceneWizard.options.${ask}.label`)}`
})

const displaySummary = computed(() => {
  if (scenarioPreview.value.id === 'baseline') {
    return t(scenarioPreview.value.summary)
  }
  const parts = scenarioPreview.value.id.split('-')
  if (parts.length < 3) {
    return t(scenarioPreview.value.summary)
  }
  const [, , where] = parts
  const baseSummary = t(scenarioPreview.value.summary)
  const channelSummary = t(`graph.scenario.channel.${where}`)
  return `${baseSummary} ${channelSummary}`
})
</script>

<template>
  <Card class="rounded-2xl border-border/70 bg-card/90 shadow-sm backdrop-blur">
    <CardHeader class="space-y-1">
      <CardTitle class="flex items-center gap-2 text-lg font-semibold">
        <CheckCircle2 class="size-5 text-primary" aria-hidden="true" />
        <span>{{ $t('graph.sceneWizard.title') }}</span>
      </CardTitle>
      <p class="text-sm text-muted-foreground">
        {{ $t('graph.sceneWizard.subtitle') }}
      </p>
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <span v-for="(step, index) in steps" :key="step.id" class="flex items-center gap-1">
          <Badge
            :variant="index === activeIndex ? 'default' : selections[step.id] ? 'secondary' : 'outline'"
            class="rounded-full px-3 py-1 lowercase tracking-wide"
          >
            {{ index + 1 }}.
            {{ $t(step.label) }}
          </Badge>
          <span v-if="index !== steps.length - 1" class="opacity-40">→</span>
        </span>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <div class="space-y-2">
        <h3 class="text-sm font-medium text-foreground/90">{{ activeStep ? $t(activeStep.label) : '' }}</h3>
        <div class="grid grid-cols-1 gap-2">
          <button
            v-for="option in activeStep?.options ?? []"
            :key="option.id"
            type="button"
            class="flex items-start gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-3 text-left text-sm transition hover:border-primary/60 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            :class="{
              'border-primary bg-primary/10': selections[activeStep.id] === option.id
            }"
            @click="selectOption(option.id)"
          >
            <span
              class="mt-0.5 inline-flex size-5 items-center justify-center rounded-full border border-border text-xs font-semibold text-muted-foreground"
              :class="{ 'border-primary text-primary': selections[activeStep.id] === option.id }"
            >
              {{ option.id.slice(0, 1).toUpperCase() }}
            </span>
            <span class="flex flex-col">
              <span class="font-medium text-foreground">{{ $t(option.label) }}</span>
              <span class="text-xs text-muted-foreground">{{ $t(option.description) }}</span>
            </span>
          </button>
        </div>
      </div>

      <div
        class="rounded-xl border border-dashed border-border/70 bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground"
        aria-live="polite"
      >
        <p class="font-medium text-foreground mb-1">{{ displayTitle }}</p>
        <p>{{ displaySummary }}</p>
      </div>
    </CardContent>

    <CardFooter class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2 text-xs">
        <Badge variant="outline" class="rounded-full">
          {{ $t('graph.riskBar.title') }}: {{ scenarioPreview.riskLevel.toUpperCase() }}
        </Badge>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" class="rounded-full" :disabled="isSubmitting" @click="reset">
          {{ $t('graph.sceneWizard.reset') }}
        </Button>
        <Button
          v-if="activeIndex > 0"
          variant="ghost"
          size="sm"
          class="rounded-full"
          :disabled="isSubmitting"
          @click="goPrev"
        >
          {{ $t('graph.sceneWizard.prev') }}
        </Button>
        <Button
          size="sm"
          class="rounded-full px-4"
          :disabled="!selections[activeStep.id] || isSubmitting"
          @click="goNext"
        >
          <span class="px-2">{{ $t(actionLabel) }}</span>
        </Button>
      </div>
    </CardFooter>
  </Card>
</template>
