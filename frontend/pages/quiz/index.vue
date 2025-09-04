<template>
  <div class="quiz-list-page fadeInUp">
    <!-- 页面头部 -->
    <div class="page-header fadeInDown">
      <div class="header-content">
        <h1 class="page-title">反欺诈知识测验</h1>
        <p class="page-description">通过测验检验您的反欺诈知识掌握程度</p>
      </div>
      <div class="header-actions">
        <button @click="refreshQuizzes" class="btn btn-secondary" :disabled="loading">
          <Icon name="heroicons:arrow-path" class="w-4 h-4" />
          {{ loading ? '加载中...' : '刷新' }}
        </button>
        <NuxtLink to="/quiz/create" class="btn btn-primary">
          <Icon name="heroicons:plus" class="w-4 h-4" />
          创建测验
        </NuxtLink>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters-section slideInLeft">
      <div class="search-box">
        <Icon name="heroicons:magnifying-glass" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索测验标题或描述..."
          class="search-input"
          @input="handleSearch"
        />
      </div>
      
      <div class="filter-controls">
        <select v-model="selectedCategory" @change="applyFilters" class="filter-select">
          <option value="">所有分类</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        
        <select v-model="selectedDifficulty" @change="applyFilters" class="filter-select">
          <option value="">所有难度</option>
          <option value="beginner">初级</option>
          <option value="intermediate">中级</option>
          <option value="advanced">高级</option>
        </select>
        
        <select v-model="sortBy" @change="applySorting" class="filter-select">
          <option value="created_at">创建时间</option>
          <option value="title">标题</option>
          <option value="difficulty">难度</option>
          <option value="attempts">参与人数</option>
          <option value="rating">评分</option>
        </select>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">
          <Icon name="heroicons:academic-cap" class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalQuizzes }}</div>
          <div class="stat-label">总测验数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <Icon name="heroicons:users" class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalAttempts }}</div>
          <div class="stat-label">总参与次数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <Icon name="heroicons:chart-bar" class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ averageScore }}%</div>
          <div class="stat-label">平均得分</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <Icon name="heroicons:trophy" class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ userCompletedQuizzes }}</div>
          <div class="stat-label">我的完成数</div>
        </div>
      </div>
    </div>

    <!-- 测验列表 -->
    <div class="quiz-list-section">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载测验列表...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500" />
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <button @click="refreshQuizzes" class="btn btn-primary">重试</button>
      </div>
      
      <div v-else-if="filteredQuizzes.length === 0" class="empty-state">
        <Icon name="heroicons:document-text" class="w-12 h-12 text-gray-400" />
        <h3>暂无测验</h3>
        <p>{{ searchQuery ? '没有找到匹配的测验' : '还没有创建任何测验' }}</p>
        <NuxtLink to="/quiz/create" class="btn btn-primary">创建第一个测验</NuxtLink>
      </div>
      
      <div v-else class="quiz-grid">
        <div
          v-for="quiz in paginatedQuizzes"
          :key="quiz.id"
          class="quiz-card"
          @click="navigateToQuiz(quiz.id)"
        >
          <div class="quiz-card-header">
            <div class="quiz-category">{{ quiz.category }}</div>
            <div class="quiz-difficulty" :class="`difficulty-${quiz.difficulty}`">
              {{ getDifficultyLabel(quiz.difficulty) }}
            </div>
          </div>
          
          <div class="quiz-card-content">
            <h3 class="quiz-title">{{ quiz.title }}</h3>
            <p class="quiz-description">{{ quiz.description }}</p>
            
            <div class="quiz-meta">
              <div class="meta-item">
                <Icon name="heroicons:question-mark-circle" class="w-4 h-4" />
                <span>{{ quiz.question_count }} 题</span>
              </div>
              <div class="meta-item">
                <Icon name="heroicons:clock" class="w-4 h-4" />
                <span>{{ quiz.time_limit }} 分钟</span>
              </div>
              <div class="meta-item">
                <Icon name="heroicons:users" class="w-4 h-4" />
                <span>{{ quiz.attempts }} 人参与</span>
              </div>
            </div>
          </div>
          
          <div class="quiz-card-footer">
            <div class="quiz-stats">
              <div class="stat-item">
                <span class="stat-label">平均分:</span>
                <span class="stat-value">{{ quiz.average_score }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">通过率:</span>
                <span class="stat-value">{{ quiz.pass_rate }}%</span>
              </div>
            </div>
            
            <div class="quiz-actions">
              <button
                v-if="quiz.user_best_score !== null"
                class="btn btn-sm btn-secondary"
                @click.stop="viewResults(quiz.id)"
              >
                查看成绩
              </button>
              <button
                class="btn btn-sm btn-primary"
                @click.stop="startQuiz(quiz.id)"
              >
                {{ quiz.user_best_score !== null ? '重新测试' : '开始测试' }}
              </button>
            </div>
          </div>
          
          <!-- 用户最佳成绩标识 -->
          <div v-if="quiz.user_best_score !== null" class="user-score-badge">
            <Icon name="heroicons:star" class="w-4 h-4" />
            <span>{{ quiz.user_best_score }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination-section">
      <button
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="btn btn-secondary"
      >
        <Icon name="heroicons:chevron-left" class="w-4 h-4" />
        上一页
      </button>
      
      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="currentPage = page"
          :class="['page-btn', { active: page === currentPage }]"
        >
          {{ page }}
        </button>
      </div>
      
      <button
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        class="btn btn-secondary"
      >
        下一页
        <Icon name="heroicons:chevron-right" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuizApi } from '~/composables/useApi'
import { useToast } from '~/composables/useNotification'
import { formatDate } from '~/utils/formatters'
import { QUIZ_DIFFICULTY, QUIZ_CATEGORIES } from '~/constants'

// 页面元数据
useHead({
  title: '知识测验 - 反欺诈知识图谱系统',
  meta: [
    { name: 'description', content: '反欺诈知识测验系统，通过测验检验和提升您的反欺诈知识水平' }
  ]
})

// API和通知
const { getQuizList } = useQuizApi()
const { showToast } = useToast()

// 响应式数据
const loading = ref(false)
const error = ref(null)
const quizzes = ref([])
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedDifficulty = ref('')
const sortBy = ref('created_at')
const currentPage = ref(1)
const pageSize = 12

// 模拟数据
const mockQuizzes = [
  {
    id: 1,
    title: '反欺诈基础知识测验',
    description: '测试您对反欺诈基本概念和原理的理解程度',
    category: '基础知识',
    difficulty: 'beginner',
    question_count: 20,
    time_limit: 30,
    attempts: 156,
    average_score: 78,
    pass_rate: 85,
    user_best_score: 82,
    created_at: '2024-01-15T10:00:00Z',
    rating: 4.5
  },
  {
    id: 2,
    title: '信用卡欺诈检测技术',
    description: '深入了解信用卡欺诈的检测方法和预防策略',
    category: '技术应用',
    difficulty: 'intermediate',
    question_count: 25,
    time_limit: 45,
    attempts: 89,
    average_score: 72,
    pass_rate: 76,
    user_best_score: null,
    created_at: '2024-01-20T14:30:00Z',
    rating: 4.2
  },
  {
    id: 3,
    title: '机器学习在反欺诈中的应用',
    description: '探索机器学习算法在欺诈检测中的实际应用案例',
    category: '机器学习',
    difficulty: 'advanced',
    question_count: 30,
    time_limit: 60,
    attempts: 45,
    average_score: 68,
    pass_rate: 62,
    user_best_score: 75,
    created_at: '2024-01-25T09:15:00Z',
    rating: 4.7
  },
  {
    id: 4,
    title: '网络欺诈识别与防范',
    description: '学习识别和防范各种网络欺诈手段的方法',
    category: '网络安全',
    difficulty: 'intermediate',
    question_count: 22,
    time_limit: 40,
    attempts: 112,
    average_score: 74,
    pass_rate: 81,
    user_best_score: null,
    created_at: '2024-02-01T16:45:00Z',
    rating: 4.3
  },
  {
    id: 5,
    title: '金融风险评估模型',
    description: '掌握金融风险评估的核心模型和评估方法',
    category: '风险管理',
    difficulty: 'advanced',
    question_count: 28,
    time_limit: 50,
    attempts: 67,
    average_score: 71,
    pass_rate: 69,
    user_best_score: 88,
    created_at: '2024-02-05T11:20:00Z',
    rating: 4.6
  },
  {
    id: 6,
    title: '数据挖掘与异常检测',
    description: '运用数据挖掘技术进行异常行为检测和分析',
    category: '数据分析',
    difficulty: 'intermediate',
    question_count: 24,
    time_limit: 35,
    attempts: 93,
    average_score: 76,
    pass_rate: 83,
    user_best_score: null,
    created_at: '2024-02-10T13:10:00Z',
    rating: 4.4
  }
]

// 计算属性
const categories = computed(() => {
  const cats = new Set(quizzes.value.map(quiz => quiz.category))
  return Array.from(cats)
})

const filteredQuizzes = computed(() => {
  let filtered = quizzes.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(quiz => 
      quiz.title.toLowerCase().includes(query) ||
      quiz.description.toLowerCase().includes(query)
    )
  }
  
  // 分类过滤
  if (selectedCategory.value) {
    filtered = filtered.filter(quiz => quiz.category === selectedCategory.value)
  }
  
  // 难度过滤
  if (selectedDifficulty.value) {
    filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty.value)
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      case 'attempts':
        return b.attempts - a.attempts
      case 'rating':
        return b.rating - a.rating
      case 'created_at':
      default:
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredQuizzes.value.length / pageSize))

