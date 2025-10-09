<script setup lang="ts">
import Button from '~/components/ui/button.vue'

const props = defineProps<{
  updatedAt: string
}>()

const emit = defineEmits<{
  (e: 'feedback'): void
}>()
</script>

<template>
  <footer class="mt-6 rounded-3xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur">
    <div class="flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
      <Button size="sm" variant="ghost" class="rounded-full border border-border/60 px-3" @click="emit('feedback')">
        {{ $t('graph.bottomBar.feedback') }}
      </Button>
      <span class="text-muted-foreground">{{ $t('graph.bottomBar.privacy') }}</span>
      <span class="text-muted-foreground">
        {{ $t('graph.bottomBar.updatedAt') }}: {{ new Date(props.updatedAt).toLocaleString() }}
      </span>
    </div>
  </footer>
</template>
