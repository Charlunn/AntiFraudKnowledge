<template>
  <div class="space-y-24">
    <section class="relative overflow-hidden">
      <div class="container-grid grid gap-12 py-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div class="space-y-8">
          <Badge class="bg-primary/10 text-primary">全新 shadcn / vue 体验</Badge>
          <h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            识别骗局，从澄源开始
          </h1>
          <p class="max-w-2xl text-lg text-muted-foreground">
            借助知识图谱、互动测验与社区经验，构建立体化的反诈防线。澄源通过结构化的学习路径与实时诈骗情报，帮助每个人看穿骗局、快速决策。
          </p>
          <div class="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" class="w-full sm:w-auto" @click="navigate('/quiz')">开始测验</Button>
            <Button size="lg" variant="outline" class="w-full sm:w-auto" @click="navigate('/graph')">
              探索知识图谱
            </Button>
          </div>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="rounded-lg border border-border bg-card p-4 shadow-sm">
              <p class="text-2xl font-semibold text-foreground">{{ stats.totalUsers.toLocaleString() }}+</p>
              <p class="text-sm text-muted-foreground">学习用户</p>
            </div>
            <div class="rounded-lg border border-border bg-card p-4 shadow-sm">
              <p class="text-2xl font-semibold text-foreground">{{ stats.totalQuestions.toLocaleString() }}+</p>
              <p class="text-sm text-muted-foreground">测验题库</p>
            </div>
            <div class="rounded-lg border border-border bg-card p-4 shadow-sm">
              <p class="text-2xl font-semibold text-foreground">{{ formatNumber(stats.preventedCases) }}</p>
              <p class="text-sm text-muted-foreground">预防损失金额（元）</p>
            </div>
          </div>
        </div>
        <Card class="relative overflow-hidden border-dashed">
          <CardHeader>
            <CardTitle class="flex items-center gap-3 text-xl">
              <ShieldCheck class="h-6 w-6 text-primary" />
              澄源反诈情报概览
            </CardTitle>
            <CardDescription>最近 30 天的诈骗举报与防御动态</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p class="text-sm text-muted-foreground">举报线索</p>
                <p class="text-2xl font-semibold text-foreground">1,248</p>
              </div>
              <Badge variant="secondary" class="bg-primary/20 text-emerald-700">+18% 同比</Badge>
            </div>
            <div class="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div class="rounded-lg bg-muted/40 p-3">
                <p class="text-xs uppercase tracking-wide text-muted-foreground">高发渠道</p>
                <p class="mt-1 font-medium text-foreground">社交媒体</p>
              </div>
              <div class="rounded-lg bg-muted/40 p-3">
                <p class="text-xs uppercase tracking-wide text-muted-foreground">重点关注</p>
                <p class="mt-1 font-medium text-foreground">投资理财、刷单</p>
              </div>
            </div>
            <Separator />
            <p class="text-sm text-muted-foreground">
              澄源联合各地公安、反诈中心提供实时动态，帮助快速识别新型手法。订阅预警，第一时间获知风险。
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="link" class="px-0" @click="navigate('/resources')">
              查看最新预警
              <ArrowRight class="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>

    <section class="container-grid">
      <div class="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 class="text-3xl font-semibold text-foreground">全局防护能力</h2>
          <p class="mt-2 max-w-2xl text-muted-foreground">
            澄源围绕“识别 — 防范 — 处置”三大阶段打造一体化反诈能力，引导用户快速上手并持续精进。
          </p>
        </div>
        <Button variant="outline" class="self-start" @click="navigate('/dashboard')">进入仪表盘</Button>
      </div>

      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card v-for="feature in features" :key="feature.title" class="group h-full border-border/80">
          <CardHeader class="space-y-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <component :is="feature.icon" class="h-6 w-6" />
            </div>
            <CardTitle class="text-xl">{{ feature.title }}</CardTitle>
            <CardDescription>{{ feature.description }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3 text-sm text-muted-foreground">
            <ul class="space-y-2">
              <li v-for="item in feature.points" :key="item" class="flex items-center gap-2">
                <Check class="h-4 w-4 text-primary" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" class="px-0 text-primary" @click="navigate(feature.href)">
              了解详情
              <ArrowRight class="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>

    <section class="bg-muted/40">
      <div class="container-grid py-16">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-3xl font-semibold text-foreground">实时学习轨迹</h2>
            <p class="mt-2 max-w-2xl text-muted-foreground">登陆后即可同步社区交流、测验进度与安全日历，为个人安全策略打分。</p>
          </div>
          <Button variant="outline" @click="navigate('/community')">加入社区</Button>
        </div>

        <div
          v-if="isAuthenticated"
          class="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <Card class="h-full">
            <CardHeader>
              <CardTitle>学习进度</CardTitle>
              <CardDescription>继续完成课程，解锁新的安全策略</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4 text-sm text-muted-foreground">
              <div v-for="track in learningTracks" :key="track.title" class="space-y-2">
                <div class="flex items-center justify-between text-sm text-foreground">
                  <span>{{ track.title }}</span>
                  <span class="font-medium text-primary">{{ track.progress }}%</span>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div class="h-full rounded-full bg-primary" :style="{ width: `${track.progress}%` }"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="h-full">
            <CardHeader>
              <CardTitle>最近成就</CardTitle>
              <CardDescription>新勋章实时同步，分享你的防诈心得</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-for="badge in achievements" :key="badge.title" class="flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Trophy class="h-5 w-5" />
                </div>
                <div>
                  <p class="font-medium text-foreground">{{ badge.title }}</p>
                  <p class="text-sm text-muted-foreground">{{ badge.description }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card v-else class="mt-10 flex flex-col gap-6 border-dashed border-border/80 p-8 text-center">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles class="h-6 w-6" />
          </div>
          <div class="space-y-2">
            <h3 class="text-2xl font-semibold text-foreground">立即登录，定制你的反诈策略</h3>
            <p class="text-sm text-muted-foreground">
              登录后可同步测验记录、收藏案例、跟进社区提问，澄源会基于个人弱点推荐补充课程。
            </p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button class="sm:w-auto" @click="navigate('/login')">登录澄源</Button>
            <Button variant="outline" class="sm:w-auto" @click="navigate('/register')">创建账户</Button>
          </div>
        </Card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowRight, Check, ShieldCheck, Sparkles, Trophy, FileWarning, Brain, Users } from 'lucide-vue-next'

import Badge from '~/components/ui/badge.vue'
import Button from '~/components/ui/button.vue'
import Card from '~/components/ui/card.vue'
import CardContent from '~/components/ui/card-content.vue'
import CardDescription from '~/components/ui/card-description.vue'
import CardFooter from '~/components/ui/card-footer.vue'
import CardHeader from '~/components/ui/card-header.vue'
import CardTitle from '~/components/ui/card-title.vue'
import Separator from '~/components/ui/separator.vue'

import { fetchPlatformStats } from '~/api/statistics'

useHead({
  title: '澄源 - 守护您的财产安全',
  meta: [
    { name: 'description', content: '通过互动学习、知识图谱和社区交流，提升您的反诈骗意识和防范能力' },
    { name: 'keywords', content: '反诈骗,防诈骗,网络安全,财产安全,诈骗防范' }
  ]
})

const stats = ref({
  totalUsers: 15420,
  totalQuestions: 2580,
  totalKnowledge: 5,
  preventedCases: 1005000
})

const isAuthenticated = ref(false)
const learningTracks = [
  { title: '基础防诈课程', progress: 85 },
  { title: '网络诈骗应对', progress: 72 },
  { title: '电信诈骗识别', progress: 58 }
]

const achievements = [
  { title: '初级防诈守护者', description: '完成 10 道基础测验题目' },
  { title: '情景模拟达人', description: '成功通过 3 次高风险情景演练' }
]

const features = [
  {
    title: '知识图谱引擎',
    description: '梳理诈骗链路、风险节点与防护策略，构建清晰的应对地图。',
    points: ['实时更新最新骗局', '智能关联人物 / 场景 / 渠道', '一键导出风险提示'],
    href: '/graph',
    icon: Brain
  },
  {
    title: '互动式测验',
    description: '多难度试题结合 AI 解析，精准定位安全盲区，提供个性化复盘建议。',
    points: ['分级评估个人风险', 'AI 给出防护建议', '错题自动加入复习清单'],
    href: '/quiz',
    icon: FileWarning
  },
  {
    title: '社区共建',
    description: '与公安、志愿者、普通用户共同分享真实案例，快速提升识诈能力。',
    points: ['案例复盘与标注', '高赞回答精选', '志愿者实时答疑'],
    href: '/community',
    icon: Users
  }
]

const navigate = async (href: string) => {
  await useRouter().push(href)
}

const formatNumber = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 10_000) {
    return `${(value / 10_000).toFixed(1)}万`
  }
  return value.toLocaleString()
}

const loadStats = async () => {
  try {
    const response = await fetchPlatformStats()
    if (response && typeof response === 'object') {
      const fraudCases = response.fraud_cases_yearly || []
      const totalCases = fraudCases.reduce((sum: number, item: any) => sum + (item.reported_cases || 0), 0)
      stats.value = {
        totalUsers: 15420,
        totalQuestions: 2580,
        totalKnowledge: response.fraud_type_distribution?.length || 5,
        preventedCases: Math.max(totalCases * 0.1, 1005000)
      }
    }
  } catch (error) {
    console.warn('使用默认统计数据', error)
  }
}

onMounted(async () => {
  if (process.client) {
    try {
      const { useAuth } = await import('~/composables/useAuth')
      const auth = useAuth()
      isAuthenticated.value = auth.isAuthenticated.value
    } catch (error) {
      console.warn('初始化认证状态失败', error)
    }

    await loadStats()
  }
})
</script>
