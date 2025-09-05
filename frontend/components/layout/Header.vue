<template>
  <header class="bg-white dark:bg-dark-surface border-b border-neutral-200 dark:border-dark-border sticky top-0 z-50 transition-colors duration-300 slideInDown">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo和品牌 -->
        <div class="flex items-center space-x-4 fadeInLeft">
          <NuxtLink to="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity hover-lift">
            <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
            <!-- 网站名称在手机端隐藏，在更大屏幕显示 -->
            <span class="hidden sm:block text-xl font-semibold text-neutral-500 dark:text-dark-text">澄源</span>
          </NuxtLink>
        </div>

        <!-- 桌面端导航菜单 -->
        <nav class="hidden lg:flex items-center space-x-6 xl:space-x-8 fadeInUp">
          <NuxtLink 
            v-for="item in primaryNavigationItems" 
            :key="item.name"
            :to="item.href"
            class="text-neutral-400 hover:text-primary-500 dark:text-dark-text-secondary dark:hover:text-primary-400 px-2 xl:px-3 py-2 text-sm font-medium transition-colors duration-200 relative group hover-lift whitespace-nowrap"
            :class="{ 'text-primary-500 dark:text-primary-400': isActiveRoute(item.href) }"
          >
            {{ item.name }}
            <span 
              class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 dark:bg-primary-400 transition-all duration-200 group-hover:w-full"
              :class="{ 'w-full': isActiveRoute(item.href) }"
            ></span>
          </NuxtLink>
          
          <!-- 更多菜单下拉 -->
          <div v-if="secondaryNavigationItems.length > 0" class="relative more-menu-container">
            <button 
              @click="toggleMoreMenu"
              class="text-neutral-400 hover:text-primary-500 dark:text-dark-text-secondary dark:hover:text-primary-400 px-2 xl:px-3 py-2 text-sm font-medium transition-colors duration-200 relative group hover-lift flex items-center space-x-1"
            >
              <span>更多</span>
              <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': showMoreMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <Transition name="dropdown">
              <div 
                v-if="showMoreMenu"
                class="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-lg shadow-modal border border-neutral-200 dark:border-dark-border py-1 z-50"
              >
                <NuxtLink 
                  v-for="item in secondaryNavigationItems" 
                  :key="item.name"
                  :to="item.href"
                  class="block px-4 py-2 text-sm text-neutral-500 dark:text-dark-text hover:bg-neutral-50 dark:hover:bg-dark-bg transition-colors duration-200"
                  :class="{ 'text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20': isActiveRoute(item.href) }"
                  @click="showMoreMenu = false"
                >
                  {{ item.name }}
                </NuxtLink>
              </div>
            </Transition>
          </div>
        </nav>
        
        <!-- 中等屏幕导航菜单 -->
        <nav class="hidden md:flex lg:hidden items-center space-x-4 fadeInUp">
          <NuxtLink 
            v-for="item in compactNavigationItems" 
            :key="item.name"
            :to="item.href"
            class="text-neutral-400 hover:text-primary-500 dark:text-dark-text-secondary dark:hover:text-primary-400 px-2 py-2 text-sm font-medium transition-colors duration-200 relative group hover-lift whitespace-nowrap"
            :class="{ 'text-primary-500 dark:text-primary-400': isActiveRoute(item.href) }"
          >
            {{ item.name }}
            <span 
              class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 dark:bg-primary-400 transition-all duration-200 group-hover:w-full"
              :class="{ 'w-full': isActiveRoute(item.href) }"
            ></span>
          </NuxtLink>
          
          <!-- 中等屏幕更多菜单 -->
          <div class="relative more-menu-container">
            <button 
              @click="toggleMoreMenu"
              class="text-neutral-400 hover:text-primary-500 dark:text-dark-text-secondary dark:hover:text-primary-400 px-2 py-2 text-sm font-medium transition-colors duration-200 relative group hover-lift flex items-center space-x-1"
            >
              <span>更多</span>
              <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': showMoreMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <Transition name="dropdown">
              <div 
                v-if="showMoreMenu"
                class="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-lg shadow-modal border border-neutral-200 dark:border-dark-border py-1 z-50"
              >
                <NuxtLink 
                  v-for="item in compactSecondaryNavigationItems" 
                  :key="item.name"
                  :to="item.href"
                  class="block px-4 py-2 text-sm text-neutral-500 dark:text-dark-text hover:bg-neutral-50 dark:hover:bg-dark-bg transition-colors duration-200"
                  :class="{ 'text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20': isActiveRoute(item.href) }"
                  @click="showMoreMenu = false"
                >
                  {{ item.name }}
                </NuxtLink>
              </div>
            </Transition>
          </div>
        </nav>

        <!-- 右侧操作区 -->
        <div class="flex items-center space-x-2 sm:space-x-4 fadeInRight">
          <!-- 搜索按钮 - 在小屏幕隐藏 -->
          <button 
            @click="toggleSearch"
            class="hidden sm:block p-2 text-neutral-400 hover:text-primary-500 dark:text-dark-text-secondary dark:hover:text-primary-400 transition-colors duration-200 hover-lift"
            title="搜索"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- 通知按钮 - 在小屏幕隐藏，仅登录用户可见 -->
          <button 
            v-if="isAuthenticated"
            @click="toggleNotifications"
            class="hidden sm:block relative p-2 text-neutral-400 hover:text-primary-500 dark:text-dark-text-secondary dark:hover:text-primary-400 transition-colors duration-200"
            title="通知"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25a2.25 2.25 0 0 0 2.25 2.25H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h2.25A2.25 2.25 0 0 0 7.5 12V9.75a6 6 0 0 1 6-6Z" />
            </svg>
            <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <!-- 深色模式切换 - 在小屏幕隐藏 -->
          <button 
            @click="toggleDarkMode"
            class="hidden sm:block p-2 text-neutral-400 hover:text-primary-500 dark:text-dark-text-secondary dark:hover:text-primary-400 transition-colors duration-200"
            title="切换主题"
          >
            <svg v-if="!isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>

          <!-- 用户菜单 -->
          <div class="relative" ref="userMenuRef" v-if="isAuthenticated">
            <button 
              @click="toggleUserMenu"
              class="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-surface transition-colors duration-200"
            >
              <img 
                :src="user?.avatar || '/default-avatar.svg'"
                :alt="user?.name || '用户头像'"
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
              >
              <span class="hidden md:block text-sm font-medium text-neutral-500 dark:text-dark-text">{{ user?.name || user?.username || '用户' }}</span>
              <svg class="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400 dark:text-dark-text-secondary transition-transform duration-200" :class="{ 'rotate-180': showUserMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- 用户下拉菜单 -->
            <Transition name="dropdown">
              <div 
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-lg shadow-modal border border-neutral-200 dark:border-dark-border py-1 z-50"
              >
                <NuxtLink 
                  v-for="item in userMenuItems" 
                  :key="item.name"
                  :to="item.href"
                  class="flex items-center px-4 py-2 text-sm text-neutral-500 dark:text-dark-text hover:bg-neutral-50 dark:hover:bg-dark-bg transition-colors duration-200"
                  @click="handleUserMenuClick(item.href)"
                >
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="item.icon === 'heroicons:user'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    <path v-else-if="item.icon === 'heroicons:trophy'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    <path v-else-if="item.icon === 'heroicons:cog-6-tooth'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                  {{ item.name }}
                </NuxtLink>
                <hr class="my-1 border-neutral-200 dark:border-dark-border">
                <button 
                  @click="handleLogout"
                  class="flex items-center w-full px-4 py-2 text-sm text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors duration-200"
                >
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  退出登录
                </button>
              </div>
            </Transition>
          </div>

          <!-- 未认证状态下的登录按钮 -->
          <div v-else class="flex items-center space-x-1 sm:space-x-2">
            <NuxtLink 
              to="/login"
              class="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
            >
              登录
            </NuxtLink>
            <NuxtLink 
              to="/register"
              class="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
            >
              注册
            </NuxtLink>
          </div>

          <!-- 移动端菜单按钮 -->
          <button 
            @click="toggleMobileMenu"
            class="md:hidden p-2 text-neutral-400 hover:text-primary-500 dark:text-dark-text-secondary dark:hover:text-primary-400 transition-colors duration-200"
          >
            <svg v-if="!showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <Transition name="mobile-menu">
      <div v-if="showMobileMenu" class="md:hidden bg-white dark:bg-dark-surface border-t border-neutral-200 dark:border-dark-border">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <NuxtLink 
            v-for="item in navigationItems" 
            :key="item.name"
            :to="item.href"
            class="block px-3 py-2 text-base font-medium text-neutral-500 dark:text-dark-text hover:text-primary-500 dark:hover:text-primary-400 hover:bg-neutral-50 dark:hover:bg-dark-bg rounded-md transition-colors duration-200"
            :class="{ 'text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20': isActiveRoute(item.href) }"
            @click="showMobileMenu = false"
          >
            {{ item.name }}
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 响应式数据
const route = useRoute()
const router = useRouter()
const showMobileMenu = ref(false)
const showUserMenu = ref(false)
const showMoreMenu = ref(false)
const showSearch = ref(false)
const showNotifications = ref(false)
const isDark = ref(false)
const userMenuRef = ref(null)

