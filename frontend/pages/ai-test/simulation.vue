<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 dark:from-dark-bg dark:to-dark-surface">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-text mb-4">
          AI 场景模拟
        </h1>
        <p class="text-lg text-gray-600 dark:text-dark-text-secondary">
          通过AI生成的真实场景，练习识别和应对各种欺诈手段
        </p>
      </div>

      <!-- 场景选择 -->
      <div v-if="simulationState === 'select'" class="max-w-4xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="scenario in scenarios"
            :key="scenario.id"
            @click="selectScenario(scenario)"
            class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4" :class="scenario.colorClass">
              <component :is="scenario.icon" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">{{ scenario.title }}</h3>
            <p class="text-gray-600 dark:text-dark-text-secondary mb-4">{{ scenario.description }}</p>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500 dark:text-dark-text-secondary">难度: {{ scenario.difficulty }}</span>
              <span class="text-sm font-medium text-purple-600 dark:text-purple-400">开始模拟 →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 场景模拟进行中 -->
      <div v-else-if="simulationState === 'running'" class="max-w-4xl mx-auto">
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden">
          <!-- 场景信息 -->
          <div class="bg-purple-500 text-white p-6">
            <h2 class="text-2xl font-semibold mb-2">{{ currentScenario.title }}</h2>
            <p class="opacity-90">{{ currentScenario.description }}</p>
          </div>

          <!-- 模拟对话 -->
          <div class="p-6">
            <div class="space-y-4 mb-6" style="max-height: 400px; overflow-y: auto;">
              <div v-for="message in simulationMessages" :key="message.id" class="flex" :class="message.sender === 'user' ? 'justify-end' : 'justify-start'">
                <div class="max-w-xs lg:max-w-md">
                  <div class="px-4 py-2 rounded-lg" :class="message.sender === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-dark-bg text-gray-900 dark:text-dark-text'">
                    {{ message.content }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-dark-text-secondary mt-1" :class="message.sender === 'user' ? 'text-right' : 'text-left'">
                    {{ message.sender === 'user' ? '您' : '诈骗者' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 选择回应 -->
            <div v-if="currentStep < currentScenario.steps.length" class="space-y-3">
              <h4 class="font-semibold text-gray-900 dark:text-dark-text mb-3">请选择您的回应：</h4>
              <button
                v-for="(option, index) in currentScenario.steps[currentStep].options"
                :key="index"
                @click="selectResponse(option, index)"
                class="w-full text-left p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors duration-200"
              >
                {{ option.text }}
              </button>
            </div>

            <!-- 场景结束 -->
            <div v-else class="text-center">
              <div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">场景模拟完成</h3>
              <p class="text-gray-600 dark:text-dark-text-secondary mb-4">点击查看详细分析和建议</p>
              <button
                @click="showResults"
                class="bg-purple-500 hover:bg-purple-600 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
              >
                查看结果
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 结果分析 -->
      <div v-else-if="simulationState === 'result'" class="max-w-4xl mx-auto">
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-8">
          <div class="text-center mb-8">
            <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" :class="getResultColorClass()">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-dark-text mb-2">模拟结果分析</h2>
            <p class="text-gray-600 dark:text-dark-text-secondary">{{ currentScenario.title }}</p>
          </div>

          <!-- 得分 -->
          <div class="text-center mb-8">
            <div class="text-4xl font-bold mb-2" :class="getScoreColor(simulationScore)">{{ simulationScore }}</div>
            <div class="text-lg text-gray-600 dark:text-dark-text-secondary">防范得分</div>
            <div class="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">{{ getScoreLevel(simulationScore) }}</div>
          </div>

          <!-- 选择分析 -->
          <div class="space-y-4 mb-8">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text">您的选择分析</h3>
            <div v-for="(choice, index) in userChoices" :key="index" class="bg-gray-50 dark:bg-dark-bg rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" :class="choice.isCorrect ? 'bg-green-500' : 'bg-red-500'">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path v-if="choice.isCorrect" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    <path v-else fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-gray-900 dark:text-dark-text">{{ choice.text }}</div>
                  <div class="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">{{ choice.feedback }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI建议 -->
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">AI专家建议</h3>
            <ul class="space-y-2 text-blue-800 dark:text-blue-200">
              <li v-for="suggestion in aiSuggestions" :key="suggestion" class="flex items-start">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                {{ suggestion }}
              </li>
            </ul>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-center space-x-4">
            <button
              @click="backToSelection"
              class="px-6 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors duration-200"
            >
              选择其他场景
            </button>
            <button
              @click="restartScenario"
              class="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
            >
              重新模拟
            </button>
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
  title: 'AI场景模拟 - 反欺诈知识平台'
})

// 响应式数据
const simulationState = ref('select') // select, running, result
const currentScenario = ref(null)
const currentStep = ref(0)
const simulationMessages = ref([])
const userChoices = ref([])
const simulationScore = ref(0)
const aiSuggestions = ref([])

// 场景数据
const scenarios = ref([
  {
    id: 1,
    title: '电信诈骗',
    description: '模拟接到冒充公检法的诈骗电话',
    difficulty: '初级',
    colorClass: 'bg-red-500',
    icon: 'PhoneIcon',
    steps: [
      {
        message: '您好，我是XX市公安局的警官，您的身份证涉嫌一起洗钱案件，需要配合调查。',
        options: [
          { text: '好的，我配合调查', isCorrect: false, score: 0, feedback: '错误！真正的警察不会通过电话要求配合调查案件' },
          { text: '我没有犯罪，你们搞错了', isCorrect: false, score: 20, feedback: '虽然否认了，但仍在与诈骗者对话，容易被进一步诱导' },
          { text: '直接挂断电话', isCorrect: true, score: 100, feedback: '正确！遇到此类电话应立即挂断，公安机关不会通过电话办案' }
        ]
      },
      {
        message: '请不要挂断！这是严重的刑事案件，如果不配合调查，我们将对您进行网上通缉！',
        options: [
          { text: '我真的没有犯罪，请相信我', isCorrect: false, score: 0, feedback: '继续对话只会让诈骗者有机会进一步实施诈骗' },
          { text: '那我应该怎么配合调查？', isCorrect: false, score: 0, feedback: '这正是诈骗者想要的回应，接下来会要求转账' },
          { text: '挂断电话并拨打110核实', isCorrect: true, score: 100, feedback: '完全正确！应该挂断电话并通过官方渠道核实' }
        ]
      }
    ]
  },
  {
    id: 2,
    title: '网络投资诈骗',
    description: '模拟遇到高收益投资平台的诱惑',
    difficulty: '中级',
    colorClass: 'bg-yellow-500',
    icon: 'CurrencyDollarIcon',
    steps: [
      {
        message: '恭喜您！您被选中参与我们的VIP投资项目，日收益可达10%，现在注册还送1000元体验金！',
        options: [
          { text: '听起来不错，我想了解更多', isCorrect: false, score: 0, feedback: '危险！日收益10%是不可能的，这明显是诈骗' },
          { text: '先投少量资金试试', isCorrect: false, score: 20, feedback: '仍然有风险，诈骗者通常会让你先尝到甜头' },
          { text: '拒绝参与，这明显是诈骗', isCorrect: true, score: 100, feedback: '正确！任何承诺高收益低风险的投资都要警惕' }
        ]
      }
    ]
  },
  {
    id: 3,
    title: '杀猪盘诈骗',
    description: '模拟网络交友中的情感诈骗',
    difficulty: '高级',
    colorClass: 'bg-pink-500',
    icon: 'HeartIcon',
    steps: [
      {
        message: '亲爱的，我们认识这么久了，我想和你分享一个赚钱的机会，我最近在一个投资平台赚了不少钱。',
        options: [
          { text: '真的吗？能带我一起赚钱吗？', isCorrect: false, score: 0, feedback: '危险！这是典型的杀猪盘套路，利用感情诱导投资' },
          { text: '我对投资不太懂，你能教我吗？', isCorrect: false, score: 10, feedback: '仍然中了圈套，诈骗者会进一步诱导你投资' },
          { text: '我们还是不要谈钱的事情', isCorrect: true, score: 80, feedback: '较好的回应，但还需要更加警惕' },
          { text: '怀疑对方动机，保持距离', isCorrect: true, score: 100, feedback: '正确！网络交友中谈投资要高度警惕' }
        ]
      }
    ]
  }
])

// 选择场景
const selectScenario = (scenario) => {
  currentScenario.value = scenario
  simulationState.value = 'running'
  currentStep.value = 0
  simulationMessages.value = []
  userChoices.value = []
  
  // 添加第一条消息
  addMessage(scenario.steps[0].message, 'scammer')
}

// 添加消息
const addMessage = (content, sender) => {
  simulationMessages.value.push({
    id: Date.now() + Math.random(),
    content,
    sender,
    timestamp: new Date()
  })
}

// 选择回应
const selectResponse = (option, index) => {
  // 添加用户回应
  addMessage(option.text, 'user')
  
  // 记录用户选择
  userChoices.value.push({
    text: option.text,
    isCorrect: option.isCorrect,
    score: option.score,
    feedback: option.feedback
  })
  
  // 移到下一步
  currentStep.value++
  
  // 如果还有下一步，添加下一条消息
  if (currentStep.value < currentScenario.value.steps.length) {
    setTimeout(() => {
      addMessage(currentScenario.value.steps[currentStep.value].message, 'scammer')
    }, 1000)
  }
}

// 显示结果
const showResults = () => {
  // 计算得分
  const totalScore = userChoices.value.reduce((sum, choice) => sum + choice.score, 0)
  const maxScore = userChoices.value.length * 100
  simulationScore.value = Math.round((totalScore / maxScore) * 100)
  
  // 生成AI建议
  generateAISuggestions()
  
  simulationState.value = 'result'
}

// 生成AI建议
const generateAISuggestions = () => {
  const suggestions = []
  
  if (simulationScore.value < 60) {
    suggestions.push('需要加强对此类诈骗手段的认识和防范')
    suggestions.push('建议学习更多相关案例，提高识别能力')
  } else if (simulationScore.value < 80) {
    suggestions.push('基本能识别诈骗，但还需要提高警惕性')
    suggestions.push('在类似情况下要更加果断地拒绝')
  } else {
    suggestions.push('您的防范意识很强，能够正确识别和应对诈骗')
    suggestions.push('继续保持警惕，并帮助身边的人提高防范意识')
  }
  
  // 根据场景类型添加特定建议
  switch (currentScenario.value.id) {
    case 1:
      suggestions.push('记住：公安机关不会通过电话办案或要求转账')
      break
    case 2:
      suggestions.push('任何承诺高收益低风险的投资都要谨慎对待')
      break
    case 3:
      suggestions.push('网络交友中涉及金钱要格外小心，谨防杀猪盘')
      break
  }
  
  aiSuggestions.value = suggestions
}

// 返回场景选择
const backToSelection = () => {
  simulationState.value = 'select'
  currentScenario.value = null
}

// 重新开始场景
const restartScenario = () => {
  if (currentScenario.value) {
    selectScenario(currentScenario.value)
  }
}

// 获取结果颜色类
const getResultColorClass = () => {
  if (simulationScore.value >= 80) return 'bg-green-500'
  if (simulationScore.value >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

// 获取得分颜色
const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

// 获取得分等级
const getScoreLevel = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '需要提高'
}
</script>

<style scoped>
/* 组件特定样式 */
</style>