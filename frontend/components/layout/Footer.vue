<template>
  <footer class="border-t border-border bg-background">
    <div class="container-grid py-12">
      <div class="grid gap-10 lg:grid-cols-4">
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck class="h-5 w-5" />
            </div>
            <div>
              <p class="text-lg font-semibold text-foreground">反欺诈知识平台</p>
              <p class="text-sm text-muted-foreground">让每一次点击都更安全</p>
            </div>
          </div>
          <p class="max-w-xl text-sm leading-relaxed text-muted-foreground">
            我们通过知识图谱、互动测验与社区交流，为公众提供系统化、实时化的反诈骗教育内容，帮助您更快识别风险、守护财产安全。
          </p>
          <div class="flex items-center gap-4 text-muted-foreground">
            <NuxtLink
              v-for="item in socialLinks"
              :key="item.name"
              :to="item.href"
              class="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
            >
              <component :is="item.icon" class="h-4 w-4" />
            </NuxtLink>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-foreground">平台导航</h3>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li v-for="link in quickLinks" :key="link.name">
              <NuxtLink :to="link.href" class="transition-colors hover:text-foreground">{{ link.name }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-foreground">帮助中心</h3>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li v-for="link in supportLinks" :key="link.name">
              <NuxtLink :to="link.href" class="transition-colors hover:text-foreground">{{ link.name }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <Separator class="my-10" />

      <div class="flex flex-col gap-6 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
        <p>© {{ currentYear }} 澄源 Anti-Fraud. 保留所有权利。</p>
        <div class="flex flex-wrap items-center gap-4">
          <NuxtLink v-for="link in legalLinks" :key="link.name" :to="link.href" class="transition-colors hover:text-foreground">
            {{ link.name }}
          </NuxtLink>
        </div>
        <div class="flex items-center gap-2 rounded-md border px-3 py-2">
          <Globe class="h-4 w-4" />
          <select v-model="selectedLanguage" class="bg-transparent text-sm outline-none">
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
          </select>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Github, Globe, MessageCircleMore, ShieldCheck, Sparkles, Users } from 'lucide-vue-next'

import Separator from '~/components/ui/separator.vue'

const selectedLanguage = ref('zh-CN')
const currentYear = computed(() => new Date().getFullYear())

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com', icon: Github },
  { name: '社区', href: '/community', icon: Users },
  { name: '客服', href: '/support', icon: MessageCircleMore },
  { name: '更新日志', href: '/dashboard', icon: Sparkles }
]

const quickLinks = [
  { name: '知识图谱', href: '/graph' },
  { name: '反诈测验', href: '/quiz' },
  { name: 'AI 智能测试', href: '/ai-test' },
  { name: '学习资源', href: '/resources' }
]

const supportLinks = [
  { name: '帮助中心', href: '/help' },
  { name: '常见问题', href: '/faq' },
  { name: '意见反馈', href: '/feedback' },
  { name: '联系我们', href: '/contact' }
]

const legalLinks = [
  { name: '隐私政策', href: '/privacy' },
  { name: '使用条款', href: '/terms' },
  { name: '免责声明', href: '/disclaimer' }
]
</script>
