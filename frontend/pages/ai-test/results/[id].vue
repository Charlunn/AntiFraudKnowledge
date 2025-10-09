<template>
  <div class="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20 dark:from-dark-bg dark:to-dark-surface">
    <div class="container mx-auto px-4 py-8">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <button 
          @click="goBack"
          class="flex items-center text-primary hover:text-primary transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          返回AI测试
        </button>
      </div>

      <!-- 页面标题和测试信息 -->
      <div class="bg-card dark:bg-card rounded-xl shadow-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-3xl font-bold text-foreground dark:text-foreground">
            测试记录详情
          </h1>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-muted-foreground dark:text-muted-foreground">
              会话ID: {{ sessionInfo.session_id || 'N/A' }}
            </span>
            <span class="px-3 py-1 rounded-full text-sm font-medium" :class="getScoreClass(sessionInfo.score)">
              风险评分: {{ sessionInfo.score }}分
            </span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-muted/40 dark:bg-muted/40 rounded-lg">
            <div class="text-2xl font-bold text-primary">{{ chatHistory.length }}</div>
            <div class="text-sm text-muted-foreground dark:text-muted-foreground">消息总数</div>
          </div>
          <div class="text-center p-4 bg-muted/40 dark:bg-muted/40 rounded-lg">
            <div class="text-2xl font-bold text-success-500">{{ userMessageCount }}</div>
            <div class="text-sm text-muted-foreground dark:text-muted-foreground">用户消息</div>
          </div>
          <div class="text-center p-4 bg-muted/40 dark:bg-muted/40 rounded-lg">
            <div class="text-2xl font-bold text-purple-500">{{ aiMessageCount }}</div>
            <div class="text-sm text-muted-foreground dark:text-muted-foreground">AI回复</div>
          </div>
        </div>
      </div>

      <!-- 对话报告 -->
      <div class="bg-card dark:bg-card rounded-xl shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-foreground dark:text-foreground mb-6">对话报告</h2>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p class="text-muted-foreground dark:text-muted-foreground mt-4">加载对话记录中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="text-center py-8">
          <svg class="w-16 h-16 text-destructive mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-destructive mb-2">加载失败</p>
          <p class="text-muted-foreground dark:text-muted-foreground text-sm">{{ error }}</p>
          <button 
            @click="loadChatHistory"
            class="mt-4 px-4 py-2 bg-primary/100 text-white rounded-lg hover:bg-primary transition-colors duration-200"
          >
            重新加载
          </button>
        </div>

        <!-- 空状态 -->
        <div v-else-if="chatHistory.length === 0" class="text-center py-8">
          <svg class="w-16 h-16 text-muted-foreground dark:text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p class="text-muted-foreground dark:text-muted-foreground">暂无对话记录</p>
          <p class="text-sm text-muted-foreground dark:text-muted-foreground mt-2">开始一次新的AI对话吧！</p>
        </div>

        <!-- 对话报告内容 -->
        <div v-else class="space-y-6">
          <!-- 最终得分 -->
          <div class="flex justify-between items-center p-4 bg-muted/40 dark:bg-muted/40 rounded-lg">
            <span class="font-semibold text-lg">最终得分:</span>
            <span class="text-3xl font-bold" :class="getScoreClass(testRecord?.final_score || sessionInfo.score)">
              {{ testRecord?.final_score || sessionInfo.score }}分
            </span>
          </div>
          
          <!-- 表现评价 -->
          <div class="p-4 bg-muted/40 dark:bg-muted/40 rounded-lg">
            <h3 class="font-semibold mb-3 text-lg">表现评价:</h3>
            <p class="text-muted-foreground dark:text-muted-foreground leading-relaxed">
              {{ getPerformanceText(testRecord?.final_score || sessionInfo.score) }}
            </p>
          </div>
          
          <!-- AI建议 -->
          <div class="p-4 bg-muted/40 dark:bg-muted/40 rounded-lg">
            <h3 class="font-semibold mb-3 text-lg">防诈骗建议:</h3>
            <div class="text-muted-foreground dark:text-muted-foreground leading-relaxed whitespace-pre-line">
              {{ testRecord?.report?.suggestions || getDefaultSuggestions() }}
            </div>
          </div>
          
          <!-- 测试统计 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <h4 class="font-semibold text-primary dark:text-primary mb-2">对话轮次</h4>
              <p class="text-2xl font-bold text-primary dark:text-primary">
                {{ testRecord?.report?.conversation_rounds || Math.floor(chatHistory.length / 2) }}
              </p>
            </div>
            <div class="p-4 bg-primary/10 dark:bg-success-900/20 rounded-lg">
              <h4 class="font-semibold text-success-700 dark:text-success-300 mb-2">测试时长</h4>
              <p class="text-2xl font-bold text-primary dark:text-success-400">
                {{ formatDuration(testRecord?.report?.duration) }}
              </p>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-center mt-6">
          <button 
            @click="continueChat"
            class="px-6 py-2 bg-primary/100 hover:bg-primary text-white rounded-lg transition-colors duration-200"
          >
            重新测试
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 页面布局
definePageMeta({
  layout: 'default'
})

