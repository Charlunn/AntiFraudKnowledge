<script setup lang="ts">
import { DropdownMenuContent, type DropdownMenuContentEmits, type DropdownMenuContentProps } from 'radix-vue'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<DropdownMenuContentProps & { class?: string }>(), {
  align: 'end',
  sideOffset: 8
})

const emits = defineEmits<DropdownMenuContentEmits>()
</script>

<template>
  <DropdownMenuContent
    v-bind="props"
    v-on="emits"
    :class="cn('z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-none', props.class)"
  >
    <slot />
  </DropdownMenuContent>
</template>
