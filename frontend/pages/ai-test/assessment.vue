<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-dark-bg dark:to-dark-surface">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-foreground dark:text-foreground mb-4">
          AI 智能评估
        </h1>
        <p class="text-lg text-muted-foreground dark:text-muted-foreground">
          AI分析您的知识水平，生成个性化的学习建议
        </p>
      </div>

      <!-- 评估状态 -->
      <div class="max-w-4xl mx-auto">
        <!-- 开始评估 -->
        <div v-if="assessmentState === 'start'" class="bg-card dark:bg-card rounded-xl shadow-lg p-8 text-center">
          <div class="w-20 h-20 bg-primary/20 dark:bg-success-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-primary dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 class="text-2xl font-semibold text-foreground dark:text-foreground mb-4">准备开始AI智能评估</h2>
          <p class="text-muted-foreground dark:text-muted-foreground mb-6 max-w-2xl mx-auto">
            本次评估将通过多个维度分析您的反欺诈知识水平，包括基础知识、案例识别、风险意识等方面。评估大约需要10-15分钟。
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="text-center">
              <div class="text-2xl font-bold text-primary dark:text-success-400">20+</div>
              <div class="text-sm text-muted-foreground dark:text-muted-foreground">评估题目</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary dark:text-primary">5</div>
              <div class="text-sm text-muted-foreground dark:text-muted-foreground">知识维度</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary dark:text-purple-400">15</div>
              <div class="text-sm text-muted-foreground dark:text-muted-foreground">分钟时长</div>
            </div>
          </div>
          <button
            @click="startAssessment"
            class="bg-primary/100 hover:bg-green-600 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200"
          >
            开始评估
          </button>
        </div>

        <!-- 评估进行中 -->
        <div v-else-if="assessmentState === 'progress'" class="bg-card dark:bg-card rounded-xl shadow-lg p-8">
          <!-- 进度条 -->
          <div class="mb-8">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-muted-foreground dark:text-foreground">评估进度</span>
              <span class="text-sm text-muted-foreground dark:text-muted-foreground">{{ currentQuestion }}/{{ totalQuestions }}</span>
            </div>
            <div class="w-full bg-muted/60 dark:bg-muted/40 rounded-full h-2">
              <div class="bg-primary/100 h-2 rounded-full transition-all duration-300" :style="{ width: progress + '%' }"></div>
            </div>
          </div>

          <!-- 当前题目 -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-foreground dark:text-foreground mb-4">
              {{ questions[currentQuestion - 1]?.question }}
            </h3>
            <div class="space-y-3">
              <label
                v-for="(option, index) in questions[currentQuestion - 1]?.options"
                :key="index"
                class="flex items-center p-4 border border-border dark:border-border rounded-lg cursor-pointer hover:bg-muted/40 dark:hover:bg-muted/30 transition-colors duration-200"
                :class="{ 'border-success-500 bg-primary/10 dark:bg-success-900/20': selectedAnswer === index }"
              >
                <input
                  v-model="selectedAnswer"
                  :value="index"
                  type="radio"
                  class="sr-only"
                >
                <div class="w-4 h-4 border-2 border-border dark:border-border rounded-full mr-3 flex items-center justify-center" :class="{ 'border-success-500': selectedAnswer === index }">
                  <div v-if="selectedAnswer === index" class="w-2 h-2 bg-primary/100 rounded-full"></div>
                </div>
                <span class="text-muted-foreground dark:text-foreground">{{ option }}</span>
              </label>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-between">
            <button
              @click="previousQuestion"
              :disabled="currentQuestion === 1"
              class="px-6 py-2 border border-border dark:border-border text-muted-foreground dark:text-foreground rounded-lg hover:bg-muted/40 dark:hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              上一题
            </button>
            <button
              @click="nextQuestion"
              :disabled="selectedAnswer === null"
              class="px-6 py-2 bg-primary/100 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {{ currentQuestion === totalQuestions ? '完成评估' : '下一题' }}
            </button>
          </div>
        </div>

        <!-- 评估结果 -->
        <div v-else-if="assessmentState === 'result'" class="bg-card dark:bg-card rounded-xl shadow-lg p-8">
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-primary/20 dark:bg-success-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-primary dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-2xl font-semibold text-foreground dark:text-foreground mb-2">评估完成</h2>
            <p class="text-muted-foreground dark:text-muted-foreground">您的反欺诈知识水平评估结果</p>
          </div>

          <!-- 总体得分 -->
          <div class="text-center mb-8">
            <div class="text-4xl font-bold text-primary dark:text-success-400 mb-2">{{ overallScore }}</div>
            <div class="text-lg text-muted-foreground dark:text-muted-foreground">总体得分</div>
            <div class="text-sm text-muted-foreground dark:text-muted-foreground mt-1">{{ getScoreLevel(overallScore) }}</div>
          </div>

          <!-- 各维度得分 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div v-for="dimension in dimensionScores" :key="dimension.name" class="bg-muted/40 dark:bg-muted/40 rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium text-foreground dark:text-foreground">{{ dimension.name }}</span>
                <span class="text-lg font-semibold" :class="getScoreColor(dimension.score)">{{ dimension.score }}</span>
              </div>
              <div class="w-full bg-muted/60 dark:bg-muted/20 rounded-full h-2">
                <div class="h-2 rounded-full transition-all duration-500" :class="getScoreBarColor(dimension.score)" :style="{ width: dimension.score + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- AI建议 -->
          <div class="bg-primary/10 dark:bg-primary/20 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold text-primary dark:text-primary mb-3">AI个性化建议</h3>
            <ul class="space-y-2 text-primary dark:text-primary/80">
              <li v-for="suggestion in aiSuggestions" :key="suggestion" class="flex items-start">
                <svg class="w-4 h-4 text-primary dark:text-primary mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                {{ suggestion }}
              </li>
            </ul>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-center space-x-4">
            <button
              @click="restartAssessment"
              class="px-6 py-2 border border-border dark:border-border text-muted-foreground dark:text-foreground rounded-lg hover:bg-muted/40 dark:hover:bg-muted/30 transition-colors duration-200"
            >
              重新评估
            </button>
            <NuxtLink
              to="/resources"
              class="px-6 py-2 bg-primary/100 text-white rounded-lg hover:bg-primary transition-colors duration-200"
            >
              查看学习资源
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 页面元数据
useHead({
  title: 'AI智能评估 - 反欺诈知识平台'
})