// 认证状态 - 客户端安全初始化
const user = ref(null)
const isAuthenticated = ref(false)
const authLogout = ref(null)

// 在客户端初始化认证状态和主题
onMounted(async () => {
  if (process.client) {
    // 动态导入useAuth以避免SSR问题
    const { useAuth } = await import('~/composables/useAuth')
    const auth = useAuth()
    user.value = auth.user.value
    isAuthenticated.value = auth.isAuthenticated.value
    authLogout.value = auth.logout
    
    // 监听认证状态变化
    watch(() => auth.user.value, (newUser) => {
      user.value = newUser
    })
    
    watch(() => auth.isAuthenticated.value, (newAuth) => {
      isAuthenticated.value = newAuth
    })
  }
  
  // 初始化主题
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedTheme = window.localStorage.getItem('theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      isDark.value = true
      document.documentElement.classList.add('dark')
    }
  }
  
  // 添加点击外部事件监听
  document.addEventListener('click', handleClickOutside)
})

// 未读通知数量
const unreadCount = ref(3)

// 导航菜单项
const navigationItems = [
  { name: '首页', href: '/' },
  { name: '仪表盘', href: '/dashboard' },
  { name: '知识图谱', href: '/graph' },
  { name: '反欺诈测验', href: '/quiz' },
  { name: 'AI测试', href: '/ai-test' },
  { name: '社区', href: '/community' },
  { name: '学习资源', href: '/resources' },
  { name: '举报中心', href: '/report' },
]

