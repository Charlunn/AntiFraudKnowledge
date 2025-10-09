import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

type RightPanelTab = 'overview' | 'aiExplain' | 'evidence'

export const useUIStore = defineStore('ui', () => {
  const globalQuery = ref('')
  const searchSuggestions = ref([
    'AI 换脸荐股',
    '虚拟运营商短信',
    '公检法电话冒充',
    '虚假投资社群'
  ])

  const isCommandPaletteOpen = ref(false)
  const advancedDrawerOpen = ref(false)
  const showAdvancedButtonBadge = ref(true)

  const rightPanelTab = ref<RightPanelTab>('overview')
  const timeRange = ref<'24h' | '7d' | '30d' | 'custom'>('7d')
  const locale = ref<'zh' | 'en'>('zh')
  const helpDialogOpen = ref(false)
  const showLeftRail = ref(true)

  const lastFeedbackAt = ref<Date | null>(null)

  const timeRangeLabel = computed(() => {
    return `graph.timeRanges.${timeRange.value}`
  })

  function setQuery(value: string) {
    globalQuery.value = value
  }

  function setRightPanelTab(tab: RightPanelTab) {
    rightPanelTab.value = tab
  }

  function toggleAdvancedDrawer(next?: boolean) {
    advancedDrawerOpen.value = typeof next === 'boolean' ? next : !advancedDrawerOpen.value
    if (advancedDrawerOpen.value) {
      showAdvancedButtonBadge.value = false
    }
  }

  function toggleLeftRail(next?: boolean) {
    showLeftRail.value = typeof next === 'boolean' ? next : !showLeftRail.value
  }

  function setTimeRange(next: typeof timeRange.value) {
    timeRange.value = next
  }

  function switchLocale(next: 'zh' | 'en') {
    locale.value = next
  }

  function triggerHelp(open: boolean) {
    helpDialogOpen.value = open
  }

  function openCommandPalette() {
    isCommandPaletteOpen.value = true
  }

  function closeCommandPalette() {
    isCommandPaletteOpen.value = false
  }

  function recordFeedback() {
    lastFeedbackAt.value = new Date()
  }

  function setSearchSuggestions(values: string[]) {
    searchSuggestions.value = values
  }

  return {
    globalQuery,
    searchSuggestions,
    isCommandPaletteOpen,
    advancedDrawerOpen,
    showAdvancedButtonBadge,
    rightPanelTab,
    timeRange,
    locale,
    helpDialogOpen,
    showLeftRail,
    lastFeedbackAt,
    timeRangeLabel,
    setQuery,
    setRightPanelTab,
    toggleAdvancedDrawer,
    toggleLeftRail,
    setTimeRange,
    switchLocale,
    triggerHelp,
    openCommandPalette,
    closeCommandPalette,
    recordFeedback,
    setSearchSuggestions
  }
})
