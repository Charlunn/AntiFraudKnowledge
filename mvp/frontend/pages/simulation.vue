<template>
  <div class="space-y-6">
    <PageHeader title="AI 反诈场景模拟" description="通过黑白极简聊天界面体验真实诈骗对话并获得即时评分与建议。" />

    <Card class="border border-border/80">
      <CardHeader>
        <CardTitle>对话控制台</CardTitle>
        <CardDescription>选择场景与模式，开始与 AI 对手过招。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-4 md:grid-cols-3">
          <div>
            <Label>场景</Label>
            <select
              v-model="scenario.type"
              class="w-full rounded-md border border-border bg-background p-2 text-sm"
            >
              <option v-for="option in scenarioOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div>
            <Label>难度</Label>
            <select
              v-model="scenario.difficulty"
              class="w-full rounded-md border border-border bg-background p-2 text-sm"
            >
              <option v-for="option in difficultyOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div>
            <Label>模式</Label>
            <select
              v-model="scenario.mode"
              class="w-full rounded-md border border-border bg-background p-2 text-sm"
            >
              <option v-for="option in modeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="rounded-2xl border border-border/70 bg-card p-4">
          <div class="flex items-center justify-between text-sm">
            <p class="font-medium">对话安全评分</p>
            <div class="text-right">
              <p class="text-2xl font-semibold">
                {{ sanitizedScore }}<span class="text-base font-normal"> / 100</span>
              </p>
              <p
                v-if="scoreChange"
                class="text-xs"
                :class="scoreChange > 0 ? 'text-emerald-500' : 'text-red-500'"
              >
                {{ scoreChange > 0 ? '+' : '' }}{{ scoreChange }} 分 · {{ changeReason || '系统判定' }}
              </p>
            </div>
          </div>
          <div class="mt-2 h-2 rounded-full bg-muted">
            <div
              class="h-2 rounded-full bg-foreground transition-all"
              :style="{ width: sanitizedScore + '%' }"
            ></div>
          </div>
        </div>

        <div
          ref="chatBodyRef"
          class="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-border/70 bg-background/80 p-4 shadow-inner"
        >
          <div
            v-for="(item, index) in conversation"
            :key="index"
            class="max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed"
            :class="item.role === 'user' ? 'ml-auto bg-foreground text-background' : 'bg-secondary text-foreground'"
          >
            {{ item.content }}
          </div>
          <p v-if="!conversation.length" class="text-sm text-muted-foreground">
            还没有任何消息，先向 AI 发起交流吧。
          </p>
        </div>

        <form class="flex flex-col gap-3 md:flex-row" @submit.prevent="sendMessage">
          <Textarea
            v-model="message"
            rows="3"
            class="flex-1"
            placeholder="请输入你的回应，保持冷静理性（请输入中文，避免暴露个人敏感信息）。"
          />
          <div class="flex flex-col gap-2">
            <Button type="submit" class="gap-2" :disabled="chatLoading || !message.trim()">
              <Icon name="lucide:message-circle" class="h-4 w-4" />
              {{ chatLoading ? '生成中...' : '发送' }}
            </Button>
            <Button type="button" variant="outline" :disabled="chatLoading" @click="resetSession">
              重置会话
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>分析报告</CardTitle>
        <CardDescription>对完整对话进行总结与改进建议。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Button class="gap-2" :disabled="reportLoading || !conversation.length" @click="generateReport">
          <Icon name="lucide:file-text" class="h-4 w-4" />
          {{ reportLoading ? '生成中...' : '生成报告' }}
        </Button>
        <div v-if="report" class="rounded-2xl border border-border/70 bg-card p-4 text-sm leading-relaxed">
          <p class="text-xs uppercase tracking-widest text-muted-foreground">表现评估</p>
          <p class="mt-2 whitespace-pre-line">{{ report.performance_analysis }}</p>
          <p class="mt-4 text-xs uppercase tracking-widest text-muted-foreground">改进建议</p>
          <p class="mt-2 whitespace-pre-line">{{ report.suggestions }}</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { AxiosError } from 'axios'
type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

definePageMeta({
  requiresAuth: true,
})

