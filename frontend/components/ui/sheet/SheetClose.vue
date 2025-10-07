<script setup lang="ts">
import { DialogClose } from 'radix-vue'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{ class?: string; asChild?: boolean }>(), {
  asChild: false
})
</script>

<template>
  <DialogClose
    v-bind="$attrs"
    :as-child="props.asChild"
    :class="props.asChild ? undefined : cn('flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', props.class)"
  >
    <slot />
  </DialogClose>
</template>
