<template>
  <div class="quiz-detail-page fadeInUp">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state pulse">
      <div class="loading-spinner"></div>
      <p>正在加载测验信息...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state fadeInDown">
      <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500" />
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="fetchQuizDetail" class="btn btn-primary hover-lift">重试</button>
    </div>
    
    <!-- 测验详情 -->
    <div v-else-if="quiz" class="quiz-detail-content">
      <!-- 测验头部信息 -->
      <div class="quiz-header fadeInDown">
        <div class="header-content">
          <div class="quiz-meta slideInLeft">
            <span class="quiz-category hover-lift">{{ quiz.category }}</span>
            <span class="quiz-difficulty hover-lift" :class="`difficulty-${quiz.difficulty}`">
              {{ getDifficultyLabel(quiz.difficulty) }}
            </span>
          </div>
          
          <h1 class="quiz-title fadeInUp">{{ quiz.title }}</h1>
          <p class="quiz-description fadeInUp delay-100">{{ quiz.description }}</p>
          
          <div class="quiz-stats slideInUp delay-200">
            <div class="stat-item hover-lift">
              <Icon name="heroicons:question-mark-circle" class="w-5 h-5" />
              <span>{{ quiz.question_count }} 道题目</span>
            </div>
            <div class="stat-item hover-lift">
              <Icon name="heroicons:clock" class="w-5 h-5" />
              <span>{{ quiz.time_limit }} 分钟</span>
            </div>
            <div class="stat-item hover-lift">
              <Icon name="heroicons:users" class="w-5 h-5" />
              <span>{{ quiz.attempts }} 人参与</span>
            </div>
            <div class="stat-item hover-lift">
              <Icon name="heroicons:star" class="w-5 h-5" />
              <span>{{ quiz.rating }} 分评价</span>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="goBack" class="btn btn-secondary">
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            返回列表
          </button>
          <button @click="startQuiz" class="btn btn-primary btn-lg">
            <Icon name="heroicons:play" class="w-5 h-5" />
            {{ quiz.user_best_score !== null ? '重新开始' : '开始测验' }}
          </button>
        </div>
      </div>
      
      <!-- 用户成绩卡片 -->
      <div v-if="quiz.user_best_score !== null" class="user-score-card">
        <div class="score-header">
          <Icon name="heroicons:trophy" class="w-6 h-6 text-yellow-500" />
          <h3>您的最佳成绩</h3>
        </div>
        <div class="score-content">
          <div class="score-value">{{ quiz.user_best_score }}%</div>
          <div class="score-details">
            <div class="detail-item">
              <span class="label">正确率:</span>
              <span class="value">{{ Math.round(quiz.user_best_score * quiz.question_count / 100) }}/{{ quiz.question_count }}</span>
            </div>
            <div class="detail-item">
              <span class="label">用时:</span>
              <span class="value">{{ quiz.user_time_spent || 'N/A' }} 分钟</span>
            </div>
            <div class="detail-item">
              <span class="label">排名:</span>
              <span class="value">前 {{ quiz.user_rank || 'N/A' }}%</span>
            </div>
          </div>
          <button @click="viewDetailedResults" class="btn btn-outline">
            查看详细结果
          </button>
        </div>
      </div>
      
      <!-- 测验信息卡片 -->
      <div class="info-cards">
        <div class="info-card">
          <div class="card-header">
            <Icon name="heroicons:chart-bar" class="w-5 h-5" />
            <h3>统计信息</h3>
          </div>
          <div class="card-content">
            <div class="stat-row">
              <span class="stat-label">平均得分:</span>
              <span class="stat-value">{{ quiz.average_score }}%</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">通过率:</span>
              <span class="stat-value">{{ quiz.pass_rate }}%</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">最高分:</span>
              <span class="stat-value">{{ quiz.highest_score }}%</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">平均用时:</span>
              <span class="stat-value">{{ quiz.average_time }} 分钟</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="card-header">
            <Icon name="heroicons:information-circle" class="w-5 h-5" />
            <h3>测验规则</h3>
          </div>
          <div class="card-content">
            <ul class="rules-list">
              <li>测验时间限制为 {{ quiz.time_limit }} 分钟</li>
              <li>共 {{ quiz.question_count }} 道题目，每题 {{ Math.round(100 / quiz.question_count) }} 分</li>
              <li>{{ quiz.allow_review ? '允许' : '不允许' }}回顾和修改答案</li>
              <li>{{ quiz.show_correct_answers ? '测验结束后会显示' : '不会显示' }}正确答案</li>
              <li>{{ quiz.multiple_attempts ? '允许多次尝试' : '只能尝试一次' }}</li>
              <li>通过分数线: {{ quiz.pass_score }}%</li>
            </ul>
          </div>
        </div>
        
        <div class="info-card">
          <div class="card-header">
            <Icon name="heroicons:book-open" class="w-5 h-5" />
            <h3>知识点覆盖</h3>
          </div>
          <div class="card-content">
            <div class="topics-list">
              <div 
                v-for="topic in quiz.topics" 
                :key="topic.name"
                class="topic-item"
              >
                <span class="topic-name">{{ topic.name }}</span>
                <span class="topic-weight">{{ topic.weight }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最近参与者 -->
      <div class="recent-participants">
        <div class="section-header">
          <Icon name="heroicons:users" class="w-5 h-5" />
          <h3>最近参与者</h3>
        </div>
        <div class="participants-list">
          <div 
            v-for="participant in quiz.recent_participants" 
            :key="participant.id"
            class="participant-item"
          >
            <div class="participant-avatar">
              <img 
                v-if="participant.avatar" 
                :src="participant.avatar" 
                :alt="participant.name"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                {{ participant.name.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="participant-info">
              <div class="participant-name">{{ participant.name }}</div>
              <div class="participant-score">{{ participant.score }}%</div>
            </div>
            <div class="participant-time">{{ formatTime(participant.completed_at) }}</div>
          </div>
        </div>
      </div>
      
      <!-- 评论区 -->
      <div class="comments-section">
        <div class="section-header">
          <Icon name="heroicons:chat-bubble-left-right" class="w-5 h-5" />
          <h3>评论 ({{ quiz.comments?.length || 0 }})</h3>
        </div>
        
        <!-- 添加评论 -->
        <div class="add-comment">
          <textarea 
            v-model="newComment"
            placeholder="分享您对这个测验的看法..."
            class="comment-input"
            rows="3"
          ></textarea>
          <div class="comment-actions">
            <button 
              @click="submitComment" 
              :disabled="!newComment.trim()"
              class="btn btn-primary"
            >
              发表评论
            </button>
          </div>
        </div>
        
        <!-- 评论列表 -->
        <div class="comments-list">
          <div 
            v-for="comment in quiz.comments" 
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-avatar">
              <img 
                v-if="comment.user.avatar" 
                :src="comment.user.avatar" 
                :alt="comment.user.name"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                {{ comment.user.name.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.user.name }}</span>
                <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
              <div class="comment-actions">
                <button class="action-btn">
                  <Icon name="heroicons:hand-thumb-up" class="w-4 h-4" />
                  {{ comment.likes || 0 }}
                </button>
                <button class="action-btn">回复</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuizApi } from '~/composables/useApi'
import { useToast } from '~/composables/useNotification'
import { formatDate } from '~/utils/formatters'
import { QUIZ_DIFFICULTY } from '~/constants'

// 获取路由参数
const route = useRoute()
const quizId = route.params.id

// 页面元数据
useHead({
  title: '测验详情 - 反欺诈知识图谱系统',
  meta: [
    { name: 'description', content: '查看测验详细信息，开始答题或查看历史成绩' }
  ]
})

// API和通知
const { getQuizDetail } = useQuizApi()
const { showToast } = useToast()

// 响应式数据
const loading = ref(false)
const error = ref(null)
const quiz = ref(null)
const newComment = ref('')

// 模拟测验详情数据
const mockQuizDetail = {
  id: 1,
  title: '反欺诈基础知识测验',
  description: '这是一个全面的反欺诈基础知识测验，涵盖了欺诈检测的基本概念、常见类型、预防策略等核心内容。通过本测验，您将能够系统地检验自己对反欺诈领域的理解程度。',
  category: '基础知识',
  difficulty: 'beginner',
  question_count: 20,
  time_limit: 30,
  attempts: 156,
  average_score: 78,
  pass_rate: 85,
  highest_score: 98,
  average_time: 25,
  pass_score: 70,
  rating: 4.5,
  allow_review: true,
  show_correct_answers: true,
  multiple_attempts: true,
  user_best_score: 82,
  user_time_spent: 28,
  user_rank: 25,
  topics: [
    { name: '欺诈基本概念', weight: 25 },
    { name: '常见欺诈类型', weight: 30 },
    { name: '检测方法', weight: 25 },
    { name: '预防策略', weight: 20 }
  ],
  recent_participants: [
    {
      id: 1,
      name: '张三',
      avatar: null,
      score: 95,
      completed_at: '2024-01-15T14:30:00Z'
    },
    {
      id: 2,
      name: '李四',
      avatar: null,
      score: 88,
      completed_at: '2024-01-15T13:45:00Z'
    },
    {
      id: 3,
      name: '王五',
      avatar: null,
      score: 76,
      completed_at: '2024-01-15T12:20:00Z'
    }
  ],
  comments: [
    {
      id: 1,
      user: {
        id: 1,
        name: '张三',
        avatar: null
      },
      content: '这个测验很有帮助，题目设计得很好，涵盖了反欺诈的核心知识点。',
      likes: 5,
      created_at: '2024-01-15T16:00:00Z'
    },
    {
      id: 2,
      user: {
        id: 2,
        name: '李四',
        avatar: null
      },
      content: '难度适中，适合初学者。建议增加一些实际案例分析的题目。',
      likes: 3,
      created_at: '2024-01-15T15:30:00Z'
    }
  ]
}

// 方法
const fetchQuizDetail = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await getQuizDetail(quizId)
    quiz.value = response
    
    // 更新页面标题
    useHead({
      title: `${quiz.value.title} - 反欺诈知识图谱系统`
    })
    
    showToast('测验详情加载成功', 'success')
  } catch (err) {
    error.value = '获取测验详情失败: ' + err.message
    showToast('获取测验详情失败', 'error')
    console.error('Failed to fetch quiz detail:', err)
    
    // 开发环境下使用模拟数据
    if (process.dev) {
      quiz.value = mockQuizDetail
      useHead({
        title: `${quiz.value.title} - 反欺诈知识图谱系统`
      })
    }
  } finally {
    loading.value = false
  }
}

