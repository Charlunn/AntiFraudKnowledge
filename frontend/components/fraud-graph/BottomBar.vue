<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '~/components/ui/button.vue'

const props = defineProps<{
  updatedAt: string
}>()

const emit = defineEmits<{
  (e: 'feedback'): void
}>()

const { locale } = useI18n()

const formattedUpdatedAt = computed(() => {
  const date = new Date(props.updatedAt)
  if (Number.isNaN(date.getTime())) {
    return props.updatedAt
  }

  const currentLocale = locale.value || 'zh-CN'
  const localeTimeZoneMap: Record<string, string> = {
    zh: 'Asia/Shanghai',
    'zh-CN': 'Asia/Shanghai',
    'zh-TW': 'Asia/Taipei',
    'zh-HK': 'Asia/Hong_Kong',
    en: 'UTC',
    'en-US': 'UTC'
  }

  const formatter = new Intl.DateTimeFormat(currentLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: localeTimeZoneMap[currentLocale] || 'UTC'
  })

  return formatter.format(date).replace(/\//g, '-')
})
</script>

<template>
  <footer class="mt-6 rounded-3xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur">
    <div class="flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
      <Button size="sm" variant="ghost" class="rounded-full border border-border/60 px-3" @click="emit('feedback')">
        {{ $t('graph.bottomBar.feedback') }}
      </Button>
      <span class="text-muted-foreground">{{ $t('graph.bottomBar.privacy') }}</span>
      <span class="text-muted-foreground">
        {{ $t('graph.bottomBar.updatedAt') }}: {{ formattedUpdatedAt }}
      </span>
    </div>
  </footer>
</template>
