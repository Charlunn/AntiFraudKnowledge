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

      <!-- 分数变化原因显示区域 -->
      <div v-if="recentScoreChanges.length > 0" class="max-w-4xl mx-auto mb-4">
        <div class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">📊 最近分数变化</h3>
          <div class="max-h-20 overflow-y-auto space-y-1">
            <div v-for="change in recentScoreChanges.slice(-3)" :key="change.id" class="text-xs text-yellow-700 dark:text-yellow-300">
              <span :class="change.scoreChange > 0 ? 'text-green-600' : 'text-red-600'" class="font-medium">
                {{ change.scoreChange > 0 ? '+' : '' }}{{ change.scoreChange }}分
              </span>
              - {{ change.changeReason }}
            </div>
          </div>
        </div>
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
const recentScoreChanges = ref([]) // 最近的分数变化记录

// 从URL获取参数
const scenarioId = route.query.scenario
const difficulty = route.query.difficulty || 'medium'
const mode = route.query.mode || 'mixed' // mixed: 真假混合, pure_fake: 纯假学习

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
  const modeMap = {
    'mixed': '真假混合模式',
    'pure_fake': '纯假学习模式'
  }
  return modeMap[mode] || '真假混合模式'
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

// 场景配置 - 与后端保持一致
const scenarios = {
  'telecom-fraud': {
    title: '电信诈骗模拟',
    description: '模拟冒充公检法的电信诈骗',
    initialMessage: '您好，我是XX市公安局的，您涉嫌一起洗钱案件，需要配合我们调查，请保持电话畅通。'
  },
  'pig-butchering': {
    title: '杀猪盘诈骗模拟',
    description: '模拟网络交友投资诈骗场景',
    initialMessage: '你好，我是通过朋友介绍认识你的，看你朋友圈生活很精彩呢！我最近在做一些投资，收益还不错，要不要了解一下？'
  },
  'phishing': {
    title: '网络钓鱼诈骗模拟',
    description: '模拟钓鱼网站和虚假链接诈骗',
    initialMessage: '【银行通知】您的账户存在异常登录，请立即点击链接验证身份，否则将冻结账户。'
  },
  'fake-customer-service': {
    title: '虚假客服诈骗模拟',
    description: '模拟冒充客服进行诈骗的场景',
    initialMessage: '您好，我是淘宝客服，您购买的商品存在质量问题，我们将为您办理退款，需要验证您的银行卡信息。'
  },
  'investment': {
    title: '虚假投资诈骗模拟',
    description: '模拟虚假投资平台诈骗',
    initialMessage: '恭喜您！您被选中参与我们的VIP投资项目，最低投资1000元，日收益20%，无风险保本，机会难得！'
  },
  'loan': {
    title: '虚假贷款诈骗模拟',
    description: '模拟虚假贷款平台诈骗', 
    initialMessage: '恭喜您通过我们的贷款预审，可获得30万额度，需要先缴纳2000元激活费用。'
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
    
    // 调用后端场景模拟API获取AI回复
    const response = await $fetch('/api/chat/scenario/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        message: question,
        scenario_type: scenarioId,
        difficulty: difficulty,
        mode: mode
      }
    })
    
    // 处理API响应
    let aiResponseContent, scoreChange = 0, changeReason = ''
    if (response && response.success && response.response) {
      aiResponseContent = response.response
      
      // 处理新的JSON格式响应
      if (response.current_score !== undefined) {
        const oldScore = currentScore.value
        currentScore.value = response.current_score
        scoreChange = response.score_change || 0
        changeReason = response.change_reason || ''
        
        // 记录分数变化
        if (scoreChange !== 0 && changeReason) {
          recentScoreChanges.value.push({
            id: Date.now(),
            scoreChange: scoreChange,
            changeReason: changeReason,
            timestamp: new Date()
          })
          
          // 只保留最近10条记录
          if (recentScoreChanges.value.length > 10) {
            recentScoreChanges.value = recentScoreChanges.value.slice(-10)
          }
        }
        
        console.log(`分数更新: ${oldScore} -> ${currentScore.value}, 变化: ${scoreChange}, 原因: ${changeReason}`)
      }
    } else {
      // 如果API调用失败，显示错误信息
      aiResponseContent = '抱歉，AI服务暂时不可用，请稍后再试。'
      console.error('场景模拟API调用失败:', response)
    }

    const aiMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      content: aiResponseContent,
      timestamp: new Date(),
      scoreChange: scoreChange,
      changeReason: changeReason
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
    
    // API调用失败时显示错误信息
    const aiMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      content: '抱歉，网络连接失败，AI服务暂时不可用。',
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

// 注意：AI回复现在完全由后端API处理，不再需要本地生成

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
onMounted(async () => {
  // 设置场景数据 - 根据URL参数动态设置
  console.log('当前场景ID:', scenarioId)
  scenarioData.value = scenarios[scenarioId] || scenarios['pig-butchering']
  console.log('设置的场景数据:', scenarioData.value)
  
  // 获取AI开场白
  try {
    const { accessToken } = useAuth()
    const token = accessToken.value
    
    if (token) {
      // 发送一个空消息来触发AI的开场白
      const response = await $fetch('/api/chat/scenario/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: {
          message: '开始对话',
          scenario_type: scenarioId,
          difficulty: difficulty,
          mode: mode
        }
      })
      
      if (response && response.success && response.response) {
        messages.value.push({
          id: 1,
          sender: 'ai',
          content: response.response,
          timestamp: new Date()
        })
      }
    }
  } catch (error) {
    console.error('获取AI开场白失败:', error)
    // 如果获取失败，使用默认开场白
    if (scenarioData.value.initialMessage) {
      messages.value.push({
        id: 1,
        sender: 'ai',
        content: scenarioData.value.initialMessage,
        timestamp: new Date()
      })
    }
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