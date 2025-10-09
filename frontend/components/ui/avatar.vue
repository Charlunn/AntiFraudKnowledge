<script setup lang="ts">
import { AvatarFallback, AvatarImage, AvatarRoot } from 'radix-vue'
import { cn } from '~/lib/utils'

const props = defineProps<{
  src?: string
  alt?: string
  fallback?: string
  class?: string
}>()
</script>

<template>
  <AvatarRoot :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted', props.class)">
    <AvatarImage v-if="props.src" :src="props.src" :alt="props.alt" class="h-full w-full object-cover" />
    <AvatarFallback class="flex h-full w-full items-center justify-center bg-muted text-sm font-medium text-muted-foreground">
      {{ props.fallback ?? 'CY' }}
    </AvatarFallback>
  </AvatarRoot>
</template>