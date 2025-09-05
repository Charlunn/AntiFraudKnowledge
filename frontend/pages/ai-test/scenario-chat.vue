<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-dark-bg dark:to-dark-surface">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题和场景信息 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-text mb-4">
          {{ scenarioData?.title || '电信诈骗模拟' }}
        </h1>
        <div class="flex justify-center items-center space-x-4 mb-4">
          <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            难度: {{ difficultyText }}
          </span>
          <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            模式: {{ modeText }}
          </span>
          <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            当前分数: {{ currentScore }}
          </span>
          <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            轮次: {{ conversationRounds }}/{{ maxRounds }}
          </span>
        </div>
        <p class="text-lg text-gray-600 dark:text-dark-text-secondary">
          {{ scenarioData?.description || '请保持警惕，识别诈骗行为' }}
        </p>
      </div>

      <!-- 聊天界面 -->
      <div class="max-w-4xl mx-auto">
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden">
          <!-- 聊天消息区域 -->
          <div class="h-96 overflow-y-auto p-6 space-y-4" ref="chatContainer">
            <div v-for="message in messages" :key="message.id" class="flex" :class="message.sender === 'user' ? 'justify-end' : 'justify-start'">
              <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg" :class="message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 border border-red-200'">
                <div class="text-sm mb-1" v-if="message.sender === 'ai'">
                  <span class="font-semibold text-red-600 dark:text-red-400">🚨 诈骗者</span>
                </div>
                {{ message.content }}
                <div v-if="message.scoreChange" class="text-xs mt-1 font-medium" :class="message.scoreChange > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ message.scoreChange > 0 ? '+' : '' }}{{ message.scoreChange }}分
                </div>
              </div>
            </div>
            <div v-if="isTyping" class="flex justify-start">
              <div class="bg-red-100 dark:bg-red-900 px-4 py-2 rounded-lg border border-red-200">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-red-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-red-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="border-t border-gray-200 dark:border-dark-border p-4">
            <div class="flex space-x-4">
              <input
                v-model="currentMessage"
                @keyup.enter="sendMessage"
                type="text"
                placeholder="输入您的回复..."
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-dark-bg dark:text-dark-text"
                :disabled="isTyping || gameEnded"
              >
              <button
                @click="sendMessage"
                :disabled="!currentMessage.trim() || isTyping || gameEnded"
                class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                发送
              </button>
              <button
                @click="endConversation"
                :disabled="gameEnded"
                class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                结束对话
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话报告弹窗 -->
    <div v-if="showReport" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-surface rounded-xl p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-dark-text mb-6">对话报告</h2>
        
        <div class="space-y-4">
          <div class="flex justify-between items-center p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
            <span class="font-semibold">最终得分:</span>
            <span class="text-2xl font-bold" :class="finalScore >= 80 ? 'text-green-600' : finalScore >= 60 ? 'text-yellow-600' : 'text-red-600'">
              {{ finalScore }}分
            </span>
          </div>
          
          <div class="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
            <h3 class="font-semibold mb-2">表现评价:</h3>
            <p class="text-gray-700 dark:text-dark-text-secondary">{{ performanceText }}</p>
          </div>
          
          <div class="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
            <h3 class="font-semibold mb-2">AI建议:</h3>
            <p class="text-gray-700 dark:text-dark-text-secondary">{{ aiAdvice }}</p>
          </div>
          
          <div class="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
            <h3 class="font-semibold mb-2">统计信息:</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>对话轮次: {{ conversationRounds }}</div>
              <div>场景类型: {{ scenarioData?.title }}</div>
              <div>难度等级: {{ difficultyText }}</div>
              <div>学习模式: {{ modeText }}</div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-4 mt-6">
          <button
            @click="saveReport"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            保存报告
          </button>
          <button
            @click="goBack"
            class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

// 页面元数据
useHead({
  title: '场景模拟 - 反欺诈知识平台'
})

const route = useRoute()
const router = useRouter()