const { $api } = useNuxtApp()
const score = ref(50)
const scoreChange = ref(0)
const changeReason = ref('')
const message = ref('')
const chatLoading = ref(false)
const reportLoading = ref(false)
const conversation = ref<ChatMessage[]>([])
const report = ref<{ performance_analysis: string; suggestions: string } | null>(null)
const chatBodyRef = ref<HTMLElement | null>(null)

const scenarioOptions = [
  { label: '杀猪盘投资', value: 'pig-butchering' },
  { label: '钓鱼短信/邮件', value: 'phishing' },
  { label: '假客服处理', value: 'fake-customer-service' },
  { label: '高收益投资', value: 'investment' },
  { label: '贷款垫资', value: 'loan' },
] as const

const difficultyOptions = [
  { label: '初级', value: 'easy' },
  { label: '中级', value: 'medium' },
  { label: '高级', value: 'hard' },
] as const

const modeOptions = [
  { label: '混合对抗（真/假客服交替）', value: 'mixed' },
  { label: '纯诈骗演练', value: 'pure_fake' },
] as const

const scenario = reactive({
  type: scenarioOptions[0].value,
  difficulty: difficultyOptions[1].value,
  mode: modeOptions[0].value,
})

const sanitizedScore = computed(() => Math.min(100, Math.max(0, score.value)))

const scrollToBottom = () => {
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  }
}

const extractErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<any>
  const data = axiosError?.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data?.message) return Array.isArray(data.message) ? data.message[0] : data.message
  if (data?.detail) return Array.isArray(data.detail) ? data.detail[0] : data.detail
  return fallback
}

const showToast = (text: string) => {
  if (process.client) {
    window.alert(text)
  }
}

const sendMessage = async () => {
  const content = message.value.trim()
  if (!content || chatLoading.value) return

  chatLoading.value = true
  report.value = null
  changeReason.value = ''
  scoreChange.value = 0

  const historyPayload = conversation.value.map((item) => ({
    role: item.role,
    content: item.content,
  }))
  historyPayload.push({ role: 'user', content })

  conversation.value.push({ role: 'user', content })
  message.value = ''

  try {
    const { data } = await $api.post('/chat/scenario/stateless/', {
      message: content,
      scenario_type: scenario.type,
      difficulty: scenario.difficulty,
      mode: scenario.mode,
      history: historyPayload,
      current_score: score.value,
    })

    conversation.value.push({
      role: 'assistant',
      content: data.response || 'AI 没有返回内容，请稍后再试。',
    })

    if (typeof data.current_score === 'number') {
      score.value = data.current_score
    }
    scoreChange.value = typeof data.score_change === 'number' ? data.score_change : 0
    changeReason.value = data.change_reason || ''
  } catch (error) {
    showToast(extractErrorMessage(error, '发送失败，请稍后重试'))
  } finally {
    chatLoading.value = false
    nextTick(scrollToBottom)
  }
}

const resetSession = async () => {
  if (chatLoading.value) return
  try {
    await $api.post('/chat/scenario/stateless/', {
      reset: true,
      scenario_type: scenario.type,
      difficulty: scenario.difficulty,
      mode: scenario.mode,
    })
  } catch (error) {
    // 保持静默，只在控制台记录
    console.warn('reset session failed', error)
  } finally {
    conversation.value = []
    score.value = 50
    scoreChange.value = 0
    changeReason.value = ''
    report.value = null
  }
}

const generateReport = async () => {
  if (!conversation.value.length) return
  reportLoading.value = true
  try {
    const { data } = await $api.post('/chat/generate-report/', {
      scenario_type: scenario.type,
      difficulty: scenario.difficulty,
      mode: scenario.mode,
      final_score: score.value,
      conversation_rounds: conversation.value.length,
      end_reason: 'manual',
      messages: conversation.value.map((item) => ({
        sender: item.role === 'user' ? 'user' : 'ai',
        content: item.content,
      })),
    })
    report.value = {
      performance_analysis: data.performance_analysis ?? '未获取到分析内容。',
      suggestions: data.suggestions ?? '未获取到建议内容。',
    }
  } catch (error) {
    showToast(extractErrorMessage(error, '生成报告失败，请稍后重试'))
  } finally {
    reportLoading.value = false
  }
}

watch(conversation, () => nextTick(scrollToBottom), { deep: true })
</script>
