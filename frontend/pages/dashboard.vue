<template>
  <div class="min-h-screen bg-muted/40 dark:bg-muted/40">
    <div class="container mx-auto px-4 py-8">
      <!-- 欢迎区域 -->
      <div class="bg-card dark:bg-card rounded-xl shadow-lg p-8 mb-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-primary/20 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-foreground dark:text-foreground mb-2">
            欢迎回来，{{ user?.username || '用户' }}！
          </h1>
          <p class="text-muted-foreground dark:text-muted-foreground">
            继续您的反欺诈学习之旅
          </p>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-card dark:bg-card rounded-xl shadow-lg p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-primary/20 dark:bg-primary/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground dark:text-muted-foreground">学习进度</p>
              <p class="text-2xl font-bold text-foreground dark:text-foreground">75%</p>
            </div>
          </div>
        </div>

        <div class="bg-card dark:bg-card rounded-xl shadow-lg p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-primary/20 dark:bg-success-900/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground dark:text-muted-foreground">完成测验</p>
              <p class="text-2xl font-bold text-foreground dark:text-foreground">12</p>
            </div>
          </div>
        </div>

        <div class="bg-card dark:bg-card rounded-xl shadow-lg p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-primary/20 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary dark:text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground dark:text-muted-foreground">获得成就</p>
              <p class="text-2xl font-bold text-foreground dark:text-foreground">8</p>
            </div>
          </div>
        </div>

        <div class="bg-card dark:bg-card rounded-xl shadow-lg p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground dark:text-muted-foreground">积分</p>
              <p class="text-2xl font-bold text-foreground dark:text-foreground">1,250</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="bg-card dark:bg-card rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-foreground dark:text-foreground mb-4">快速开始</h2>
          <div class="space-y-3">
            <NuxtLink to="/quiz" class="flex items-center p-4 bg-primary/10 dark:bg-primary/20 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
              <div class="w-10 h-10 bg-primary/100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="font-medium text-foreground dark:text-foreground">开始测验</h3>
                <p class="text-sm text-muted-foreground dark:text-muted-foreground">测试您的反欺诈知识</p>
              </div>
            </NuxtLink>
            
            <NuxtLink to="/graph" class="flex items-center p-4 bg-primary/10 dark:bg-success-900/20 rounded-lg hover:bg-primary/20 dark:hover:bg-success-900/30 transition-colors">
              <div class="w-10 h-10 bg-primary/100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="font-medium text-foreground dark:text-foreground">探索知识图谱</h3>
                <p class="text-sm text-muted-foreground dark:text-muted-foreground">发现知识之间的联系</p>
              </div>
            </NuxtLink>
            
            <NuxtLink to="/ai-test" class="flex items-center p-4 bg-primary/10 dark:bg-primary/20 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/30 transition-colors">
              <div class="w-10 h-10 bg-primary/100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="font-medium text-foreground dark:text-foreground">AI智能测试</h3>
                <p class="text-sm text-muted-foreground dark:text-muted-foreground">体验AI驱动的个性化评估</p>
              </div>
            </NuxtLink>
            
            <NuxtLink to="/community" class="flex items-center p-4 bg-primary/10 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <div class="w-10 h-10 bg-primary/100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="font-medium text-foreground dark:text-foreground">参与社区讨论</h3>
                <p class="text-sm text-muted-foreground dark:text-muted-foreground">与其他学习者交流</p>
              </div>
            </NuxtLink>
          </div>
        </div>

        <div class="bg-card dark:bg-card rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-foreground dark:text-foreground mb-4">最近活动</h2>
          <div class="space-y-4">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-primary/20 dark:bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-primary dark:text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-foreground dark:text-foreground">完成了"网络钓鱼识别"测验</p>
                <p class="text-xs text-muted-foreground dark:text-muted-foreground">2小时前</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-primary/20 dark:bg-success-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-primary dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-foreground dark:text-foreground">获得"初学者"成就</p>
                <p class="text-xs text-muted-foreground dark:text-muted-foreground">1天前</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-primary dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-foreground dark:text-foreground">在社区发布了第一个帖子</p>
                <p class="text-xs text-muted-foreground dark:text-muted-foreground">3天前</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习建议 -->
      <div class="bg-gradient-to-r from-primary/100 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold mb-2">继续学习</h2>
            <p class="text-primary/70 mb-4">根据您的学习进度，我们为您推荐以下内容</p>
            <NuxtLink to="/ai-test" class="inline-flex items-center px-6 py-3 bg-card text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors">
              开始AI智能测试
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
          <div class="hidden lg:block">
            <svg class="w-32 h-32 text-primary/80" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 页面布局和认证中间件
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// 安全地获取用户信息，避免SSR问题
const user = ref(null)

onMounted(async () => {
  if (process.client) {
    try {
      // 确保Pinia已初始化
      const { $pinia } = useNuxtApp()
      if ($pinia) {
        // 动态导入store以避免SSR问题
        const { useAuthStore } = await import('~/stores/auth')
        const authStore = useAuthStore()
        authStore.initialize()
        user.value = authStore.user
      }
    } catch (error) {
      console.warn('Failed to initialize auth store in dashboard:', error)
    }
  }
})

// 设置页面元数据
useHead({
  title: '仪表板 - 反欺诈知识平台',
  meta: [
    { name: 'description', content: '查看您的学习进度、成就和推荐内容' }
  ]
})
</script>