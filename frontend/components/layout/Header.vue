<template>
  <header class="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
    <div class="container-grid flex h-16 items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="flex items-center gap-2 text-foreground transition-colors hover:text-primary">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck class="h-5 w-5" />
          </div>
          <span class="hidden text-lg font-semibold sm:inline">澄源</span>
        </NuxtLink>

        <nav class="hidden items-center gap-1 lg:flex">
          <NuxtLink
            v-for="item in primaryNavigationItems"
            :key="item.href"
            :to="item.href"
            class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            :class="{ 'bg-muted text-foreground': isActive(item.href) }"
          >
            {{ item.name }}
          </NuxtLink>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" class="hidden items-center gap-1 text-sm font-medium text-muted-foreground lg:inline-flex">
                更多
                <ChevronDown class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56">
              <DropdownMenuLabel>更多功能</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem v-for="item in secondaryNavigationItems" :key="item.href" @select="navigate(item.href)">
                {{ item.name }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>

      <div class="flex flex-1 items-center justify-end gap-2">
        <Button variant="ghost" size="icon" class="hidden md:inline-flex" @click="navigate('/search')">
          <Search class="h-5 w-5" />
          <span class="sr-only">搜索</span>
        </Button>

        <Button
          v-if="isAuthenticated"
          variant="ghost"
          size="icon"
          class="relative hidden md:inline-flex"
          @click="navigate('/notifications')"
        >
          <Bell class="h-5 w-5" />
          <span v-if="unreadCount > 0" class="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
          <span class="sr-only">通知</span>
        </Button>

        <Button variant="ghost" size="icon" class="hidden md:inline-flex" @click="toggleDarkMode">
          <Sun v-if="!isDark" class="h-5 w-5" />
          <MoonStar v-else class="h-5 w-5" />
          <span class="sr-only">切换主题</span>
        </Button>

        <DropdownMenu v-if="isAuthenticated">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="flex items-center gap-2">
              <Avatar :src="user?.avatar" :fallback="userInitials" class="h-9 w-9" />
              <span class="hidden text-sm font-medium text-foreground md:inline">
                {{ user?.name || user?.username || '用户' }}
              </span>
              <ChevronDown class="hidden h-4 w-4 md:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-60">
            <DropdownMenuLabel class="flex flex-col gap-1">
              <span class="text-sm font-semibold text-foreground">{{ user?.name || user?.username || '用户' }}</span>
              <span class="text-xs text-muted-foreground">欢迎回来，保持学习节奏！</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem v-for="item in userMenuItems" :key="item.href" class="flex items-center gap-2" @select="navigate(item.href)">
              <component :is="item.icon" class="h-4 w-4 text-muted-foreground" />
              <span>{{ item.name }}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="flex items-center gap-2 text-destructive focus:text-destructive" @select="handleLogout">
              <LogOut class="h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div v-else class="hidden items-center gap-2 md:flex">
          <Button variant="ghost" @click="navigate('/login')">登录</Button>
          <Button @click="navigate('/register')">注册</Button>
        </div>

        <Sheet v-model:open="mobileMenuOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="lg:hidden">
              <Menu class="h-5 w-5" />
              <span class="sr-only">打开菜单</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-full max-w-xs">
            <SheetHeader class="space-y-2">
              <SheetTitle class="flex items-center gap-2 text-lg font-semibold">
                <ShieldCheck class="h-5 w-5 text-primary" />
                澄源导航
              </SheetTitle>
              <SheetDescription>探索平台的全部反诈功能</SheetDescription>
            </SheetHeader>
            <div class="mt-6 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <h3 class="text-xs font-semibold uppercase text-muted-foreground">主要功能</h3>
                <Button
                  v-for="item in allNavigationItems"
                  :key="item.href"
                  variant="ghost"
                  class="justify-start"
                  :class="{ 'bg-muted text-foreground': isActive(item.href) }"
                  @click="handleMobileNavigate(item.href)"
                >
                  {{ item.name }}
                </Button>
              </div>
              <Separator />
              <div v-if="!isAuthenticated" class="flex flex-col gap-2">
                <Button variant="secondary" @click="handleMobileNavigate('/login')">登录</Button>
                <Button @click="handleMobileNavigate('/register')">注册</Button>
              </div>
              <div v-else class="space-y-4">
                <div class="flex items-center gap-3">
                  <Avatar :src="user?.avatar" :fallback="userInitials" class="h-12 w-12" />
                  <div>
                    <p class="text-sm font-semibold text-foreground">{{ user?.name || user?.username }}</p>
                    <p class="text-xs text-muted-foreground">继续保持警惕</p>
                  </div>
                </div>
                <div class="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <Bell class="h-4 w-4" />
                    未读通知
                  </div>
                  <Badge v-if="unreadCount > 0" variant="secondary">{{ unreadCount }}</Badge>
                </div>
                <div class="grid gap-2">
                  <Button
                    v-for="item in userMenuItems"
                    :key="item.href"
                    variant="ghost"
                    class="justify-start"
                    @click="handleMobileNavigate(item.href)"
                  >
                    <component :is="item.icon" class="mr-2 h-4 w-4" />
                    {{ item.name }}
                  </Button>
                  <Button variant="destructive" class="justify-start" @click="handleLogout">退出登录</Button>
                </div>
              </div>
            </div>
            <SheetFooter class="mt-8">
              <div class="flex w-full items-center justify-between rounded-md border px-3 py-2">
                <span class="text-sm text-muted-foreground">暗色模式</span>
                <Switch :checked="isDark" @update:checked="toggleDarkMode" />
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, ChevronDown, LogOut, Menu, MoonStar, Search, ShieldCheck, Sun, UserCircle2, Award, Settings } from 'lucide-vue-next'

