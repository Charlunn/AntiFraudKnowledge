<template>
  <div class="min-h-screen bg-background text-foreground md:grid md:grid-cols-[220px_1fr]">
    <aside class="hidden md:flex flex-col border-r border-border px-6 py-8 gap-8">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-muted-foreground">AntiFraud</p>
        <p class="text-lg font-semibold">MVP Console</p>
      </div>
      <nav class="space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition hover:border-border hover:bg-secondary"
          :class="route.path === item.to ? 'bg-secondary border-border text-foreground' : 'text-muted-foreground'"
        >
          <span>{{ item.label }}</span>
          <Icon :name="item.icon" class="h-4 w-4" />
        </NuxtLink>
      </nav>
      <div class="mt-auto text-xs text-muted-foreground">
        <p>黑白配色 / shadcn 风格</p>
        <p class="mt-1">{{ today }}</p>
      </div>
    </aside>

    <div class="flex flex-col min-h-screen">
      <header class="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <button class="text-sm font-semibold" @click="drawerOpen = !drawerOpen">
          菜单
        </button>
        <NuxtLink to="/" class="font-semibold">AntiFraud MVP</NuxtLink>
        <ThemeToggle />
      </header>
      <Transition name="fade">
        <div v-if="drawerOpen" class="md:hidden border-b border-border bg-background px-4 py-4">
          <nav class="space-y-1">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="block rounded-lg px-3 py-2 text-sm font-medium"
              :class="route.path === item.to ? 'bg-secondary text-foreground' : 'text-muted-foreground'
          "
              @click="drawerOpen = false"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>
      </Transition>
      <main class="flex-1 px-4 py-6 md:px-10">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from '~/components/layout/ThemeToggle.vue'

const route = useRoute()
const drawerOpen = ref(false)

const navItems = [
  { label: '概览', to: '/', icon: 'lucide:layout-dashboard' },
  { label: '知识测验', to: '/quiz', icon: 'lucide:badge-check' },
  { label: 'AI 场景模拟', to: '/simulation', icon: 'lucide:bot' },
  { label: '知识图谱', to: '/graph', icon: 'lucide:share-2' },
  { label: '个人主页', to: '/profile', icon: 'lucide:user-round' },
]

const today = new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
