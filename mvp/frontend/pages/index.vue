<template>
  <div class="space-y-8">
    <section class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm uppercase tracking-widest text-muted-foreground">MVP / Dashboard</p>
        <h1 class="mt-1 text-3xl font-semibold">欢迎回来，{{ auth.user?.nickname || auth.user?.username }}</h1>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" class="gap-2" @click="navigateTo('/profile')">
          <Icon name="lucide:user" class="h-4 w-4" />
          我的主页
        </Button>
        <Button class="gap-2" @click="navigateTo('/quiz')">
          <Icon name="lucide:play" class="h-4 w-4" />
          开始测验
        </Button>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-4">
      <Card v-for="item in statCards" :key="item.label" class="border border-border/80">
        <CardHeader class="space-y-2">
          <CardDescription>{{ item.label }}</CardDescription>
          <CardTitle class="text-3xl">{{ item.value }}</CardTitle>
          <p class="text-xs text-muted-foreground">{{ item.hint }}</p>
        </CardHeader>
      </Card>
    </section>

    <section class="grid gap-6 md:grid-cols-2">
      <Card class="border border-border/80">
        <CardHeader>
          <CardTitle>个人测验概况</CardTitle>
          <CardDescription>最近 5 次测验表现（按时间倒序）</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="quizLoading" class="text-sm text-muted-foreground">加载中...</div>
          <div v-else class="space-y-4">
            <div class="flex items-center justify-between text-sm" v-for="attempt in recentAttempts" :key="attempt.created_at">
              <div>
                <p class="font-medium">{{ levelMap[attempt.level] }}</p>
                <p class="text-xs text-muted-foreground">{{ formatDate(attempt.created_at) }}</p>
              </div>
              <Badge>{{ attempt.score }} 分</Badge>
            </div>
            <p v-if="!recentAttempts.length" class="text-sm text-muted-foreground">暂无测验记录。</p>
          </div>
        </CardContent>
      </Card>

      <Card class="border border-border/80">
        <CardHeader>
          <CardTitle>系统快捷入口</CardTitle>
          <CardDescription>快速跳转到核心 MVP 功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-3">
            <Button variant="outline" class="justify-between" @click="navigateTo('/simulation')">
              <span>AI 场景模拟</span>
              <Icon name="lucide:bot" class="h-4 w-4" />
            </Button>
            <Button variant="outline" class="justify-between" @click="navigateTo('/graph')">
              <span>知识图谱可视化</span>
              <Icon name="lucide:network" class="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              class="justify-between"
              :disabled="!auth.isAdmin"
              @click="navigateTo('/admin/questions')"
            >
              <span>题库管理（管理员）</span>
              <Icon name="lucide:shield" class="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: true,
})

const auth = useAuthStore()
const statCards = ref([
  { label: '测验次数', value: '-', hint: '累计完成次数' },
  { label: '平均得分', value: '-', hint: '最近测验平均值' },
  { label: '最佳成绩', value: '-', hint: '最高得分记录' },
  { label: 'AI 模拟得分', value: '—', hint: '来自聊天 API 的最新分数' },
])

const levelMap: Record<string, string> = {
  beginner: '初级训练',
  intermediate: '中级训练',
  advanced: '高级训练',
}

const recentAttempts = ref<any[]>([])
const quizLoading = ref(true)
const { $api } = useNuxtApp()

const formatDate = (value: string) => {
  return new Date(value).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const loadStats = async () => {
  quizLoading.value = true
  try {
    const [userStatsRes, quizStatsRes] = await Promise.all([
      $api.get('/users/stats/'),
      $api.get('/quiz/stats/'),
    ])
    statCards.value[0].value = userStatsRes.data.quiz_attempts_count ?? 0
    statCards.value[1].value = (quizStatsRes.data.average_score ?? 0) + '%'
    statCards.value[2].value = (quizStatsRes.data.best_score ?? 0) + '%'
    recentAttempts.value = quizStatsRes.data.recent_attempts ?? []
  } catch (error) {
    console.error('Failed to fetch stats', error)
  } finally {
    quizLoading.value = false
  }
}

onMounted(loadStats)
</script>