// 大屏幕主要菜单项（显示在导航栏中）
const primaryNavigationItems = computed(() => [
  { name: '首页', href: '/' },
  { name: '仪表盘', href: '/dashboard' },
  { name: '知识图谱', href: '/graph' },
  { name: '反欺诈测验', href: '/quiz' },
  { name: 'AI测试', href: '/ai-test' }
])

// 大屏幕次要菜单项（显示在更多下拉菜单中）
const secondaryNavigationItems = computed(() => [
  { name: '社区', href: '/community' },
  { name: '学习资源', href: '/resources' },
  { name: '举报中心', href: '/report' }
])

// 中等屏幕紧凑菜单项（显示在导航栏中）
const compactNavigationItems = computed(() => [
  { name: '首页', href: '/' },
  { name: '仪表盘', href: '/dashboard' },
  { name: '知识图谱', href: '/graph' }
])

// 中等屏幕次要菜单项（显示在更多下拉菜单中）
const compactSecondaryNavigationItems = computed(() => [
  { name: '测验', href: '/quiz' },
  { name: 'AI测试', href: '/ai-test' },
  { name: '社区', href: '/community' },
  { name: '学习资源', href: '/resources' },
  { name: '举报中心', href: '/report' }
])

// 用户菜单项
const userMenuItems = [
  { name: '个人中心', href: '/profile', icon: 'heroicons:user' },
  { name: '我的成就', href: '/achievements', icon: 'heroicons:trophy' },
  { name: '设置', href: '/settings', icon: 'heroicons:cog-6-tooth' },
]

// 计算属性
const isActiveRoute = (href) => {
  if (href === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(href)
}

// 方法
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  // 关闭其他菜单
  showMoreMenu.value = false
}

const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value
  // 关闭其他菜单
  showUserMenu.value = false
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    // 跳转到搜索页面或打开搜索模态框
    router.push('/search')
  }
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    // 跳转到通知页面
    router.push('/notifications')
  }
}

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('theme', 'dark')
    }
  } else {
    document.documentElement.classList.remove('dark')
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('theme', 'light')
    }
  }
}

const handleUserMenuClick = async (href) => {
  showUserMenu.value = false
  // 确保导航正常执行
  await router.push(href)
}

const handleLogout = async () => {
  try {
    if (authLogout.value) {
      await authLogout.value()
    }
    // logout函数内部已经处理了重定向，这里不需要再次重定向
  } catch (error) {
    console.error('登出失败:', error)
    // 即使登出失败，也清除本地状态并重定向
    await router.push('/login')
  }
  showUserMenu.value = false
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
  // 检查更多菜单
  const moreMenuElements = document.querySelectorAll('.more-menu-container')
  let clickedInsideMoreMenu = false
  moreMenuElements.forEach(element => {
    if (element.contains(event.target)) {
      clickedInsideMoreMenu = true
    }
  })
  if (!clickedInsideMoreMenu) {
    showMoreMenu.value = false
  }
}



onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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

/* 移动端菜单动画 */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>