const paginatedQuizzes = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredQuizzes.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  
  return pages
})

// 统计数据
const totalQuizzes = computed(() => quizzes.value.length)
const totalAttempts = computed(() => quizzes.value.reduce((sum, quiz) => sum + quiz.attempts, 0))
const averageScore = computed(() => {
  const total = quizzes.value.reduce((sum, quiz) => sum + quiz.average_score, 0)
  return Math.round(total / quizzes.value.length)
})
const userCompletedQuizzes = computed(() => 
  quizzes.value.filter(quiz => quiz.user_best_score !== null).length
)

// 方法
const fetchQuizzes = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params = {
      search: searchQuery.value,
      category: selectedCategory.value,
      difficulty: selectedDifficulty.value,
      sort: sortBy.value,
      page: currentPage.value,
      page_size: pageSize
    }
    
    const response = await getQuizList(params)
    quizzes.value = response.results || response
    
    showToast('测验列表加载成功', 'success')
  } catch (err) {
    error.value = '获取测验列表失败: ' + err.message
    showToast('获取测验列表失败', 'error')
    console.error('Failed to fetch quizzes:', err)
    
    // 开发环境下使用模拟数据
    if (process.dev) {
      quizzes.value = mockQuizzes
    }
  } finally {
    loading.value = false
  }
}

