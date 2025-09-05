<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-text mb-4">AI 场景模拟</h1>
        <p class="text-gray-600 dark:text-dark-text-secondary text-lg">
          通过AI生成的真实场景，练习识别和应对各种欺诈手段
        </p>
      </div>

      <!-- 场景选择 -->
      <div v-if="!selectedScenario" class="space-y-8">
        <!-- 难度选择 -->
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">选择难度等级</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              v-for="level in difficultyLevels"
              :key="level.id"
              @click="selectedDifficulty = level.id"
              :class="[
                'p-4 rounded-lg border-2 transition-all duration-200',
                selectedDifficulty === level.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              ]"
            >
              <div class="text-left">
                <h3 class="font-semibold text-gray-900 dark:text-dark-text">{{ level.name }}</h3>
                <p class="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">{{ level.description }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- 学习模式选择 -->
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">选择学习模式</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              @click="selectedMode = 'mixed'"
              :class="[
                'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                selectedMode === 'mixed'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
              ]"
            >
              <div class="flex items-center mb-2">
                <div class="w-4 h-4 rounded-full mr-3" :class="selectedMode === 'mixed' ? 'bg-green-500' : 'bg-gray-300'"></div>
                <h3 class="font-semibold text-gray-900 dark:text-dark-text">真假混合模式</h3>
              </div>
              <p class="text-sm text-gray-600 dark:text-dark-text-secondary">对话中可能包含真实场景和诈骗行为，需要仔细辨别</p>
            </button>
            <button
              @click="selectedMode = 'pure'"
              :class="[
                'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                selectedMode === 'pure'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
              ]"
            >
              <div class="flex items-center mb-2">
                <div class="w-4 h-4 rounded-full mr-3" :class="selectedMode === 'pure' ? 'bg-red-500' : 'bg-gray-300'"></div>
                <h3 class="font-semibold text-gray-900 dark:text-dark-text">纯假学习模式</h3>
              </div>
              <p class="text-sm text-gray-600 dark:text-dark-text-secondary">AI完全扮演诈骗者角色，全程都是诈骗行为</p>
            </button>
          </div>
        </div>

        <!-- 场景类型选择 -->
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">选择模拟场景</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="scenario in scenarios"
              :key="scenario.id"
              class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800"
              @click="selectScenario(scenario)"
            >
              <div :class="`w-12 h-12 ${scenario.color} rounded-lg flex items-center justify-center mb-4`">
                <span class="text-white text-xl">{{ scenario.icon }}</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">{{ scenario.name }}</h3>
              <p class="text-gray-600 dark:text-dark-text-secondary mb-4">{{ scenario.description }}</p>
              <div class="flex items-center justify-between">
                <span class="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  {{ scenario.estimatedTime }}
                </span>
                <div class="flex items-center space-x-1">
                  <span v-for="i in 5" :key="i" class="w-2 h-2 rounded-full"
                    :class="i <= scenario.difficulty ? 'bg-yellow-400' : 'bg-gray-300'"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 场景详情和开始模拟 -->
      <div v-else class="space-y-6">
        <!-- 返回按钮 -->
        <button
          @click="selectedScenario = null"
          class="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          返回场景选择
        </button>

        <!-- 选中场景的详细信息 -->
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-8">
          <div class="flex items-start space-x-6">
            <div :class="`w-16 h-16 ${selectedScenario.color} rounded-xl flex items-center justify-center flex-shrink-0`">
              <span class="text-white text-2xl">{{ selectedScenario.icon }}</span>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-dark-text mb-2">{{ selectedScenario.name }}</h2>
              <p class="text-gray-600 dark:text-dark-text-secondary mb-4">{{ selectedScenario.fullDescription }}</p>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div class="text-lg font-semibold text-gray-900 dark:text-dark-text">{{ selectedScenario.estimatedTime }}</div>
                  <div class="text-sm text-gray-600 dark:text-dark-text-secondary">预计时长</div>
                </div>
                <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div class="flex justify-center space-x-1 mb-1">
                    <span v-for="i in 5" :key="i" class="w-2 h-2 rounded-full"
                      :class="i <= selectedScenario.difficulty ? 'bg-yellow-400' : 'bg-gray-300'"></span>
                  </div>
                  <div class="text-sm text-gray-600 dark:text-dark-text-secondary">难度等级</div>
                </div>
                <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div class="text-lg font-semibold text-gray-900 dark:text-dark-text">{{ selectedScenario.category }}</div>
                  <div class="text-sm text-gray-600 dark:text-dark-text-secondary">场景类型</div>
                </div>
              </div>

              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text mb-3">学习目标</h3>
                <ul class="space-y-2">
                  <li v-for="objective in selectedScenario.objectives" :key="objective" 
                      class="flex items-start space-x-2">
                    <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-gray-700 dark:text-dark-text-secondary">{{ objective }}</span>
                  </li>
                </ul>
              </div>

              <button
                @click="startSimulation"
                :disabled="!selectedScenario || !selectedDifficulty || !selectedMode || loading"
                class="w-full md:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>{{ loading ? '正在准备场景...' : '开始模拟' }}</span>
              </button>
              <p v-if="!selectedScenario || !selectedDifficulty || !selectedMode" class="text-sm text-gray-500 dark:text-dark-text-secondary mt-2 text-center">
                请选择场景类型、难度等级和学习模式
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 页面元数据
useHead({
  title: 'AI场景模拟 - 反欺诈知识平台'
})

