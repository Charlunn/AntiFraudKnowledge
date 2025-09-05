<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-dark-bg transition-colors duration-300">
    <!-- 侧边栏 -->
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />
    
    <!-- 主要内容区域 -->
    <div class="lg:pl-64">
      <!-- 顶部导航栏 -->
      <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <!-- 移动端菜单按钮 -->
        <button 
          @click="sidebarOpen = true"
          class="-m-2.5 p-2.5 text-neutral-500 dark:text-dark-text lg:hidden"
        >
          <span class="sr-only">打开侧边栏</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        
        <!-- 分隔线 -->
        <div class="h-6 w-px bg-neutral-200 dark:bg-dark-border lg:hidden" />
        
        <!-- 面包屑导航 -->
        <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div class="flex items-center gap-x-2">
            <nav class="flex" aria-label="面包屑">
              <ol class="flex items-center space-x-2">
                <li v-for="(item, index) in breadcrumbs" :key="item.name" class="flex items-center">
                  <NuxtLink 
                    v-if="item.href && index < breadcrumbs.length - 1"
                    :to="item.href"
                    class="text-sm font-medium text-neutral-400 dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    {{ item.name }}
                  </NuxtLink>
                  <span 
                    v-else
                    class="text-sm font-medium text-neutral-500 dark:text-dark-text"
                  >
                    {{ item.name }}
                  </span>
                  <svg 
                    v-if="index < breadcrumbs.length - 1"
                    class="ml-2 h-4 w-4 text-neutral-300 dark:text-dark-text-secondary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </li>
              </ol>
            </nav>
          </div>
          
          <!-- 右侧操作区 -->
          <div class="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
            <!-- 搜索 -->
            <div class="relative hidden sm:block">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg class="h-4 w-4 text-neutral-400 dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input 
                v-model="searchQuery"
                type="search"
                placeholder="搜索..."
                class="block w-full rounded-md border-0 bg-white dark:bg-dark-surface py-1.5 pl-10 pr-3 text-neutral-500 dark:text-dark-text ring-1 ring-inset ring-neutral-300 dark:ring-dark-border placeholder:text-neutral-400 dark:placeholder:text-dark-text-secondary focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm sm:leading-6"
                @keyup.enter="handleSearch"
              >
            </div>
            
            <!-- 通知 -->
            <button 
              @click="toggleNotifications"
              class="relative -m-2.5 p-2.5 text-neutral-400 dark:text-dark-text-secondary hover:text-neutral-500 dark:hover:text-dark-text transition-colors duration-200"
            >
              <span class="sr-only">查看通知</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span v-if="notificationCount > 0" class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-error-500 text-xs text-white flex items-center justify-center animate-pulse">
                {{ notificationCount > 9 ? '9+' : notificationCount }}
              </span>
            </button>
            
            <!-- 用户菜单 -->
            <div class="relative" ref="userMenuRef">
              <button 
                @click="toggleUserMenu"
                class="-m-1.5 flex items-center p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-bg rounded-lg transition-colors duration-200"
              >
                <span class="sr-only">打开用户菜单</span>
                <img 
                  class="h-8 w-8 rounded-full bg-neutral-50 dark:bg-dark-surface object-cover"
                  :src="currentUser?.avatar || '/default-avatar.svg'"
                  :alt="currentUser?.name || '用户头像'"
                >
                <span class="hidden lg:flex lg:items-center ml-2">
                  <span class="text-sm font-semibold leading-6 text-neutral-500 dark:text-dark-text">{{ currentUser?.name || '管理员' }}</span>
                  <svg class="ml-2 h-4 w-4 text-neutral-400 dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>
              
              <!-- 用户下拉菜单 -->
              <Transition name="dropdown">
                <div 
                  v-if="showUserMenu"
                  class="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white dark:bg-dark-surface py-2 shadow-lg ring-1 ring-neutral-900/5 dark:ring-white/10 focus:outline-none"
                >
                  <NuxtLink 
                    v-for="item in userMenuItems" 
                    :key="item.name"
                    :to="item.href"
                    class="block px-3 py-1 text-sm leading-6 text-neutral-500 dark:text-dark-text hover:bg-neutral-50 dark:hover:bg-dark-bg transition-colors duration-200"
                    @click="showUserMenu = false"
                  >
                    {{ item.name }}
                  </NuxtLink>
                  <hr class="my-1 border-neutral-200 dark:border-dark-border">
                  <button 
                    @click="handleLogout"
                    class="block w-full text-left px-3 py-1 text-sm leading-6 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors duration-200"
                  >
                    退出登录
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 页面内容 -->
      <main class="py-8">
        <div class="px-4 sm:px-6 lg:px-8">
          <slot />
        </div>
      </main>
    </div>
    
    <!-- 全局通知组件 -->
    <NotificationContainer />
    
    <!-- 全局加载指示器 -->
    <GlobalLoading />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '~/components/layout/Sidebar.vue'
import NotificationContainer from '~/components/ui/NotificationContainer.vue'
import GlobalLoading from '~/components/ui/GlobalLoading.vue'

// 响应式数据
const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(false)
const showUserMenu = ref(false)
const searchQuery = ref('')
const notificationCount = ref(5)
const userMenuRef = ref(null)

// 当前用户信息
const currentUser = ref({
  name: '系统管理员',
  avatar: '/default-avatar.svg',
  role: 'admin'
})

// 用户菜单项
const userMenuItems = [
  { name: '个人资料', href: '/admin/profile' },
  { name: '账户设置', href: '/admin/account' },
  { name: '返回前台', href: '/' }
]

// 面包屑导航
const breadcrumbs = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  const crumbs = []
  
  // 添加首页
  crumbs.push({ name: '管理后台', href: '/admin' })
  
  // 根据路径生成面包屑
  let currentPath = ''
  for (let i = 1; i < pathSegments.length; i++) {
    currentPath += '/' + pathSegments[i]
    const segment = pathSegments[i]
    
    // 路径名称映射
    const nameMap = {
      'users': '用户管理',
      'content': '内容管理',
      'quiz': '测验管理',
      'community': '社区管理',
      'analytics': '统计分析',
      'feedback': '反馈管理',
      'logs': '日志管理',
      'settings': '系统设置',
      'permissions': '权限管理',
      'backup': '备份恢复',
      'graph': '知识图谱'
    }
    
    crumbs.push({
      name: nameMap[segment] || segment,
      href: i === pathSegments.length - 1 ? null : '/admin' + currentPath
    })
  }
  
  return crumbs
})

// 方法
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const toggleNotifications = () => {
  // TODO: 实现通知功能
  console.log('切换通知面板')
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // TODO: 实现搜索功能
    console.log('搜索:', searchQuery.value)
  }
}

const handleLogout = async () => {
  try {
    await logout()
    await router.push('/login')
  } catch (error) {
    console.error('登出失败:', error)
  }
  showUserMenu.value = false
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 页面元数据
useHead({
  titleTemplate: '%s - 管理后台',
  meta: [
    { name: 'description', content: '反欺诈知识平台管理后台' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
/* 下拉菜单动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>