const refreshQuizzes = () => {
  fetchQuizzes()
}

const handleSearch = () => {
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const applySorting = () => {
  currentPage.value = 1
}

const getDifficultyLabel = (difficulty) => {
  return QUIZ_DIFFICULTY[difficulty]?.label || difficulty
}

const navigateToQuiz = (quizId) => {
  navigateTo(`/quiz/${quizId}`)
}

const startQuiz = (quizId) => {
  navigateTo(`/quiz/${quizId}/start`)
}

const viewResults = (quizId) => {
  navigateTo(`/quiz/${quizId}/results`)
}

// 生命周期
onMounted(() => {
  fetchQuizzes()
})

// 监听页面变化，重置到第一页
watch([selectedCategory, selectedDifficulty, sortBy], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.quiz-list-page {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

.page-header {
  @apply bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-8;
}

.header-content {
  @apply mb-6;
}

.page-title {
  @apply text-3xl font-bold text-gray-900 dark:text-white mb-2;
}

.page-description {
  @apply text-lg text-gray-600 dark:text-gray-300;
}

.header-actions {
  @apply flex gap-3;
}

.filters-section {
  @apply bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4;
}

.search-box {
  @apply relative mb-4;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5;
}

.search-input {
  @apply w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.filter-controls {
  @apply flex gap-4 flex-wrap;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.stats-section {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6;
}

.stat-card {
  @apply bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700
         flex items-center gap-4;
}

.stat-icon {
  @apply w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center
         text-primary-600 dark:text-primary-400;
}

.stat-content {
  @apply flex-1;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.stat-label {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.quiz-list-section {
  @apply p-6;
}

.loading-state,
.error-state,
.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mb-4;
}

.quiz-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.quiz-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700
         hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden;
}

.quiz-card-header {
  @apply flex justify-between items-center p-4 pb-2;
}

.quiz-category {
  @apply text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900
         px-2 py-1 rounded;
}

.quiz-difficulty {
  @apply text-xs font-medium px-2 py-1 rounded;
}

.difficulty-beginner {
  @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
}

.difficulty-intermediate {
  @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
}

.difficulty-advanced {
  @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
}

.quiz-card-content {
  @apply p-4 pt-2;
}

.quiz-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-2;
}

.quiz-description {
  @apply text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2;
}

.quiz-meta {
  @apply flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400;
}

.meta-item {
  @apply flex items-center gap-1;
}

.quiz-card-footer {
  @apply p-4 pt-0 flex justify-between items-end;
}

.quiz-stats {
  @apply flex flex-col gap-1;
}

.stat-item {
  @apply flex justify-between text-xs;
}

.stat-label {
  @apply text-gray-500 dark:text-gray-400;
}

.stat-value {
  @apply font-medium text-gray-900 dark:text-white;
}

.quiz-actions {
  @apply flex gap-2;
}

.user-score-badge {
  @apply absolute top-2 right-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200
         px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1;
}

.pagination-section {
  @apply flex justify-center items-center gap-2 p-6;
}

.page-numbers {
  @apply flex gap-1;
}

.page-btn {
  @apply px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded
         bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
}

.page-btn.active {
  @apply bg-primary-600 text-white border-primary-600;
}

.btn {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
         focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>