<script setup lang="ts">
import { computed } from 'vue'
import Button from '~/components/ui/button.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import DropdownMenu from '~/components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuTrigger from '~/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import DropdownMenuContent from '~/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '~/components/ui/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuLabel from '~/components/ui/dropdown-menu/DropdownMenuLabel.vue'
import DropdownMenuSeparator from '~/components/ui/dropdown-menu/DropdownMenuSeparator.vue'
import Badge from '~/components/ui/badge.vue'
import type { LayoutType } from '~/types/graph'
import { BoxSelect, LayoutGrid, RefreshCw, ZoomIn, ZoomOut, HelpCircle, Sparkles, Globe, PanelLeft, PanelLeftOpen } from 'lucide-vue-next'

const props = defineProps<{
  layout: LayoutType
  layouts: LayoutType[]
  boxSelect: boolean
  locale: 'zh' | 'en'
  showAdvancedBadge: boolean
  sidebarExpanded?: boolean
}>()

const emit = defineEmits<{
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'box-select', value: boolean): void
  (e: 'layout', layout: LayoutType): void
  (e: 'reset'): void
  (e: 'show-more'): void
  (e: 'toggle-locale'): void
  (e: 'toggle-help'): void
  (e: 'toggle-advanced'): void
  (e: 'toggle-sidebar'): void
}>()

function toggleBox() {
  emit('box-select', !props.boxSelect)
}

const localeLabel = computed(() => (props.locale === 'zh' ? 'English' : '中文'))
</script>

<template>
  <div class="flex w-full flex-wrap items-center gap-2 rounded-full border border-border/70 bg-card/90 px-3 py-2 shadow-sm backdrop-blur supports-[overflow:clip]:overflow-x-clip">
    <Tooltip :content="props.sidebarExpanded !== false ? $t('graph.controls.collapseSidebar') : $t('graph.controls.expandSidebar')">
      <Button
        variant="ghost"
        size="icon"
        class="rounded-full"
        @click="emit('toggle-sidebar')"
      >
        <component :is="props.sidebarExpanded !== false ? PanelLeft : PanelLeftOpen" class="size-4" aria-hidden="true" />
        <span class="sr-only">
          {{ props.sidebarExpanded !== false ? $t('graph.controls.collapseSidebar') : $t('graph.controls.expandSidebar') }}
        </span>
      </Button>
    </Tooltip>

    <Tooltip :content="$t('graph.graphStage.toolbar.zoomIn')">
      <Button variant="ghost" size="icon" class="rounded-full" @click="emit('zoom-in')">
        <ZoomIn class="size-4" aria-hidden="true" />
        <span class="sr-only">{{ $t('graph.graphStage.toolbar.zoomIn') }}</span>
      </Button>
    </Tooltip>
    <Tooltip :content="$t('graph.graphStage.toolbar.zoomOut')">
      <Button variant="ghost" size="icon" class="rounded-full" @click="emit('zoom-out')">
        <ZoomOut class="size-4" aria-hidden="true" />
        <span class="sr-only">{{ $t('graph.graphStage.toolbar.zoomOut') }}</span>
      </Button>
    </Tooltip>
    <Tooltip :content="$t('graph.graphStage.toolbar.boxSelect')">
      <Button
        variant="ghost"
        size="icon"
        :class="{ 'bg-primary/10 text-primary': boxSelect }"
        class="rounded-full"
        @click="toggleBox"
      >
        <BoxSelect class="size-4" aria-hidden="true" />
        <span class="sr-only">{{ $t('graph.graphStage.toolbar.boxSelect') }}</span>
      </Button>
    </Tooltip>
    <Tooltip :content="$t('graph.graphStage.toolbar.reset')">
      <Button variant="ghost" size="icon" class="rounded-full" @click="emit('reset')">
        <RefreshCw class="size-4" aria-hidden="true" />
        <span class="sr-only">{{ $t('graph.graphStage.toolbar.reset') }}</span>
      </Button>
    </Tooltip>

    <Button variant="ghost" size="sm" class="whitespace-nowrap rounded-full px-3 text-xs font-medium" @click="emit('show-more')">
      {{ $t('graph.graphStage.toolbar.showMore') }}
    </Button>

    <div class="ml-auto flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="sm"
            class="relative flex items-center gap-2 rounded-full border border-primary/50 px-3 text-xs text-primary shadow-sm"
          >
            <Sparkles class="size-4" aria-hidden="true" />
            <span>{{ $t('graph.appBar.advanced') }}</span>
            <Badge
              v-if="showAdvancedBadge"
              variant="secondary"
              class="absolute -right-2 -top-2 rounded-full bg-primary text-[10px] leading-none text-primary-foreground"
            >
              New
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-48">
          <DropdownMenuLabel>{{ $t('graph.graphStage.toolbar.advancedMenu.layouts') }}</DropdownMenuLabel>
          <DropdownMenuItem
            v-for="option in layouts"
            :key="option"
            :class="{ 'bg-primary/10 text-primary font-medium': option === layout }"
            @select="emit('layout', option)"
          >
            <LayoutGrid class="mr-2 size-4" aria-hidden="true" />
            {{ $t(`graph.graphStage.toolbar.layout.${option}`) }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @select="emit('toggle-advanced')">
            <Sparkles class="mr-2 size-4" aria-hidden="true" />
            {{ $t('graph.appBar.advancedDrawer') }}
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('toggle-help')">
            <HelpCircle class="mr-2 size-4" aria-hidden="true" />
            {{ $t('graph.appBar.help') }}
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('toggle-locale')">
            <Globe class="mr-2 size-4" aria-hidden="true" />
            {{ $t('graph.appBar.locale') }} · {{ localeLabel }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</template>