const getDifficultyLabel = (difficulty) => {
  return QUIZ_DIFFICULTY[difficulty]?.label || difficulty
}

const formatTime = (timestamp) => {
  return formatDate.toRelativeTime(timestamp)
}

const goBack = () => {
  navigateTo('/quiz')
}

const startQuiz = () => {
  navigateTo(`/quiz/${quizId}/start`)
}

const viewDetailedResults = () => {
  navigateTo(`/quiz/${quizId}/results`)
}

const submitComment = async () => {
  if (!newComment.value.trim()) {
    showToast('请输入评论内容', 'warning')
    return
  }
  
  try {
    const response = await createQuizComment(quizId, {
      content: newComment.value
    })
    
    quiz.value.comments.unshift(response)
    newComment.value = ''
    
    showToast('评论发表成功', 'success')
  } catch (err) {
    showToast('评论发表失败', 'error')
    console.error('Failed to submit comment:', err)
  }
}

// 生命周期
onMounted(() => {
  fetchQuizDetail()
})
</script>

<style scoped>
.quiz-detail-page {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

.loading-state,
.error-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mb-4;
}

.quiz-detail-content {
  @apply max-w-4xl mx-auto p-6 space-y-8;
}

.quiz-header {
  @apply bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700
         flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6;
}

