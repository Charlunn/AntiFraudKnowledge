<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-dark-bg dark:to-dark-surface">
    <div class="container mx-auto px-4 py-8">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <button 
          @click="goBack"
          class="flex items-center text-blue-500 hover:text-blue-600 transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          返回AI测试
        </button>
      </div>

      <!-- 页面标题和测试信息 -->
      <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-text">
            测试记录详情
          </h1>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500 dark:text-dark-text-secondary">
              会话ID: {{ sessionInfo.session_id || 'N/A' }}
            </span>
            <span class="px-3 py-1 rounded-full text-sm font-medium" :class="getScoreClass(sessionInfo.score)">
              风险评分: {{ sessionInfo.score }}分
            </span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
            <div class="text-2xl font-bold text-blue-500">{{ chatHistory.length }}</div>
            <div class="text-sm text-gray-600 dark:text-dark-text-secondary">消息总数</div>
          </div>
          <div class="text-center p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
            <div class="text-2xl font-bold text-green-500">{{ userMessageCount }}</div>
            <div class="text-sm text-gray-600 dark:text-dark-text-secondary">用户消息</div>
          </div>
          <div class="text-center p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
            <div class="text-2xl font-bold text-purple-500">{{ aiMessageCount }}</div>
            <div class="text-sm text-gray-600 dark:text-dark-text-secondary">AI回复</div>
          </div>
        </div>
      </div>

      <!-- 聊天记录 -->
      <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-dark-text mb-6">对话记录</h2>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p class="text-gray-500 dark:text-dark-text-secondary mt-4">加载对话记录中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="text-center py-8">
          <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-500 mb-2">加载失败</p>
          <p class="text-gray-500 dark:text-dark-text-secondary text-sm">{{ error }}</p>
          <button 
            @click="loadChatHistory"
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            重新加载
          </button>
        </div>

        <!-- 空状态 -->
        <div v-else-if="chatHistory.length === 0" class="text-center py-8">
          <svg class="w-16 h-16 text-gray-400 dark:text-dark-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p class="text-gray-500 dark:text-dark-text-secondary">暂无对话记录</p>
          <p class="text-sm text-gray-400 dark:text-dark-text-secondary mt-2">开始一次新的AI对话吧！</p>
        </div>

        <!-- 对话消息列表 -->
        <div v-else class="space-y-4 max-h-96 overflow-y-auto">
          <div 
            v-for="(message, index) in chatHistory" 
            :key="index"
            class="flex" 
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div 
              class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
              :class="getMessageClass(message.role)"
            >
              <div class="flex items-center mb-1">
                <div class="w-6 h-6 rounded-full flex items-center justify-center mr-2" :class="getAvatarClass(message.role)">
                  <svg v-if="message.role === 'user'" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <span class="text-xs font-medium" :class="message.role === 'user' ? 'text-blue-600' : 'text-green-600'">
                  {{ message.role === 'user' ? '用户' : 'AI助手' }}
                </span>
              </div>
              <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="mt-6 flex justify-center space-x-4">
          <button 
            @click="clearHistory"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            :disabled="chatHistory.length === 0"
          >
            清空记录
          </button>
          <button 
            @click="continueChat"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            继续对话
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchChatHistory } from '~/api/chat'

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
const loadChatHistory = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetchChatHistory()
    
    if (response.data.success) {
      chatHistory.value = response.data.data.messages || []
      sessionInfo.value = {
        session_id: response.data.data.session_id,
        score: response.data.data.score
      }
    } else {
      throw new Error(response.data.message || '获取聊天记录失败')
    }
  } catch (err) {
    console.error('加载聊天记录失败:', err)
    error.value = err.message || '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

const clearHistory = async () => {
  if (!confirm('确定要清空所有对话记录吗？此操作不可撤销。')) {
    return
  }
  
  try {
    // 调用清空API
    const response = await $fetch('/api/chat/sessions/', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${useCookie('access_token').value}`
      }
    })
    
    if (response.success) {
      chatHistory.value = []
      sessionInfo.value.score = 70
      alert('对话记录已清空')
    }
  } catch (err) {
    console.error('清空记录失败:', err)
    alert('清空失败，请稍后重试')
  }
}

const continueChat = () => {
  navigateTo('/ai-test/chat')
}

const goBack = () => {
  router.back()
}

const getScoreClass = (score) => {
  if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  if (score >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

const getMessageClass = (role) => {
  return role === 'user' 
    ? 'bg-blue-500 text-white'
    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
}

const getAvatarClass = (role) => {
  return role === 'user' 
    ? 'bg-blue-500'
    : 'bg-green-500'
}

// 生命周期
onMounted(() => {
  loadChatHistory()
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