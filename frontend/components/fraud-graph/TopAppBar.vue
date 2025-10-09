<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import Button from '~/components/ui/button.vue'
import Badge from '~/components/ui/badge.vue'
import DropdownMenu from '~/components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuTrigger from '~/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import DropdownMenuContent from '~/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '~/components/ui/dropdown-menu/DropdownMenuItem.vue'
import GlobalSearch from './GlobalSearch.vue'
import { useUIStore } from '~/stores/useUIStore'
import { CalendarRange, Globe, HelpCircle, Sparkles } from 'lucide-vue-next'

const uiStore = useUIStore()
const { t, locale } = useI18n()

const { globalQuery, searchSuggestions, timeRange, timeRangeLabel, showAdvancedButtonBadge, locale: storeLocale } = storeToRefs(uiStore)

const timeRangeOptions = computed(() => [
  { id: '24h', label: t('graph.timeRanges.24h') },
  { id: '7d', label: t('graph.timeRanges.7d') },
  { id: '30d', label: t('graph.timeRanges.30d') },
  { id: 'custom', label: t('graph.timeRanges.custom') }
])

watch(
  () => storeLocale.value,
  (next) => {
    if (next !== locale.value) {
      locale.value = next
    }
  },
  { immediate: true }
)

watch(
  () => locale.value,
  (next) => {
    if (next !== storeLocale.value) {
      uiStore.switchLocale(next as 'zh' | 'en')
    }
  }
)

function handleSearch() {
  // 预留: 可触发后端检索或导航
}

function toggleLocale() {
  const next = locale.value === 'zh' ? 'en' : 'zh'
  locale.value = next
}
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-lg"
    role="banner"
  >
    <div class="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <Sparkles class="size-5 text-primary" aria-hidden="true" />
          <h1 class="text-xl font-semibold tracking-tight md:text-2xl">
            {{ t('graph.pageTitle') }}
          </h1>
        </div>
        <p class="text-sm text-muted-foreground md:text-base">
          {{ t('graph.pageSubtitle') }}
        </p>
      </div>

      <div class="flex flex-col gap-3 lg:w-3/5">
        <GlobalSearch
          v-model="globalQuery"
          :suggestions="searchSuggestions"
          @submit="handleSearch"
          @open-command="uiStore.openCommandPalette()"
        />
        <div class="flex flex-wrap items-center gap-2 text-sm md:text-base">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="sm" class="flex items-center gap-2 rounded-full border border-border/60 px-3">
                <CalendarRange class="size-4 text-muted-foreground" aria-hidden="true" />
                <span class="hidden sm:inline">{{ t('graph.appBar.timeRange') }}:</span>
                <span>{{ t(timeRangeLabel) }}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                v-for="option in timeRangeOptions"
                :key="option.id"
                :class="{ 'bg-muted/80 text-foreground': option.id === timeRange }"
                @select="uiStore.setTimeRange(option.id as '24h' | '7d' | '30d' | 'custom')"
              >
                {{ option.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            class="flex items-center gap-2 rounded-full border border-border/60 px-3"
            @click="toggleLocale"
          >
            <Globe class="size-4 text-muted-foreground" aria-hidden="true" />
            <span>{{ t('graph.appBar.locale') }}: {{ locale === 'zh' ? '中文' : 'English' }}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            class="flex items-center gap-2 rounded-full border border-border/60 px-3"
            @click="uiStore.triggerHelp(true)"
          >
            <HelpCircle class="size-4 text-muted-foreground" aria-hidden="true" />
            <span>{{ t('graph.appBar.help') }}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            class="relative ml-auto flex items-center gap-2 rounded-full border border-primary/50 px-4 text-primary shadow-sm"
            @click="uiStore.toggleAdvancedDrawer(true)"
          >
            <Sparkles class="size-4" aria-hidden="true" />
            <span>{{ t('graph.appBar.advanced') }}</span>
            <Badge
              v-if="showAdvancedButtonBadge"
              variant="secondary"
              class="absolute -right-3 -top-2 animate-bounce rounded-full bg-primary text-xs text-primary-foreground"
            >
              New
            </Badge>
          </Button>
        </div>
      </div>
    </div>
  </header>
</template>