// 认证检查
const { isAuthenticated, user, accessToken } = useAuth()

// 在客户端检查用户是否已登录
onMounted(async () => {
  if (process.client && !isAuthenticated.value) {
    await navigateTo('/login?redirect=' + encodeURIComponent(route.fullPath))
  }
})

// 响应式数据
const messages = ref([])
const currentMessage = ref('')
const isTyping = ref(false)
const chatContainer = ref(null)
const gameEnded = ref(false)
const showReport = ref(false)

// 游戏状态
const currentScore = ref(50) // 初始分数50
const conversationRounds = ref(0)
const maxRounds = 20
const finalScore = ref(0)

// 从URL获取参数
const scenarioId = route.query.scenario
const difficulty = route.query.difficulty || 'medium'
const mode = route.query.mode || 'mixed' // mixed: 真假混合, pure: 纯假

// 计算属性
const difficultyText = computed(() => {
  const difficultyMap = {
    easy: '简单',
    medium: '中等', 
    hard: '困难'
  }
  return difficultyMap[difficulty] || '中等'
})

const modeText = computed(() => {
  return mode === 'mixed' ? '真假混合' : '纯假学习'
})

const performanceText = computed(() => {
  if (finalScore.value >= 80) return '优秀！您很好地识别了诈骗行为，保持警惕！'
  if (finalScore.value >= 60) return '良好！您有一定的防诈骗意识，但还需要提高警惕性。'
  return '需要改进！建议您多学习反诈骗知识，提高防范意识。'
})

const aiAdvice = computed(() => {
  const advices = [
    '1. 遇到要求转账的情况，一定要多方核实',
    '2. 不要轻易透露个人信息和银行卡信息',
    '3. 对于高收益低风险的投资要保持怀疑',
    '4. 遇到可疑情况及时咨询家人朋友或报警',
    '5. 定期学习最新的诈骗手段和防范知识'
  ]
  return advices.join('\n')
})

// 场景数据
const scenarioData = ref(null)

// 场景配置
const scenarios = {
  'pig-butchering': {
    title: '杀猪盘诈骗模拟',
    description: '模拟网络交友投资诈骗场景',
    initialMessage: '你好，我是通过朋友介绍认识你的，看你朋友圈生活很精彩呢！我最近在做一些投资，收益还不错，要不要了解一下？'
  },
  'phishing': {
    title: '网络钓鱼模拟', 
    description: '模拟虚假网站和链接诈骗',
    initialMessage: '【银行通知】您的账户存在异常登录，请立即点击链接验证身份：http://bank-security.fake.com 否则将冻结账户。'
  },
  'fake-customer-service': {
    title: '虚假客服模拟',
    description: '模拟冒充客服退款诈骗',
    initialMessage: '您好，我是淘宝客服，您昨天购买的商品由于质量问题需要退款，请提供您的银行卡号和验证码，我们将为您办理退款。'
  },
  'investment': {
    title: '虚假投资模拟',
    description: '模拟高收益投资诈骗',
    initialMessage: '恭喜您！您被选中参与我们的VIP投资项目，最低投资1000元，日收益20%，无风险保本，机会难得！'
  },
  'loan': {
    title: '虚假贷款模拟',
    description: '模拟无抵押贷款诈骗', 
    initialMessage: '您好！我们是XX金融，可为您提供无抵押贷款，额度最高50万，当天放款，只需要缴纳2000元保证金即可。'
  }
}