// 响应式数据
const selectedScenario = ref(null)
const selectedDifficulty = ref('medium')
const selectedMode = ref('mixed')
const loading = ref(false)

// 难度等级
const difficultyLevels = [
  {
    id: 'easy',
    name: '初级',
    description: '适合新手，提供更多提示和指导'
  },
  {
    id: 'medium',
    name: '中级',
    description: '标准难度，平衡挑战性和可操作性'
  },
  {
    id: 'hard',
    name: '高级',
    description: '高难度挑战，需要丰富的反诈经验'
  }
]

// 场景数据
const scenarios = [
  {
    id: 'telecom_fraud',
    name: '电信诈骗',
    description: '模拟接到冒充公检法的诈骗电话',
    fullDescription: '在这个场景中，您将接到一个自称是公安局、检察院或法院工作人员的电话。对方会声称您涉嫌某种犯罪活动，需要配合调查或转账自证清白。您需要识别诈骗手段并做出正确应对。',
    icon: '📞',
    color: 'bg-red-500',
    difficulty: 3,
    estimatedTime: '10-15分钟',
    category: '电信诈骗',
    objectives: [
      '识别冒充公检法的诈骗话术',
      '学会正确的应对方式',
      '了解真实的执法程序',
      '掌握自我保护技巧'
    ]
  },
  {
    id: 'investment_fraud',
    name: '网络投资诈骗',
    description: '模拟虚假投资平台诈骗场景',
    fullDescription: '您将遇到一个看似专业的投资顾问，他们会向您推荐高收益、低风险的投资项目。通过精美的APP界面和虚假的盈利数据，诱导您投入资金。您需要识破这些投资陷阱。',
    icon: '💰',
    color: 'bg-yellow-500',
    difficulty: 4,
    estimatedTime: '15-20分钟',
    category: '投资诈骗',
    objectives: [
      '识别虚假投资平台的特征',
      '了解常见的投资诈骗套路',
      '学会验证投资平台的合法性',
      '掌握理性投资的原则'
    ]
  },
  {
    id: 'romance_scam',
    name: '杀猪盘诈骗',
    description: '模拟网络交友投资诈骗场景',
    fullDescription: '您将在社交平台上遇到一个看似完美的异性朋友。经过一段时间的感情培养后，对方会以各种理由诱导您参与投资或直接要求转账。这是典型的"杀猪盘"诈骗手法。',
    icon: '❤️',
    color: 'bg-pink-500',
    difficulty: 5,
    estimatedTime: '20-25分钟',
    category: '情感诈骗',
    objectives: [
      '识别网络交友中的诈骗信号',
      '了解"杀猪盘"的完整流程',
      '学会保护个人隐私和财产',
      '掌握理性交友的方法'
    ]
  },
  {
    id: 'phishing_scam',
    name: '网络钓鱼',
    description: '模拟虚假网站和邮件诈骗',
    fullDescription: '您将收到看似来自银行、支付平台或其他官方机构的邮件或短信，要求您点击链接更新信息或处理紧急事务。您需要识别这些钓鱼攻击并避免泄露个人信息。',
    icon: '🎣',
    color: 'bg-blue-500',
    difficulty: 2,
    estimatedTime: '8-12分钟',
    category: '网络诈骗',
    objectives: [
      '识别钓鱼邮件和短信的特征',
      '学会验证网站的真实性',
      '了解个人信息保护的重要性',
      '掌握安全上网的习惯'
    ]
  },
  {
    id: 'fake_customer_service',
    name: '虚假客服诈骗',
    description: '模拟冒充客服的退款诈骗',
    fullDescription: '您将接到自称是某电商平台或服务商客服的电话，对方声称您的订单有问题需要退款，或者您的账户存在安全风险需要处理。通过这个场景学习如何识别虚假客服。',
    icon: '🎧',
    color: 'bg-green-500',
    difficulty: 3,
    estimatedTime: '12-18分钟',
    category: '客服诈骗',
    objectives: [
      '识别虚假客服的话术特点',
      '学会验证客服身份的方法',
      '了解正规客服的服务流程',
      '掌握保护账户安全的技巧'
    ]
  },
  {
    id: 'loan_scam',
    name: '网络贷款诈骗',
    description: '模拟虚假贷款平台诈骗',
    fullDescription: '您将遇到一个声称可以提供无抵押、低利率贷款的平台。对方会要求您先支付各种费用作为"保证金"或"手续费"，承诺放款后返还。学习识别这类贷款诈骗。',
    icon: '🏦',
    color: 'bg-indigo-500',
    difficulty: 3,
    estimatedTime: '10-15分钟',
    category: '贷款诈骗',
    objectives: [
      '识别虚假贷款平台的特征',
      '了解正规贷款的申请流程',
      '学会评估贷款风险',
      '掌握防范贷款诈骗的方法'
    ]
  }
]

// 方法
const selectScenario = (scenario) => {
  selectedScenario.value = scenario
}

const startSimulation = async () => {
  if (!selectedScenario.value) return
  
  loading.value = true
  
  try {
    // 这里应该调用后端API开始模拟
    // 暂时模拟加载过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 跳转到场景模拟页面，传递参数
    const query = {
      scenario: selectedScenario.value.id,
      difficulty: selectedDifficulty.value,
      mode: selectedMode.value
    }
    
    await navigateTo({
      path: '/ai-test/scenario-chat',
      query: query
    })
  } catch (error) {
    console.error('启动模拟失败:', error)
    // 这里可以添加错误提示
  } finally {
    loading.value = false
  }
}
</script>