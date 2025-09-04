<template>
  <aside 
    class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-surface border-r border-neutral-200 dark:border-dark-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 slideInLeft"
    :class="{
      'translate-x-0': isOpen,
      '-translate-x-full': !isOpen
    }"
  >
    <!-- 侧边栏头部 -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-neutral-200 dark:border-dark-border fadeInDown">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center hover-lift">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
        <span class="text-lg font-semibold text-neutral-500 dark:text-dark-text">管理后台</span>
      </div>
      <button 
        @click="$emit('close')"
        class="lg:hidden p-2 text-neutral-400 hover:text-neutral-500 dark:text-dark-text-secondary dark:hover:text-dark-text transition-colors duration-200"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 导航菜单 -->
    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto fadeInUp">
      <!-- 主要功能 -->
      <div class="mb-6">
        <h3 class="px-3 text-xs font-semibold text-neutral-400 dark:text-dark-text-secondary uppercase tracking-wider mb-3 fadeInLeft">
          主要功能
        </h3>
        <ul class="space-y-1">
          <li v-for="item in mainMenuItems" :key="item.name">
            <NuxtLink 
              :to="item.href"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover-lift"
              :class="{
                'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': isActiveRoute(item.href),
                'text-neutral-500 dark:text-dark-text hover:bg-neutral-50 dark:hover:bg-dark-bg hover:text-primary-600 dark:hover:text-primary-400': !isActiveRoute(item.href)
              }"
              @click="handleMenuClick"
            >
              <component 
                :is="item.icon" 
                class="mr-3 h-5 w-5 transition-colors duration-200"
                :class="{
                  'text-primary-500 dark:text-primary-400': isActiveRoute(item.href),
                  'text-neutral-400 dark:text-dark-text-secondary group-hover:text-primary-500 dark:group-hover:text-primary-400': !isActiveRoute(item.href)
                }"
              />
              {{ item.name }}
              <span 
                v-if="item.badge"
                class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="item.badgeClass"
              >
                {{ item.badge }}
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- 管理功能 -->
      <div class="mb-6">
        <h3 class="px-3 text-xs font-semibold text-neutral-400 dark:text-dark-text-secondary uppercase tracking-wider mb-3">
          管理功能
        </h3>
        <ul class="space-y-1">
          <li v-for="item in adminMenuItems" :key="item.name">
            <NuxtLink 
              :to="item.href"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              :class="{
                'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': isActiveRoute(item.href),
                'text-neutral-500 dark:text-dark-text hover:bg-neutral-50 dark:hover:bg-dark-bg hover:text-primary-600 dark:hover:text-primary-400': !isActiveRoute(item.href)
              }"
              @click="handleMenuClick"
            >
              <component 
                :is="item.icon" 
                class="mr-3 h-5 w-5 transition-colors duration-200"
                :class="{
                  'text-primary-500 dark:text-primary-400': isActiveRoute(item.href),
                  'text-neutral-400 dark:text-dark-text-secondary group-hover:text-primary-500 dark:group-hover:text-primary-400': !isActiveRoute(item.href)
                }"
              />
              {{ item.name }}
              <span 
                v-if="item.badge"
                class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="item.badgeClass"
              >
                {{ item.badge }}
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- 系统设置 -->
      <div>
        <h3 class="px-3 text-xs font-semibold text-neutral-400 dark:text-dark-text-secondary uppercase tracking-wider mb-3">
          系统设置
        </h3>
        <ul class="space-y-1">
          <li v-for="item in systemMenuItems" :key="item.name">
            <NuxtLink 
              :to="item.href"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              :class="{
                'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': isActiveRoute(item.href),
                'text-neutral-500 dark:text-dark-text hover:bg-neutral-50 dark:hover:bg-dark-bg hover:text-primary-600 dark:hover:text-primary-400': !isActiveRoute(item.href)
              }"
              @click="handleMenuClick"
            >
              <component 
                :is="item.icon" 
                class="mr-3 h-5 w-5 transition-colors duration-200"
                :class="{
                  'text-primary-500 dark:text-primary-400': isActiveRoute(item.href),
                  'text-neutral-400 dark:text-dark-text-secondary group-hover:text-primary-500 dark:group-hover:text-primary-400': !isActiveRoute(item.href)
                }"
              />
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- 侧边栏底部 -->
    <div class="p-4 border-t border-neutral-200 dark:border-dark-border">
      <!-- 用户信息 -->
      <div class="flex items-center space-x-3 mb-4">
        <img 
          :src="user?.avatar || '/default-avatar.png'"
          :alt="user?.name || '用户头像'"
          class="w-10 h-10 rounded-full object-cover"
        >
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-neutral-500 dark:text-dark-text truncate">
            {{ user?.name || '管理员' }}
          </p>
          <p class="text-xs text-neutral-400 dark:text-dark-text-secondary truncate">
            {{ user?.role || '系统管理员' }}
          </p>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="flex space-x-2">
        <button 
          @click="toggleTheme"
          class="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-neutral-500 dark:text-dark-text bg-neutral-100 dark:bg-dark-bg hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
          :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
        >
          <svg v-if="!isDark" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg v-else class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {{ isDark ? '浅色' : '深色' }}
        </button>
        <button 
          @click="handleLogout"
          class="flex items-center justify-center px-3 py-2 text-xs font-medium text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors duration-200"
          title="退出登录"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </aside>

  <!-- 遮罩层 -->
  <Transition name="overlay">
    <div 
      v-if="isOpen && !isDesktop"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="$emit('close')"
    ></div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close'])