// 发送消息
const sendMessage = async () => {
  if (!currentMessage.value.trim() || gameEnded.value) return

  const userMessage = {
    id: Date.now(),
    sender: 'user',
    content: currentMessage.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const question = currentMessage.value
  currentMessage.value = ''
  conversationRounds.value++

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 评分用户回复
  const scoreChange = evaluateUserResponse(question)
  currentScore.value = Math.max(0, Math.min(100, currentScore.value + scoreChange))

  // 检查是否需要结束对话（分数达到极值）
  if (currentScore.value <= 0) {
    endConversation('score_too_low')
    return
  } else if (currentScore.value >= 100) {
    endConversation('perfect_score')
    return
  }
  
  // 检查对话轮次限制
  if (conversationRounds.value >= 20) {
    endConversation('max_rounds')
    return
  }

  // 显示AI正在输入
  isTyping.value = true

  try {
    // 获取认证token - 使用useAuth组合式函数
    const { accessToken } = useAuth()
    const token = accessToken.value
    
    if (!token) {
      isTyping.value = false
      alert('登录状态已过期，请重新登录')
      await navigateTo('/login?redirect=' + encodeURIComponent(route.fullPath))
      return
    }
    
    // 调用后端API获取AI回复
    const response = await $fetch('/api/chat/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        message: question,
        scenario_type: mode || 'mixed',
        difficulty: difficulty || 'medium'
      }
    })

    const aiMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      content: response.reply || generateAIResponse(question), // 如果API失败则使用本地回复
      timestamp: new Date(),
      scoreChange: scoreChange
    }

    messages.value.push(aiMessage)
    isTyping.value = false

    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('获取AI回复失败:', error)
    isTyping.value = false
    
    // 处理认证错误
    if (error.message.includes('用户未登录') || error.status === 401 || error.statusCode === 401) {
      alert('登录状态已过期，请重新登录后继续对话')
      await navigateTo('/login?redirect=' + encodeURIComponent(route.fullPath))
      return
    }
    
    // 处理网络错误
    if (error.message.includes('fetch')) {
      alert('网络连接失败，请检查网络后重试')
    }
    
    // API调用失败时使用本地模拟回复
    const aiResponse = generateAIResponse(question)
    const aiMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      content: aiResponse,
      timestamp: new Date(),
      scoreChange: scoreChange
    }

    messages.value.push(aiMessage)

    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 评估用户回复
const evaluateUserResponse = (response) => {
  const suspiciousKeywords = ['转账', '汇款', '银行卡', '密码', '验证码', '身份证', '投资', '收益', '保证金', '账号', '卡号']
  const alertKeywords = ['报警', '诈骗', '不相信', '假的', '骗子', '可疑', '核实', '警察', '骗局', '陷阱', '谨慎', '小心']
  const cooperativeKeywords = ['好的', '可以', '同意', '没问题', '马上', '立即', '现在就']
  
  let score = 0
  
  // 根据难度设置不同的评分标准
  const difficultyMultiplier = {
    easy: { alert: 15, suspicious: -8, cooperative: -12 },
    medium: { alert: 10, suspicious: -5, cooperative: -8 },
    hard: { alert: 8, suspicious: -3, cooperative: -5 }
  }
  
  const multiplier = difficultyMultiplier[difficulty] || difficultyMultiplier.medium
  
  // 如果用户表现出警惕性，加分
  alertKeywords.forEach(keyword => {
    if (response.includes(keyword)) {
      score += multiplier.alert
    }
  })
  
  // 如果用户提到敏感信息，扣分
  suspiciousKeywords.forEach(keyword => {
    if (response.includes(keyword)) {
      score += multiplier.suspicious
    }
  })
  
  // 如果用户过于配合，扣分
  cooperativeKeywords.forEach(keyword => {
    if (response.includes(keyword)) {
      score += multiplier.cooperative
    }
  })
  
  // 根据对话轮次调整评分（越晚识别出诈骗，分数调整越小）
  const roundPenalty = Math.max(0.5, 1 - (conversationRounds.value * 0.1))
  score = Math.round(score * roundPenalty)
  
  return score
}

