<script setup lang="ts">
import { DialogTrigger } from 'radix-vue'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{ class?: string; asChild?: boolean }>(), {
  asChild: false
})
</script>

<template>
  <DialogTrigger
    v-bind="$attrs"
    :as-child="props.asChild"
    :class="props.asChild ? undefined : cn('', props.class)"
  >
    <slot />
  </DialogTrigger>
</template>
