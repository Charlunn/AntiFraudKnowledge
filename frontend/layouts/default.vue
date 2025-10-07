<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <Header />
    <main class="flex-1 py-10">
      <div class="container-grid">
        <slot />
      </div>
    </main>
    <Footer />
    <NotificationContainer />
    <GlobalLoading />
  </div>
</template>

<script setup>
import Header from '~/components/layout/Header.vue'
import Footer from '~/components/layout/Footer.vue'
import NotificationContainer from '~/components/ui/NotificationContainer.vue'
import GlobalLoading from '~/components/ui/GlobalLoading.vue'

// 页面元数据
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
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>

<style>
/* 全局样式已在 main.css 中定义 */
</style>