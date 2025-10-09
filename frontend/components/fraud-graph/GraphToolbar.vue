<script setup lang="ts">
import Button from '~/components/ui/button.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import type { LayoutType } from '~/types/graph'
import { BoxSelect, LayoutGrid, Play, Pause, RefreshCw, ZoomIn, ZoomOut } from 'lucide-vue-next'

const props = defineProps<{
  layout: LayoutType
  layouts: LayoutType[]
  isPlaying: boolean
  boxSelect: boolean
}>()

const emit = defineEmits<{
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'box-select', value: boolean): void
  (e: 'layout', layout: LayoutType): void
  (e: 'toggle-play'): void
  (e: 'reset'): void
  (e: 'show-more'): void
}>()

function toggleBox() {
  emit('box-select', !props.boxSelect)
}
</script>

<template>
  <div class="flex w-full items-center gap-2 overflow-x-auto rounded-full border border-border/70 bg-card/90 px-3 py-2 shadow-sm backdrop-blur supports-[overflow:clip]:overflow-x-clip">
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

    <div class="mx-2 hidden h-6 w-px bg-border/70 sm:block" />

    <div class="flex items-center gap-1">
      <Button
        v-for="option in layouts"
        :key="option"
        variant="ghost"
        size="sm"
        class="rounded-full px-3 text-xs whitespace-nowrap"
        :class="{ 'bg-primary/10 text-primary': option === layout }"
        @click="emit('layout', option)"
      >
        <LayoutGrid class="mr-1 size-3" aria-hidden="true" />
        {{ $t(`graph.graphStage.toolbar.layout.${option}`) }}
      </Button>
    </div>

    <div class="mx-2 hidden h-6 w-px bg-border/70 sm:block" />

    <Button
      variant="ghost"
      size="sm"
      class="rounded-full px-3 text-xs"
      :class="{ 'bg-primary/10 text-primary': isPlaying }"
      @click="emit('toggle-play')"
    >
      <component :is="isPlaying ? Pause : Play" class="mr-1 size-4" aria-hidden="true" />
      {{ isPlaying ? $t('graph.graphStage.toolbar.pause') : $t('graph.graphStage.toolbar.play') }}
    </Button>

    <Button variant="ghost" size="sm" class="ml-auto rounded-full px-3 text-xs font-medium whitespace-nowrap" @click="emit('show-more')">
      {{ $t('graph.graphStage.toolbar.showMore') }}
    </Button>
  </div>
</template>