// 响应式数据
const route = useRoute()
const router = useRouter()
const isDark = ref(false)
const isDesktop = ref(false)

// 模拟用户数据
const user = ref({
  name: '管理员',
  avatar: '/default-avatar.png',
  role: '系统管理员'
})

// 主要功能菜单
const mainMenuItems = [
  {
    name: '仪表板',
    href: '/admin',
    icon: 'HomeIcon'
  },
  {
    name: '知识图谱',
    href: '/admin/graph',
    icon: 'ShareIcon'
  },
  {
    name: '测验管理',
    href: '/admin/quiz',
    icon: 'AcademicCapIcon',
    badge: '12',
    badgeClass: 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
  },
  {
    name: '社区管理',
    href: '/admin/community',
    icon: 'ChatIcon',
    badge: '3',
    badgeClass: 'bg-warning-100 text-warning-600 dark:bg-warning-900/20 dark:text-warning-400'
  },
  {
    name: '统计分析',
    href: '/admin/analytics',
    icon: 'ChartBarIcon'
  }
]

// 管理功能菜单
const adminMenuItems = [
  {
    name: '用户管理',
    href: '/admin/users',
    icon: 'UsersIcon'
  },
  {
    name: '内容管理',
    href: '/admin/content',
    icon: 'DocumentTextIcon'
  },
  {
    name: '反馈管理',
    href: '/admin/feedback',
    icon: 'ChatAltIcon',
    badge: '5',
    badgeClass: 'bg-error-100 text-error-600 dark:bg-error-900/20 dark:text-error-400'
  },
  {
    name: '日志管理',
    href: '/admin/logs',
    icon: 'ClipboardListIcon'
  }
]

// 系统设置菜单
const systemMenuItems = [
  {
    name: '系统设置',
    href: '/admin/settings',
    icon: 'CogIcon'
  },
  {
    name: '权限管理',
    href: '/admin/permissions',
    icon: 'ShieldCheckIcon'
  },
  {
    name: '备份恢复',
    href: '/admin/backup',
    icon: 'DatabaseIcon'
  }
]

// 计算属性
const isActiveRoute = (href) => {
  return route.path === href || (href !== '/admin' && route.path.startsWith(href))
}

// 方法
const handleMenuClick = () => {
  if (!isDesktop.value) {
    emit('close')
  }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    window.localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    window.localStorage.setItem('theme', 'light')
  }
}

const handleLogout = async () => {
  try {
    await logout()
    await router.push('/login')
  } catch (error) {
    console.error('登出失败:', error)
  }
}

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024
}

// 生命周期
onMounted(() => {
  // 初始化主题
  const savedTheme = window.localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
  
  // 初始化响应式
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 遮罩层动画 */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* 自定义滚动条 */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: theme('colors.neutral.300');
  border-radius: 2px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: theme('colors.neutral.400');
}

.dark nav::-webkit-scrollbar-thumb {
  background: theme('colors.neutral.600');
}

.dark nav::-webkit-scrollbar-thumb:hover {
  background: theme('colors.neutral.500');
}
</style>