// 响应式数据
const assessmentState = ref('start') // start, progress, result
const currentQuestion = ref(1)
const totalQuestions = ref(20)
const selectedAnswer = ref(null)
const answers = ref([])
const overallScore = ref(0)
const dimensionScores = ref([])
const aiSuggestions = ref([])

// 评估题目
const questions = ref([
  {
    question: '以下哪种情况最可能是电信诈骗？',
    options: [
      '银行客服要求您到ATM机操作退款',
      '快递员通知您包裹丢失需要赔偿',
      '朋友通过微信借钱但不愿意语音通话',
      '以上都是'
    ],
    correct: 3,
    dimension: '基础识别'
  },
  {
    question: '收到"您的银行卡在异地消费"的短信，正确的做法是？',
    options: [
      '立即拨打短信中的客服电话',
      '点击短信中的链接查看详情',
      '拨打银行官方客服电话核实',
      '回复短信询问详情'
    ],
    correct: 2,
    dimension: '应急处理'
  },
  {
    question: '网络投资平台承诺"日收益10%，保本保息"，您的判断是？',
    options: [
      '收益很高，值得投资',
      '先小额试试看',
      '明显是诈骗，不能相信',
      '找朋友一起投资分摊风险'
    ],
    correct: 2,
    dimension: '风险意识'
  },
  {
    question: '陌生人通过社交软件加您好友并很快表达好感，可能是？',
    options: [
      '真心喜欢您',
      '杀猪盘诈骗的开始',
      '想发展成朋友',
      '网络交友很正常'
    ],
    correct: 1,
    dimension: '情感诈骗'
  },
  {
    question: '以下哪个不是保护个人信息的好习惯？',
    options: [
      '定期更换密码',
      '在社交媒体分享详细行程',
      '谨慎连接公共WiFi',
      '不随意扫描二维码'
    ],
    correct: 1,
    dimension: '信息安全'
  }
])

