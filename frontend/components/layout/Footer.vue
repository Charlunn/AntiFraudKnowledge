<template>
  <footer class="bg-white dark:bg-dark-surface border-t border-neutral-200 dark:border-dark-border mt-auto slideInUp">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- 品牌信息 -->
        <div class="col-span-1 md:col-span-2 fadeInLeft">
          <div class="flex items-center space-x-2 mb-4">
            <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center hover-lift">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="text-xl font-semibold text-neutral-500 dark:text-dark-text">反欺诈知识平台</span>
          </div>
          <p class="text-neutral-400 dark:text-dark-text-secondary text-sm leading-relaxed max-w-md">
            致力于提供全面的反欺诈知识教育，通过知识图谱、智能测验和社区交流，帮助用户提升反欺诈意识和能力。
          </p>
          <div class="flex space-x-4 mt-6">
            <a 
              v-for="social in socialLinks" 
              :key="social.name"
              :href="social.href"
              :title="social.name"
              class="text-neutral-400 hover:text-primary-500 dark:text-dark-text-secondary dark:hover:text-primary-400 transition-colors duration-200 hover-lift"
              target="_blank"
              rel="noopener noreferrer"
            >
              <component :is="social.icon" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- 快速链接 -->
        <div class="fadeInUp delay-100">
          <h3 class="text-sm font-semibold text-neutral-500 dark:text-dark-text uppercase tracking-wider mb-4">
            快速链接
          </h3>
          <ul class="space-y-3">
            <li v-for="link in quickLinks" :key="link.name">
              <NuxtLink 
                :to="link.href"
                class="text-neutral-400 dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors duration-200 hover-lift"
              >
                {{ link.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- 帮助支持 -->
        <div>
          <h3 class="text-sm font-semibold text-neutral-500 dark:text-dark-text uppercase tracking-wider mb-4">
            帮助支持
          </h3>
          <ul class="space-y-3">
            <li v-for="link in supportLinks" :key="link.name">
              <NuxtLink 
                :to="link.href"
                class="text-neutral-400 dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors duration-200"
              >
                {{ link.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="border-t border-neutral-200 dark:border-dark-border mt-8 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <!-- 版权信息 -->
          <div class="text-neutral-400 dark:text-dark-text-secondary text-sm">
            <p>&copy; {{ currentYear }} 反欺诈知识平台. 保留所有权利.</p>
          </div>

          <!-- 法律链接 -->
          <div class="flex space-x-6">
            <NuxtLink 
              v-for="link in legalLinks" 
              :key="link.name"
              :to="link.href"
              class="text-neutral-400 dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors duration-200"
            >
              {{ link.name }}
            </NuxtLink>
          </div>

          <!-- 语言切换 -->
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-neutral-400 dark:text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <select 
              v-model="selectedLanguage"
              @change="handleLanguageChange"
              class="bg-transparent text-neutral-400 dark:text-dark-text-secondary text-sm border-none focus:outline-none cursor-pointer"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <Transition name="fade">
      <button 
        v-if="showBackToTop"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 hover-lift"
        title="回到顶部"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </Transition>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 响应式数据
const showBackToTop = ref(false)
const selectedLanguage = ref('zh-CN')

// 计算属性
const currentYear = computed(() => new Date().getFullYear())

// 社交媒体链接
const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: 'GitHubIcon'
  },
  {
    name: '微博',
    href: 'https://weibo.com',
    icon: 'WeiboIcon'
  },
  {
    name: '微信',
    href: '#',
    icon: 'WeChatIcon'
  },
  {
    name: 'QQ',
    href: '#',
    icon: 'QQIcon'
  }
]

// 快速链接
const quickLinks = [
  { name: '知识图谱', href: '/graph' },
  { name: '反欺诈测验', href: '/quiz' },
  { name: 'AI智能测试', href: '/ai-test' },
  { name: '社区讨论', href: '/community' },
  { name: '学习资源', href: '/resources' },
  { name: '最新动态', href: '/news' }
]

// 帮助支持链接
const supportLinks = [
  { name: '使用帮助', href: '/help' },
  { name: '常见问题', href: '/faq' },
  { name: '联系我们', href: '/contact' },
  { name: '意见反馈', href: '/feedback' },
  { name: '技术支持', href: '/support' },
  { name: '开发者API', href: '/api-docs' }
]

// 法律链接
const legalLinks = [
  { name: '隐私政策', href: '/privacy' },
  { name: '服务条款', href: '/terms' },
  { name: '免责声明', href: '/disclaimer' }
]

// 方法
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const handleLanguageChange = () => {
  // TODO: 实现语言切换功能
  console.log('切换语言到:', selectedLanguage.value)
}

// 生命周期
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  // 从本地存储获取语言设置
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage) {
    selectedLanguage.value = savedLanguage
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 监听语言变化
watch(selectedLanguage, (newLang) => {
  localStorage.setItem('language', newLang)
})
</script>

<style scoped>
/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 选择框样式 */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.dark select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%9ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
}
</style>