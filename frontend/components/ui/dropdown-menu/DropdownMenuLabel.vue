<script setup lang="ts">
import { DropdownMenuLabel, type DropdownMenuLabelProps } from 'radix-vue'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<DropdownMenuLabelProps & { inset?: boolean; class?: string }>(), {
  inset: false
})
</script>

<template>
  <DropdownMenuLabel :class="cn('px-2 py-1.5 text-sm font-semibold text-muted-foreground', props.inset ? 'pl-8' : '', props.class)">
    <slot />
  </DropdownMenuLabel>
</template>