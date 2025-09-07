<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-dark-bg dark:to-dark-surface">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-dark-text mb-4">
          AI 智能测试
        </h1>
        <p class="text-xl text-gray-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
          利用人工智能技术，为您提供个性化的反欺诈知识测试和评估
        </p>
      </div>

      <!-- 功能卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <!-- 智能问答 -->
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-dark-text">智能问答</h3>
          </div>
          <p class="text-gray-600 dark:text-dark-text-secondary mb-4">
            与AI助手对话，获取个性化的反欺诈知识解答和建议
          </p>
          <button 
            @click="startChat"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            开始对话
          </button>
        </div>

        <!-- 智能评估 -->
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-dark-text">智能评估</h3>
          </div>
          <p class="text-gray-600 dark:text-dark-text-secondary mb-4">
            AI分析您的知识水平，生成个性化的学习建议和改进方案
          </p>
          <button 
            @click="startAssessment"
            class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            开始评估
          </button>
        </div>

        <!-- 场景模拟 -->
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m4 6V4a3 3 0 000-6m-4 6h6m-7 4v6a3 3 0 003 3h4a3 3 0 003-3v-6M9 10v6a3 3 0 003 3h0a3 3 0 003-3v-6" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-dark-text">场景模拟</h3>
          </div>
          <p class="text-gray-600 dark:text-dark-text-secondary mb-4">
            通过AI生成的真实场景，练习识别和应对各种欺诈手段
          </p>
          <button 
            @click="startSimulation"
            class="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            开始模拟
          </button>
        </div>
      </div>

      <!-- 最近的AI测试记录 -->
      <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-dark-text mb-6">最近的测试记录</h2>
        
        <div v-if="recentTests.length === 0" class="text-center py-8">
          <svg class="w-16 h-16 text-gray-400 dark:text-dark-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-500 dark:text-dark-text-secondary">暂无测试记录</p>
          <p class="text-sm text-gray-400 dark:text-dark-text-secondary mt-2">开始您的第一次AI测试吧！</p>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="test in recentTests" 
            :key="test.id"
            class="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors duration-200"
          >
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="getTestTypeClass(test.type)">
                <component :is="getTestIcon(test.type)" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-dark-text">{{ test.title }}</h3>
                <p class="text-sm text-gray-500 dark:text-dark-text-secondary">{{ formatDate(test.createdAt) }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm font-medium" :class="getScoreClass(test.score)">{{ test.score }}分</span>
              <button 
                @click="viewTestResult(test.id)"
                class="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors duration-200"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { fetchTestRecords } from '~/api/test-records'

// 页面布局
definePageMeta({
  layout: 'default'
})

// 页面元数据
useHead({
  title: 'AI智能测试',
  meta: [
    { name: 'description', content: '利用AI技术进行个性化反欺诈知识测试和评估' }
  ]
})

const router = useRouter()

// 响应式数据
const recentTests = ref([])

// 方法
const startChat = () => {
  // 跳转到AI聊天页面
  navigateTo('/ai-test/chat')
}

const startAssessment = () => {
  // 跳转到AI评估页面
  navigateTo('/ai-test/assessment')
}

const startSimulation = () => {
  // 跳转到场景模拟页面
  navigateTo('/ai-test/simulation')
}

const viewTestResult = (testId) => {
  // 跳转到测试结果页面
  navigateTo(`/ai-test/results/${testId}`)
}

// 加载最近的测试记录
const loadRecentTests = async () => {
  try {
    const response = await fetchTestRecords(1, 2) // 只获取最新的2条记录
    if (response.data && Array.isArray(response.data)) {
      // 转换数据格式以匹配UI需求
      recentTests.value = response.data.map(record => ({
        id: record.id,
        type: getTestTypeFromScenario(record.scenario_type),
        title: getTestTitleFromScenario(record.scenario_type),
        score: record.score,
        createdAt: record.created_at
      }))
    } else {
      recentTests.value = []
    }
  } catch (error) {
    console.error('加载测试记录失败:', error)
    recentTests.value = []
  }
}

// 根据场景类型获取测试类型
const getTestTypeFromScenario = (scenarioType) => {
  const typeMap = {
    'telecom_fraud': 'simulation',
    'pig_butchering': 'simulation',
    'investment_fraud': 'simulation',
    'online_shopping': 'simulation',
    'fake_charity': 'simulation'
  }
  return typeMap[scenarioType] || 'chat'
}

// 根据场景类型获取测试标题
const getTestTitleFromScenario = (scenarioType) => {
  const titleMap = {
    'telecom_fraud': '电信诈骗场景',
    'pig_butchering': '杀猪盘场景',
    'investment_fraud': '投资诈骗场景',
    'online_shopping': '网购诈骗场景',
    'fake_charity': '虚假慈善场景'
  }
  return titleMap[scenarioType] || 'AI反诈骗对话'
}

const getTestTypeClass = (type) => {
  const classes = {
    'chat': 'bg-blue-500',
    'assessment': 'bg-green-500',
    'simulation': 'bg-purple-500'
  }
  return classes[type] || 'bg-gray-500'
}

const getTestIcon = (type) => {
  // 这里应该返回对应的图标组件
  return 'div' // 临时占位
}

const getScoreClass = (score) => {
  if (score >= 90) return 'text-green-600 dark:text-green-400'
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 页面初始化
onMounted(() => {
  loadRecentTests()
})

// 页面激活时刷新数据（从其他页面返回时）
onActivated(() => {
  loadRecentTests()
})
</script>

<style scoped>
/* 组件特定样式 */
</style>