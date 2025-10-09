import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import type { ScenarioPayload, ScenarioStep } from '~/types/graph'
import { scenarioSteps, defaultScenario } from '~/mocks/graph/insights'

type ScenarioSelections = Record<string, string | null>

function buildInitialSelections(steps: ScenarioStep[]): ScenarioSelections {
  return steps.reduce((acc, step) => {
    acc[step.id] = null
    return acc
  }, {} as ScenarioSelections)
}

function composeScenario(selections: ScenarioSelections): ScenarioPayload {
  const who = selections['who']
  const ask = selections['ask']
  const where = selections['where']

  if (!who || !ask || !where) {
    return defaultScenario
  }

  const id = `${who}-${ask}-${where}`
  const baseKey = `graph.scenario.base.${who}-${ask}`
  let riskLevel: ScenarioPayload['riskLevel'] = 'medium'

  if (who === 'senior' && ask === 'investment') {
    riskLevel = 'high'
  } else if (ask === 'impersonation') {
    riskLevel = 'medium'
  } else {
    riskLevel = 'medium'
  }

  const title = `${baseKey}.title`
  const summary = `${baseKey}.summary`

  return {
    id,
    title,
    summary,
    riskLevel
  }
}

export const useScenarioStore = defineStore('scenario', () => {
  const steps = ref<ScenarioStep[]>(scenarioSteps)
  const selections = reactive<ScenarioSelections>(buildInitialSelections(steps.value))
  const isSubmitting = ref(false)

  const isComplete = computed(() => steps.value.every((step) => selections[step.id] !== null))

  const scenarioPreview = computed(() => composeScenario(selections))

  function select(stepId: string, optionId: string) {
    selections[stepId] = optionId
  }

  function reset() {
    Object.assign(selections, buildInitialSelections(steps.value))
  }

  async function submit() {
    if (!isComplete.value || isSubmitting.value) return null
    isSubmitting.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return composeScenario(selections)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    steps,
    selections,
    isComplete,
    scenarioPreview,
    isSubmitting,
    select,
    reset,
    submit
  }
})
