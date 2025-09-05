<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-bg dark:to-dark-surface transition-colors duration-300">
    <!-- 认证页面内容 -->
    <slot />
    
    <!-- 全局通知组件 -->
    <NotificationContainer />
    
    <!-- 全局加载指示器 -->
    <GlobalLoading />
  </div>
</template>

<script setup>
import NotificationContainer from '~/components/ui/NotificationContainer.vue'
import GlobalLoading from '~/components/ui/GlobalLoading.vue'

// 页面元数据
useHead({
  titleTemplate: '%s - 澄源',
  meta: [
    { name: 'description', content: '澄源 - 专业的反欺诈知识学习平台' },
    { name: 'keywords', content: '澄源,反欺诈,登录,注册,安全教育' },
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
/* 认证页面专用样式 */
</style>