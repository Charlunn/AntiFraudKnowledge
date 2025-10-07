<script setup lang="ts">
import { DropdownMenuItem, type DropdownMenuItemEmits, type DropdownMenuItemProps } from 'radix-vue'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<DropdownMenuItemProps & { inset?: boolean; class?: string }>(), {
  inset: false
})

const emits = defineEmits<DropdownMenuItemEmits>()
</script>

<template>
  <DropdownMenuItem
    v-bind="props"
    v-on="emits"
    :class="cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', props.inset ? 'pl-8' : '', props.class)"
  >
    <slot />
  </DropdownMenuItem>
</template>