// 计算属性
const progress = computed(() => {
  return (currentQuestion.value / totalQuestions.value) * 100
})

// 开始评估
const startAssessment = () => {
  assessmentState.value = 'progress'
  currentQuestion.value = 1
  selectedAnswer.value = null
  answers.value = []
}

// 下一题
const nextQuestion = () => {
  // 保存答案
  answers.value[currentQuestion.value - 1] = {
    questionIndex: currentQuestion.value - 1,
    selectedAnswer: selectedAnswer.value,
    correct: questions.value[currentQuestion.value - 1].correct,
    dimension: questions.value[currentQuestion.value - 1].dimension
  }

  if (currentQuestion.value === totalQuestions.value) {
    // 完成评估
    calculateResults()
    assessmentState.value = 'result'
  } else {
    // 下一题
    currentQuestion.value++
    selectedAnswer.value = answers.value[currentQuestion.value - 1]?.selectedAnswer || null
  }
}

// 上一题
const previousQuestion = () => {
  if (currentQuestion.value > 1) {
    currentQuestion.value--
    selectedAnswer.value = answers.value[currentQuestion.value - 1]?.selectedAnswer || null
  }
}

// 计算结果
const calculateResults = () => {
  const correctAnswers = answers.value.filter(answer => answer.selectedAnswer === answer.correct).length
  overallScore.value = Math.round((correctAnswers / totalQuestions.value) * 100)

  // 计算各维度得分
  const dimensions = ['基础识别', '应急处理', '风险意识', '情感诈骗', '信息安全']
  dimensionScores.value = dimensions.map(dimension => {
    const dimensionAnswers = answers.value.filter(answer => answer.dimension === dimension)
    const correctCount = dimensionAnswers.filter(answer => answer.selectedAnswer === answer.correct).length
    const score = dimensionAnswers.length > 0 ? Math.round((correctCount / dimensionAnswers.length) * 100) : 0
    return { name: dimension, score }
  })

  // 生成AI建议
  generateAISuggestions()
}

// 生成AI建议
const generateAISuggestions = () => {
  const suggestions = []
  
  if (overallScore.value < 60) {
    suggestions.push('建议系统学习反欺诈基础知识，提高整体防范意识')
  }
  
  dimensionScores.value.forEach(dimension => {
    if (dimension.score < 70) {
      switch (dimension.name) {
        case '基础识别':
          suggestions.push('加强常见诈骗手段的识别训练')
          break
        case '应急处理':
          suggestions.push('学习遇到可疑情况时的正确处理流程')
          break
        case '风险意识':
          suggestions.push('提高对高风险投资和理财产品的警惕性')
          break
        case '情感诈骗':
          suggestions.push('了解情感诈骗（杀猪盘）的套路和防范方法')
          break
        case '信息安全':
          suggestions.push('加强个人信息保护意识和技能')
          break
      }
    }
  })
  
  if (suggestions.length === 0) {
    suggestions.push('您的反欺诈知识水平很好，建议定期关注新型诈骗手段')
    suggestions.push('可以帮助身边的人提高防诈骗意识')
  }
  
  aiSuggestions.value = suggestions
}

// 重新评估
const restartAssessment = () => {
  assessmentState.value = 'start'
  currentQuestion.value = 1
  selectedAnswer.value = null
  answers.value = []
  overallScore.value = 0
  dimensionScores.value = []
  aiSuggestions.value = []
}

// 获取得分等级
const getScoreLevel = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '需要提高'
}

// 获取得分颜色
const getScoreColor = (score) => {
  if (score >= 80) return 'text-primary dark:text-success-400'
  if (score >= 60) return 'text-primary dark:text-primary'
  return 'text-destructive dark:text-destructive'
}

// 获取进度条颜色
const getScoreBarColor = (score) => {
  if (score >= 80) return 'bg-primary/100'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

// 初始化
onMounted(() => {
  // 扩展题目到20题（这里简化处理，实际应该有更多题目）
  const baseQuestions = [...questions.value]
  while (questions.value.length < totalQuestions.value) {
    questions.value.push(...baseQuestions)
  }
  questions.value = questions.value.slice(0, totalQuestions.value)
})
</script>

<style scoped>
/* 组件特定样式 */
</style>