// 生成AI回复
const generateAIResponse = (userInput) => {
  const scenario = scenarios[scenarioId]
  if (!scenario) return '系统错误，请重新开始。'
  
  // 根据场景类型和用户输入生成回复
  const responses = {
    'pig-butchering': [
      '你看起来很谨慎呢，这样很好！我这个投资平台真的很靠谱，我自己都投了10万，现在每天都有收益。要不你先投个1000试试水？',
      '我理解你的担心，但是机会不等人啊！这个平台是我朋友内部推荐的，名额有限。你看我的收益截图，一个月就赚了3万！',
      '好吧，我看你确实很小心。这样吧，我先帮你垫付1000，你看到收益了再还我，怎么样？这总没风险了吧？'
    ],
    'phishing': [
      '请不要忽视这个安全提醒！您的账户确实存在风险，我们的系统检测到异常登录。请立即验证，否则账户将被永久冻结！',
      '为了您的资金安全，请配合我们的验证流程。您只需要输入银行卡号和手机验证码即可完成验证，这是银行的标准流程。',
      '时间紧急！如果您在30分钟内不完成验证，账户将被冻结并移交公安部门处理。请立即点击链接完成验证！'
    ],
    'fake-customer-service': [
      '先生/女士，这是我们的退款流程，需要您配合。由于系统升级，退款需要通过银行卡验证。请提供卡号后四位和验证码。',
      '我理解您的担心，但这确实是我们的标准流程。您可以查看我们的工号和客服证件。为了快速处理，请配合提供相关信息。',
      '如果您不配合退款流程，我们将无法为您处理，损失只能您自己承担。这个商品确实有质量问题，其他客户都已经成功退款了。'
    ],
    'investment': [
      '这个项目确实收益很高，但我们有专业的风控团队。您看这些成功案例，都是真实的客户收益。机会难得，今天就截止了！',
      '我明白您的顾虑，但高收益必然伴随机遇。我们公司有正规资质，您可以先投资小额试试。很多客户都是从1000开始，现在都赚了几十万！',
      '好吧，看您这么谨慎，我给您申请个特殊优惠。您只需要投资500，我们给您1000的额度，怎么样？这样总没风险了吧？'
    ],
    'loan': [
      '保证金是银行的标准流程，用于验证您的还款能力。这2000元在放款后会一并返还给您，相当于免费贷款。',
      '我理解您的担心，但这确实是正规流程。您可以查看我们的营业执照和金融许可证。很多客户都是这样操作的，非常安全。',
      '如果您现在不办理，这个优惠利率就没有了。下次办理可能需要更高的保证金。机会难得，建议您抓紧时间！'
    ]
  }
  
  const scenarioResponses = responses[scenarioId] || ['请继续我们的对话。']
  const randomResponse = scenarioResponses[Math.floor(Math.random() * scenarioResponses.length)]
  
  return randomResponse
}

// 结束对话
const endConversation = () => {
  gameEnded.value = true
  finalScore.value = currentScore.value
  showReport.value = true
}

// 保存报告
const saveReport = async () => {
  try {
    const reportData = {
      scenario_type: scenarioData.value?.title || '电信诈骗模拟',
      difficulty: difficulty,
      mode: mode,
      score: finalScore.value,
      conversation_rounds: conversationRounds.value,
      end_reason: 'manual_end',
      report_data: {
        title: '对话报告',
        message: performanceText.value,
        suggestions: aiAdvice.value,
        messages: messages.value
      },
      completed_at: new Date().toISOString()
    }
    
    const response = await $fetch('/api/test-records/create/', {
      method: 'POST',
      body: reportData
    })
    
    console.log('测试记录保存成功:', response)
    alert('报告已保存到测试记录！')
    goBack()
  } catch (error) {
    console.error('保存报告失败:', error)
    alert('保存失败，请重试')
  }
}

// 返回
const goBack = () => {
  router.push('/ai-test/simulation')
}

// 滚动到底部
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 初始化
onMounted(() => {
  // 设置场景数据
  scenarioData.value = scenarios[scenarioId] || scenarios['pig-butchering']
  
  // 添加初始消息
  if (scenarioData.value.initialMessage) {
    messages.value.push({
      id: 1,
      sender: 'ai',
      content: scenarioData.value.initialMessage,
      timestamp: new Date()
    })
  }
})
</script>

<style scoped>
/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>