<template>
  <div class="flex min-h-screen min-h-dvh flex-col bg-background text-foreground">
    <Header class="shrink-0" />
    <main class="flex flex-1 min-h-0 flex-col">
      <div class="flex flex-1 min-h-0 flex-col">
        <slot />
      </div>
    </main>
    <NotificationContainer />
    <GlobalLoading />
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/layout/Header.vue'
import NotificationContainer from '~/components/ui/NotificationContainer.vue'
import GlobalLoading from '~/components/ui/GlobalLoading.vue'
import { useHead } from '#imports'

useHead({
  titleTemplate: '%s - 澄源',
  meta: [
    { name: 'description', content: '澄源 - 专业的反欺诈知识学习平台，提供知识图谱、智能测验和社区交流功能' },
    { name: 'keywords', content: '澄源,反欺诈,知识图谱,在线测验,安全教育,社区交流' },
    { name: 'author', content: '澄源' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: '澄源' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ],
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
})
</script>