// 页面元数据
useHead({
  title: '测试记录详情',
  meta: [
    { name: 'description', content: '查看AI测试的详细对话记录和评分信息' }
  ]
})

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const error = ref(null)
const chatHistory = ref([])
const testRecord = ref(null)
const sessionInfo = ref({
  session_id: '',
  score: 70
})

// 计算属性
const userMessageCount = computed(() => {
  return chatHistory.value.filter(msg => msg.role === 'user').length
})

const aiMessageCount = computed(() => {
  return chatHistory.value.filter(msg => msg.role === 'assistant').length
})

// 方法
const loadTestRecord = async () => {
  try {
    loading.value = true
    error.value = null
    
    const recordId = route.params.id
    
    // 模拟加载测试记录数据
    // 实际项目中应该调用API获取具体的测试记录
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟测试记录数据
    testRecord.value = {
      id: recordId,
      final_score: 75,
      report: {
        suggestions: '1. 在面对投资机会时要保持理性\n2. 不要被高收益承诺迷惑\n3. 通过官方渠道验证平台资质\n4. 小额试投，观察平台表现',
        conversation_rounds: 8,
        duration: 420
      }
    }
    
    sessionInfo.value = {
      session_id: `session_${recordId}`,
      score: testRecord.value.final_score
    }
    
    // 模拟聊天历史用于统计
    chatHistory.value = Array(16).fill().map((_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `消息内容 ${i + 1}`
    }))
    
  } catch (err) {
    console.error('加载测试记录失败:', err)
    error.value = err.message || '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

const continueChat = () => {
  navigateTo('/ai-test/scenario-chat')
}

const goBack = () => {
  router.back()
}

const getScoreClass = (score) => {
  if (score >= 80) return 'text-primary dark:text-success-400'
  if (score >= 60) return 'text-primary dark:text-primary'
  return 'text-destructive dark:text-destructive'
}

const getPerformanceText = (score) => {
  if (score >= 90) {
    return '优秀！您展现了极强的防诈骗意识，能够准确识别各种诈骗手段，并采取正确的应对措施。'
  } else if (score >= 80) {
    return '良好！您具备较强的防诈骗能力，但在某些细节上还需要提高警惕性。'
  } else if (score >= 60) {
    return '一般。您对诈骗有一定的认识，但容易被某些话术迷惑，需要加强学习。'
  } else if (score >= 40) {
    return '需要改进。您的防诈骗意识较弱，容易成为诈骗分子的目标，请务必提高警惕。'
  } else {
    return '危险！您极易受到诈骗，建议立即学习相关知识，提高防范意识。'
  }
}

const getDefaultSuggestions = () => {
  return `1. 保持冷静思考，不要被紧急情况冲昏头脑
2. 验证对方身份，通过官方渠道核实信息
3. 不轻易透露个人信息和财务信息
4. 遇到可疑情况及时咨询家人朋友或报警
5. 定期学习最新的诈骗手段和防范知识`
}

const formatDuration = (seconds) => {
  if (!seconds) return '未知'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}分${remainingSeconds}秒`
}

const getMessageClass = (role) => {
  return role === 'user' 
    ? 'bg-primary/100 text-white'
    : 'bg-muted/60 dark:bg-muted/40 text-foreground dark:text-foreground'
}

const getAvatarClass = (role) => {
  return role === 'user' 
    ? 'bg-primary/100'
    : 'bg-primary/100'
}

// 生命周期
onMounted(() => {
  loadTestRecord()
})
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>