.header-content {
  @apply flex-1;
}

.quiz-meta {
  @apply flex gap-3 mb-4;
}

.quiz-category {
  @apply text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900
         px-3 py-1 rounded-full;
}

.quiz-difficulty {
  @apply text-sm font-medium px-3 py-1 rounded-full;
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

.quiz-title {
  @apply text-3xl font-bold text-gray-900 dark:text-white mb-4;
}

.quiz-description {
  @apply text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed;
}

.quiz-stats {
  @apply flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400;
}

.stat-item {
  @apply flex items-center gap-2;
}

.header-actions {
  @apply flex flex-col sm:flex-row gap-3;
}

.btn-lg {
  @apply px-6 py-3 text-lg;
}

.user-score-card {
  @apply bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800
         border border-yellow-200 dark:border-yellow-700 rounded-lg p-6;
}

.score-header {
  @apply flex items-center gap-3 mb-4;
}

.score-header h3 {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.score-content {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4;
}

.score-value {
  @apply text-4xl font-bold text-yellow-600 dark:text-yellow-400;
}

.score-details {
  @apply flex flex-col gap-2;
}

.detail-item {
  @apply flex justify-between text-sm;
}

.detail-item .label {
  @apply text-gray-600 dark:text-gray-400;
}

.detail-item .value {
  @apply font-medium text-gray-900 dark:text-white;
}

.info-cards {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-6;
}

.info-card {
  @apply bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700;
}

.card-header {
  @apply flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700;
}

.card-header h3 {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.card-content {
  @apply space-y-3;
}

.stat-row {
  @apply flex justify-between items-center;
}

.stat-label {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.stat-value {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.rules-list {
  @apply space-y-2 text-sm text-gray-600 dark:text-gray-400;
}

.rules-list li {
  @apply flex items-start gap-2;
}

.rules-list li::before {
  content: '•';
  @apply text-primary-600 dark:text-primary-400 font-bold;
}

.topics-list {
  @apply space-y-3;
}

.topic-item {
  @apply flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded;
}

.topic-name {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.topic-weight {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.recent-participants,
.comments-section {
  @apply bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700;
}

.section-header {
  @apply flex items-center gap-3 mb-6 pb-3 border-b border-gray-200 dark:border-gray-700;
}

.section-header h3 {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.participants-list {
  @apply space-y-4;
}

.participant-item {
  @apply flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg;
}

.participant-avatar,
.comment-avatar {
  @apply w-10 h-10 rounded-full overflow-hidden flex-shrink-0;
}

.avatar-img {
  @apply w-full h-full object-cover;
}

.avatar-placeholder {
  @apply w-full h-full bg-primary-600 text-white flex items-center justify-center font-medium;
}

.participant-info {
  @apply flex-1;
}

.participant-name {
  @apply font-medium text-gray-900 dark:text-white;
}

.participant-score {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.participant-time {
  @apply text-xs text-gray-500 dark:text-gray-500;
}

.add-comment {
  @apply mb-6;
}

.comment-input {
  @apply w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-primary-500 focus:border-transparent
         resize-none;
}

.comment-actions {
  @apply flex justify-end mt-3;
}

.comments-list {
  @apply space-y-6;
}

.comment-item {
  @apply flex gap-4;
}

.comment-content {
  @apply flex-1;
}

.comment-header {
  @apply flex items-center gap-3 mb-2;
}

.comment-author {
  @apply font-medium text-gray-900 dark:text-white;
}

.comment-time {
  @apply text-xs text-gray-500 dark:text-gray-500;
}

.comment-text {
  @apply text-gray-700 dark:text-gray-300 mb-3 leading-relaxed;
}

.comment-actions {
  @apply flex gap-4;
}

.action-btn {
  @apply flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400
         hover:text-primary-600 dark:hover:text-primary-400 transition-colors;
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

.btn-outline {
  @apply border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
         hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>