import Avatar from '~/components/ui/avatar.vue'
import Badge from '~/components/ui/badge.vue'
import Button from '~/components/ui/button.vue'
import DropdownMenu from '~/components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuContent from '~/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '~/components/ui/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuLabel from '~/components/ui/dropdown-menu/DropdownMenuLabel.vue'
import DropdownMenuSeparator from '~/components/ui/dropdown-menu/DropdownMenuSeparator.vue'
import DropdownMenuTrigger from '~/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import Sheet from '~/components/ui/sheet/Sheet.vue'
import SheetContent from '~/components/ui/sheet/SheetContent.vue'
import SheetDescription from '~/components/ui/sheet/SheetDescription.vue'
import SheetFooter from '~/components/ui/sheet/SheetFooter.vue'
import SheetHeader from '~/components/ui/sheet/SheetHeader.vue'
import SheetTitle from '~/components/ui/sheet/SheetTitle.vue'
import SheetTrigger from '~/components/ui/sheet/SheetTrigger.vue'
import Switch from '~/components/ui/switch.vue'
import Separator from '~/components/ui/separator.vue'

import { dashboardApi } from '~/services/api.js'

const route = useRoute()
const router = useRouter()

const isAuthenticated = ref(false)
const user = ref<Record<string, any> | null>(null)
const unreadCount = ref(0)
const isDark = ref(false)
const mobileMenuOpen = ref(false)
let authLogout: (() => Promise<void>) | null = null

const primaryNavigationItems = computed(() => [
  { name: '首页', href: '/' },
  { name: '仪表盘', href: '/dashboard' },
  { name: '知识图谱', href: '/graph' },
  { name: '反欺诈测验', href: '/quiz' },
  { name: 'AI测试', href: '/ai-test' }
])

const secondaryNavigationItems = computed(() => [
  { name: '社区', href: '/community' },
  { name: '学习资源', href: '/resources' },
  { name: '举报中心', href: '/report' }
])

const allNavigationItems = computed(() => [...primaryNavigationItems.value, ...secondaryNavigationItems.value])

const userMenuItems = [
  { name: '个人中心', href: '/profile', icon: UserCircle2 },
  { name: '我的成就', href: '/achievements', icon: Award },
  { name: '设置', href: '/settings', icon: Settings }
]

const userInitials = computed(() => {
  const name = user.value?.name || user.value?.username
  if (!name) return 'CY'
  return name
    .split('')
    .slice(0, 2)
    .join('')
})

const isActive = (href: string) => {
  if (href === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(href)
}

const navigate = async (href: string) => {
  await router.push(href)
}

const handleMobileNavigate = async (href: string) => {
  mobileMenuOpen.value = false
  await navigate(href)
}

const toggleDarkMode = (value?: boolean) => {
  const target = typeof value === 'boolean' ? value : !isDark.value
  isDark.value = target
  if (target) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const handleLogout = async () => {
  if (authLogout) {
    await authLogout().catch(() => {})
  }
  await router.push('/login')
}

const fetchUnreadCount = async () => {
  try {
    const response = await dashboardApi.getNotificationCount()
    unreadCount.value = response.unread_count || 0
  } catch (error) {
    console.error('获取通知数量失败:', error)
    unreadCount.value = 0
  }
}

onMounted(async () => {
  if (process.client) {
    const { useAuth } = await import('~/composables/useAuth')
    const auth = useAuth()
    user.value = auth.user.value
    isAuthenticated.value = auth.isAuthenticated.value
    authLogout = auth.logout

    if (auth.isAuthenticated.value) {
      fetchUnreadCount()
    }

    watch(
      () => auth.user.value,
      (value) => {
        user.value = value
        if (value) {
          fetchUnreadCount()
        }
      }
    )

    watch(
      () => auth.isAuthenticated.value,
      (value) => {
        isAuthenticated.value = value
        if (value) {
          fetchUnreadCount()
        } else {
          unreadCount.value = 0
        }
      }
    )
  }

  const storedTheme = localStorage.getItem('theme')
  if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    toggleDarkMode(true)
  }
})
</script>
