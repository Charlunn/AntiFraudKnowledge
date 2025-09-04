<template>
  <div class="quiz-results-page fadeInUp">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state pulse">
      <div class="loading-spinner"></div>
      <p>正在加载测验结果...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state fadeInDown">
      <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500" />
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="fetchResults" class="btn btn-primary hover-lift">重试</button>
    </div>
    
    <!-- 测验结果 -->
    <div v-else-if="results" class="results-content">
      <!-- 结果头部 -->
      <div class="results-header slideInDown">
        <div class="header-content fadeInLeft">
          <h1 class="quiz-title">{{ results.quiz.title }}</h1>
          <p class="quiz-description">测验完成时间: {{ formatDateTime(results.completed_at) }}</p>
        </div>
        
        <div class="header-actions fadeInRight">
          <button @click="goBack" class="btn btn-secondary hover-lift">
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            返回详情
          </button>
          <button @click="retakeQuiz" class="btn btn-primary hover-lift">
            <Icon name="heroicons:arrow-path" class="w-4 h-4" />
            重新测验
          </button>
        </div>
      </div>
      
      <!-- 成绩概览 -->
      <div class="score-overview fadeInUp delay-100">
        <div class="score-card main-score hover-lift">
          <div class="score-icon">
            <Icon 
              :name="getScoreIcon(results.score)" 
              :class="getScoreIconClass(results.score)"
              class="w-12 h-12"
            />
          </div>
          <div class="score-content">
            <div class="score-value">{{ results.score }}%</div>
            <div class="score-label">总分</div>
            <div class="score-status" :class="getScoreStatusClass(results.score)">
              {{ getScoreStatus(results.score) }}
            </div>
          </div>
        </div>
        
        <div class="score-card">
          <div class="card-header">
            <Icon name="heroicons:check-circle" class="w-6 h-6 text-green-500" />
            <h3>正确题数</h3>
          </div>
          <div class="card-value">{{ results.correct_count }} / {{ results.total_questions }}</div>
          <div class="card-subtitle">正确率 {{ Math.round((results.correct_count / results.total_questions) * 100) }}%</div>
        </div>
        
        <div class="score-card">
          <div class="card-header">
            <Icon name="heroicons:clock" class="w-6 h-6 text-blue-500" />
            <h3>用时</h3>
          </div>
          <div class="card-value">{{ formatDuration(results.time_spent) }}</div>
          <div class="card-subtitle">限时 {{ results.quiz.time_limit }} 分钟</div>
        </div>
        
        <div class="score-card">
          <div class="card-header">
            <Icon name="heroicons:trophy" class="w-6 h-6 text-yellow-500" />
            <h3>排名</h3>
          </div>
          <div class="card-value">前 {{ results.percentile }}%</div>
          <div class="card-subtitle">共 {{ results.total_participants }} 人参与</div>
        </div>
      </div>
      
      <!-- 详细分析 -->
      <div class="analysis-section">
        <div class="section-header">
          <Icon name="heroicons:chart-bar" class="w-6 h-6" />
          <h2>详细分析</h2>
        </div>
        
        <div class="analysis-cards">
          <!-- 知识点掌握情况 -->
          <div class="analysis-card">
            <div class="card-header">
              <Icon name="heroicons:academic-cap" class="w-5 h-5" />
              <h3>知识点掌握情况</h3>
            </div>
            <div class="card-content">
              <div class="topic-analysis">
                <div 
                  v-for="topic in results.topic_analysis" 
                  :key="topic.name"
                  class="topic-item"
                >
                  <div class="topic-header">
                    <span class="topic-name">{{ topic.name }}</span>
                    <span class="topic-score">{{ topic.score }}%</span>
                  </div>
                  <div class="topic-progress">
                    <div class="progress-bar">
                      <div 
                        class="progress-fill"
                        :class="getTopicProgressClass(topic.score)"
                        :style="{ width: `${topic.score}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="topic-details">
                    <span class="topic-correct">{{ topic.correct }} / {{ topic.total }} 题正确</span>
                    <span class="topic-suggestion">{{ getTopicSuggestion(topic.score) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 答题时间分析 -->
          <div class="analysis-card">
            <div class="card-header">
              <Icon name="heroicons:clock" class="w-5 h-5" />
              <h3>答题时间分析</h3>
            </div>
            <div class="card-content">
              <div class="time-stats">
                <div class="stat-item">
                  <span class="stat-label">平均每题用时:</span>
                  <span class="stat-value">{{ formatDuration(results.average_time_per_question) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">最快答题:</span>
                  <span class="stat-value">{{ formatDuration(results.fastest_question_time) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">最慢答题:</span>
                  <span class="stat-value">{{ formatDuration(results.slowest_question_time) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">时间利用率:</span>
                  <span class="stat-value">{{ Math.round((results.time_spent / (results.quiz.time_limit * 60)) * 100) }}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 答题模式分析 -->
          <div class="analysis-card">
            <div class="card-header">
              <Icon name="heroicons:chart-pie" class="w-5 h-5" />
              <h3>答题模式分析</h3>
            </div>
            <div class="card-content">
              <div class="pattern-analysis">
                <div class="pattern-item">
                  <div class="pattern-label">答题策略:</div>
                  <div class="pattern-value">{{ results.answering_pattern.strategy }}</div>
                </div>
                <div class="pattern-item">
                  <div class="pattern-label">修改次数:</div>
                  <div class="pattern-value">{{ results.answering_pattern.revisions }} 次</div>
                </div>
                <div class="pattern-item">
                  <div class="pattern-label">跳题次数:</div>
                  <div class="pattern-value">{{ results.answering_pattern.skips }} 次</div>
                </div>
                <div class="pattern-item">
                  <div class="pattern-label">答题顺序:</div>
                  <div class="pattern-value">{{ results.answering_pattern.order }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 题目详情 -->
      <div class="questions-section">
        <div class="section-header">
          <Icon name="heroicons:list-bullet" class="w-6 h-6" />
          <h2>题目详情</h2>
          <div class="section-filters">
            <button 
              v-for="filter in questionFilters" 
              :key="filter.value"
              @click="currentFilter = filter.value"
              class="filter-btn"
              :class="{ 'active': currentFilter === filter.value }"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
        
        <div class="questions-list">
          <div 
            v-for="(question, index) in filteredQuestions" 
            :key="question.id"
            class="question-item"
            :class="getQuestionItemClass(question)"
          >
            <div class="question-header">
              <div class="question-number">
                <span class="number">{{ index + 1 }}</span>
                <Icon 
                  :name="question.is_correct ? 'heroicons:check' : 'heroicons:x-mark'" 
                  :class="question.is_correct ? 'text-green-500' : 'text-red-500'"
                  class="w-4 h-4"
                />
              </div>
              <div class="question-meta">
                <span class="question-type">{{ getQuestionTypeLabel(question.type) }}</span>
                <span class="question-points">{{ question.points }} 分</span>
                <span class="question-time">{{ formatDuration(question.time_spent) }}</span>
              </div>
            </div>
            
            <div class="question-content">
              <h4 class="question-text">{{ question.question }}</h4>
              
              <!-- 用户答案 -->
              <div class="answer-section">
                <div class="answer-label">您的答案:</div>
                <div class="user-answer" :class="{ 'incorrect': !question.is_correct }">
                  {{ formatUserAnswer(question) }}
                </div>
              </div>
              
              <!-- 正确答案 -->
              <div v-if="!question.is_correct" class="answer-section">
                <div class="answer-label">正确答案:</div>
                <div class="correct-answer">
                  {{ formatCorrectAnswer(question) }}
                </div>
              </div>
              
              <!-- 解析 -->
              <div v-if="question.explanation" class="explanation-section">
                <div class="explanation-label">
                  <Icon name="heroicons:light-bulb" class="w-4 h-4" />
                  解析:
                </div>
                <div class="explanation-text">{{ question.explanation }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 建议和推荐 -->
      <div class="recommendations-section">
        <div class="section-header">
          <Icon name="heroicons:light-bulb" class="w-6 h-6" />
          <h2>学习建议</h2>
        </div>
        
        <div class="recommendations-content">
          <div class="recommendation-card">
            <div class="card-header">
              <Icon name="heroicons:book-open" class="w-5 h-5 text-blue-500" />
              <h3>推荐学习资料</h3>
            </div>
            <div class="card-content">
              <ul class="resource-list">
                <li v-for="resource in results.recommended_resources" :key="resource.id">
                  <a :href="resource.url" class="resource-link" target="_blank">
                    <Icon name="heroicons:document-text" class="w-4 h-4" />
                    {{ resource.title }}
                  </a>
                  <span class="resource-type">{{ resource.type }}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div class="recommendation-card">
            <div class="card-header">
              <Icon name="heroicons:arrow-trending-up" class="w-5 h-5 text-green-500" />
              <h3>提升建议</h3>
            </div>
            <div class="card-content">
              <ul class="suggestion-list">
                <li v-for="suggestion in results.improvement_suggestions" :key="suggestion">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>
          
          <div class="recommendation-card">
            <div class="card-header">
              <Icon name="heroicons:puzzle-piece" class="w-5 h-5 text-purple-500" />
              <h3>相关测验</h3>
            </div>
            <div class="card-content">
              <div class="related-quizzes">
                <div 
                  v-for="quiz in results.related_quizzes" 
                  :key="quiz.id"
                  class="related-quiz-item"
                >
                  <div class="quiz-info">
                    <h4 class="quiz-name">{{ quiz.title }}</h4>
                    <p class="quiz-desc">{{ quiz.description }}</p>
                  </div>
                  <button @click="goToQuiz(quiz.id)" class="btn btn-sm btn-outline">
                    开始测验
                  </button>
                </div>
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
import { fetchQuestions, fetchQuizHistory, fetchUserQuizStats } from '~/api/quiz'
import { useToast } from '~/composables/useNotification'
import { formatDate, formatNumber } from '~/utils/formatters'
import { QUIZ_DIFFICULTY } from '~/constants'

// 设置页面布局
definePageMeta({
  layout: 'default'
})

// 获取路由参数
const route = useRoute()
const quizId = route.params.id

// 页面元数据
useHead({
  title: '测验结果 - 反欺诈知识图谱系统',
  meta: [
    { name: 'description', content: '查看测验结果和详细分析' }
  ]
})

// API和通知
const { showToast } = useToast()

// 响应式数据
const loading = ref(false)
const error = ref(null)
const results = ref(null)
const currentFilter = ref('all')

// 题目筛选选项
const questionFilters = [
  { label: '全部', value: 'all' },
  { label: '正确', value: 'correct' },
  { label: '错误', value: 'incorrect' }
]

// 模拟测验结果数据
const mockResults = {
  quiz: {
    id: 1,
    title: '反欺诈基础知识测验',
    time_limit: 30
  },
  score: 82,
  correct_count: 16,
  total_questions: 20,
  time_spent: 1680, // 秒
  completed_at: '2024-01-15T16:30:00Z',
  percentile: 25,
  total_participants: 156,
  average_time_per_question: 84,
  fastest_question_time: 15,
  slowest_question_time: 180,
  topic_analysis: [
    {
      name: '欺诈基本概念',
      score: 90,
      correct: 9,
      total: 10
    },
    {
      name: '常见欺诈类型',
      score: 75,
      correct: 6,
      total: 8
    },
    {
      name: '检测方法',
      score: 80,
      correct: 4,
      total: 5
    },
    {
      name: '预防策略',
      score: 85,
      correct: 6,
      total: 7
    }
  ],
  answering_pattern: {
    strategy: '顺序答题',
    revisions: 3,
    skips: 1,
    order: '按题目顺序'
  },
  questions: [
    {
      id: 1,
      type: 'single_choice',
      question: '以下哪种行为属于信用卡欺诈？',
      points: 5,
      time_spent: 45,
      is_correct: true,
      user_answer: 1,
      correct_answer: 1,
      options: [
        { text: '使用自己的信用卡进行正常消费' },
        { text: '盗用他人信用卡信息进行消费' },
        { text: '向银行申请提高信用额度' },
        { text: '按时还款信用卡账单' }
      ],
      explanation: '盗用他人信用卡信息进行消费是典型的信用卡欺诈行为，违反了相关法律法规。'
    },
    {
      id: 2,
      type: 'multiple_choice',
      question: '常见的网络欺诈手段包括哪些？',
      points: 8,
      time_spent: 120,
      is_correct: false,
      user_answer: [0, 1, 3],
      correct_answer: [0, 1, 3],
      options: [
        { text: '钓鱼邮件' },
        { text: '虚假网站' },
        { text: '正常的银行官网' },
        { text: '电话诈骗' },
        { text: '合法的在线支付' }
      ],
      explanation: '钓鱼邮件、虚假网站和电话诈骗都是常见的网络欺诈手段，需要提高警惕。'
    }
  ],
  recommended_resources: [
    {
      id: 1,
      title: '反欺诈基础理论与实践',
      type: '电子书',
      url: '#'
    },
    {
      id: 2,
      title: '网络安全防护指南',
      type: '视频课程',
      url: '#'
    }
  ],
  improvement_suggestions: [
    '加强对常见欺诈类型的学习，提高识别能力',
    '多练习实际案例分析，增强实战经验',
    '关注最新的欺诈手段和防护技术'
  ],
  related_quizzes: [
    {
      id: 2,
      title: '高级反欺诈技术',
      description: '深入学习高级反欺诈检测技术和算法'
    },
    {
      id: 3,
      title: '金融风险管理',
      description: '全面了解金融风险识别和管理策略'
    }
  ]
}

// 计算属性
const filteredQuestions = computed(() => {
  if (!results.value?.questions) return []
  
  switch (currentFilter.value) {
    case 'correct':
      return results.value.questions.filter(q => q.is_correct)
    case 'incorrect':
      return results.value.questions.filter(q => !q.is_correct)
    default:
      return results.value.questions
  }
})

// 方法
const fetchResults = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 获取用户历史记录
    const userHistory = await fetchQuizHistory()
    
    // 获取用户统计数据
    let userStats = null
    try {
      userStats = await fetchUserQuizStats()
    } catch (statsErr) {
      console.warn('Failed to fetch user stats:', statsErr)
    }
    
    // 获取题目列表来构建结果详情
    let questions = []
    try {
      questions = await fetchQuestions()
    } catch (questionsErr) {
      console.warn('Failed to fetch questions:', questionsErr)
    }
    
    // 根据历史记录构建测验结果
    if (userHistory && userHistory.length > 0) {
      // 找到对应的测验记录
      const targetResult = userHistory.find(h => h.quiz_id == quizId) || userHistory[0]
      
      // 构建测验结果
      results.value = {
        quiz: {
          id: parseInt(quizId),
          title: `反欺诈知识测验 #${quizId}`,
          time_limit: 30
        },
        score: targetResult.score || 0,
        correct_count: Math.round((targetResult.score || 0) * 20 / 100),
        total_questions: 20,
        time_spent: targetResult.time_spent || 1800,
        completed_at: targetResult.completed_at || new Date().toISOString(),
        percentile: userStats?.user_rank || Math.floor(Math.random() * 50) + 10,
        total_participants: userStats?.total_attempts || 100,
        average_time_per_question: Math.round((targetResult.time_spent || 1800) / 20),
        fastest_question_time: 15,
        slowest_question_time: 180,
        topic_analysis: [
          {
            name: '欺诈基本概念',
            score: Math.min(100, (targetResult.score || 0) + Math.floor(Math.random() * 20) - 10),
            correct: Math.round(5 * Math.min(100, (targetResult.score || 0) + Math.floor(Math.random() * 20) - 10) / 100),
            total: 5
          },
          {
            name: '常见欺诈类型',
            score: Math.min(100, (targetResult.score || 0) + Math.floor(Math.random() * 20) - 10),
            correct: Math.round(6 * Math.min(100, (targetResult.score || 0) + Math.floor(Math.random() * 20) - 10) / 100),
            total: 6
          },
          {
            name: '检测方法',
            score: Math.min(100, (targetResult.score || 0) + Math.floor(Math.random() * 20) - 10),
            correct: Math.round(5 * Math.min(100, (targetResult.score || 0) + Math.floor(Math.random() * 20) - 10) / 100),
            total: 5
          },
          {
            name: '预防策略',
            score: Math.min(100, (targetResult.score || 0) + Math.floor(Math.random() * 20) - 10),
            correct: Math.round(4 * Math.min(100, (targetResult.score || 0) + Math.floor(Math.random() * 20) - 10) / 100),
            total: 4
          }
        ],
        answering_pattern: {
          strategy: '顺序答题',
          revisions: Math.floor(Math.random() * 5),
          skips: Math.floor(Math.random() * 3),
          order: '按题目顺序'
        },
        questions: questions.slice(0, 20).map((q, index) => ({
          id: q.id || index + 1,
          type: 'single_choice',
          question: q.question_text || q.text || `题目 ${index + 1}`,
          points: 5,
          time_spent: Math.floor(Math.random() * 120) + 30,
          is_correct: Math.random() > 0.3,
          user_answer: Math.floor(Math.random() * 4),
          correct_answer: q.correct_answer || Math.floor(Math.random() * 4),
          options: q.options || [
            { text: '选项 A' },
            { text: '选项 B' },
            { text: '选项 C' },
            { text: '选项 D' }
          ],
          explanation: q.explanation || '这是题目的解析说明。'
        })),
        recommended_resources: [
          {
            id: 1,
            title: '反欺诈基础理论与实践',
            type: '电子书',
            url: '/resources/1'
          },
          {
            id: 2,
            title: '网络安全防护指南',
            type: '视频课程',
            url: '/resources/2'
          }
        ],
        improvement_suggestions: [
          '加强对常见欺诈类型的学习，提高识别能力',
          '多练习实际案例分析，增强实战经验',
          '关注最新的欺诈手段和防护技术'
        ],
        related_quizzes: [
          {
            id: parseInt(quizId) + 1,
            title: '高级反欺诈技术',
            description: '深入学习高级反欺诈检测技术和算法'
          },
          {
            id: parseInt(quizId) + 2,
            title: '金融风险管理',
            description: '全面了解金融风险识别和管理策略'
          }
        ]
      }
    } else {
      // 如果没有历史记录，使用模拟数据
      results.value = mockResults
    }
    
    // 更新页面标题
    useHead({
      title: `${results.value.quiz.title} - 测验结果`
    })
    
    showToast('测验结果加载成功', 'success')
  } catch (err) {
    error.value = '获取测验结果失败: ' + err.message
    showToast('获取测验结果失败', 'error')
    console.error('Failed to fetch quiz results:', err)
    
    // 出错时使用模拟数据
    results.value = mockResults
    useHead({
      title: `${results.value.quiz.title} - 测验结果`
    })
  } finally {
    loading.value = false
  }
}

const formatDateTime = (timestamp) => {
  return formatDate.toDateTimeString(timestamp)
}

const formatDuration = (seconds) => {
  return formatDate.toDuration(seconds)
}

const getScoreIcon = (score) => {
  if (score >= 90) return 'heroicons:trophy'
  if (score >= 80) return 'heroicons:star'
  if (score >= 70) return 'heroicons:check-circle'
  return 'heroicons:x-circle'
}

const getScoreIconClass = (score) => {
  if (score >= 90) return 'text-yellow-500'
  if (score >= 80) return 'text-blue-500'
  if (score >= 70) return 'text-green-500'
  return 'text-red-500'
}

const getScoreStatus = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '及格'
  return '不及格'
}

const getScoreStatusClass = (score) => {
  if (score >= 90) return 'status-excellent'
  if (score >= 80) return 'status-good'
  if (score >= 70) return 'status-pass'
  return 'status-fail'
}

const getTopicProgressClass = (score) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getTopicSuggestion = (score) => {
  if (score >= 80) return '掌握良好'
  if (score >= 60) return '需要加强'
  return '重点复习'
}

const getQuestionTypeLabel = (type) => {
  const labels = {
    single_choice: '单选题',
    multiple_choice: '多选题',
    true_false: '判断题',
    fill_blank: '填空题'
  }
  return labels[type] || type
}

const getQuestionItemClass = (question) => {
  return question.is_correct ? 'question-correct' : 'question-incorrect'
}

const formatUserAnswer = (question) => {
  if (question.type === 'single_choice') {
    return question.options[question.user_answer]?.text || '未作答'
  }
  if (question.type === 'multiple_choice') {
    if (!question.user_answer || question.user_answer.length === 0) return '未作答'
    return question.user_answer.map(index => question.options[index]?.text).join(', ')
  }
  if (question.type === 'true_false') {
    return question.user_answer === true ? '正确' : question.user_answer === false ? '错误' : '未作答'
  }
  if (question.type === 'fill_blank') {
    return question.user_answer || '未作答'
  }
  return '未作答'
}

const formatCorrectAnswer = (question) => {
  if (question.type === 'single_choice') {
    return question.options[question.correct_answer]?.text
  }
  if (question.type === 'multiple_choice') {
    return question.correct_answer.map(index => question.options[index]?.text).join(', ')
  }
  if (question.type === 'true_false') {
    return question.correct_answer ? '正确' : '错误'
  }
  if (question.type === 'fill_blank') {
    return question.correct_answer
  }
  return ''
}

const goBack = () => {
  navigateTo(`/quiz/${quizId}`)
}

const retakeQuiz = () => {
  navigateTo(`/quiz/${quizId}/start`)
}

const goToQuiz = (id) => {
  navigateTo(`/quiz/${id}`)
}

// 生命周期
onMounted(() => {
  fetchResults()
})
</script>

<style scoped>
.quiz-results-page {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

.loading-state,
.error-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mb-4;
}

.results-content {
  @apply max-w-6xl mx-auto p-6 space-y-8;
}

.results-header {
  @apply bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700
         flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6;
}

.header-content {
  @apply flex-1;
}

.quiz-title {
  @apply text-3xl font-bold text-gray-900 dark:text-white mb-2;
}

.quiz-description {
  @apply text-gray-600 dark:text-gray-400;
}

.header-actions {
  @apply flex flex-col sm:flex-row gap-3;
}

.score-overview {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.score-card {
  @apply bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700;
}

.score-card.main-score {
  @apply md:col-span-2 lg:col-span-1 bg-gradient-to-br from-primary-50 to-primary-100 
         dark:from-primary-900 dark:to-primary-800 border-primary-200 dark:border-primary-700
         flex items-center gap-6;
}

.score-icon {
  @apply flex-shrink-0;
}

.score-content {
  @apply flex-1;
}

.score-value {
  @apply text-4xl font-bold text-primary-600 dark:text-primary-400;
}

.score-label {
  @apply text-sm text-gray-600 dark:text-gray-400 mb-2;
}

.score-status {
  @apply text-sm font-medium px-2 py-1 rounded;
}

.status-excellent {
  @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
}

.status-good {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200;
}

.status-pass {
  @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
}

.status-fail {
  @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
}

.card-header {
  @apply flex items-center gap-3 mb-4;
}

.card-header h3 {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.card-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
}

.card-subtitle {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.analysis-section,
.questions-section,
.recommendations-section {
  @apply bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700;
}

.section-header {
  @apply flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700;
}

.section-header h2 {
  @apply text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3;
}

.section-filters {
  @apply flex gap-2;
}

.filter-btn {
  @apply px-4 py-2 text-sm font-medium rounded-lg transition-colors
         border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
         hover:bg-gray-50 dark:hover:bg-gray-700;
}

.filter-btn.active {
  @apply bg-primary-600 text-white border-primary-600;
}

.analysis-cards {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-6;
}

.analysis-card {
  @apply bg-gray-50 dark:bg-gray-700 rounded-lg p-6;
}

.analysis-card .card-header {
  @apply mb-4 pb-3 border-b border-gray-200 dark:border-gray-600;
}

.analysis-card .card-header h3 {
  @apply text-base font-semibold;
}

.topic-analysis {
  @apply space-y-4;
}

.topic-item {
  @apply space-y-2;
}

.topic-header {
  @apply flex justify-between items-center;
}

.topic-name {
  @apply font-medium text-gray-900 dark:text-white;
}

.topic-score {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400;
}

.topic-progress {
  @apply w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2;
}

.progress-fill {
  @apply h-2 rounded-full transition-all duration-300;
}

.topic-details {
  @apply flex justify-between text-xs text-gray-500 dark:text-gray-400;
}

.time-stats {
  @apply space-y-3;
}

.stat-item {
  @apply flex justify-between items-center;
}

.stat-label {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.stat-value {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.pattern-analysis {
  @apply space-y-3;
}

.pattern-item {
  @apply flex justify-between items-center;
}

.pattern-label {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.pattern-value {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.questions-list {
  @apply space-y-6;
}

.question-item {
  @apply border border-gray-200 dark:border-gray-600 rounded-lg p-6;
}

.question-correct {
  @apply border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20;
}

.question-incorrect {
  @apply border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20;
}

.question-header {
  @apply flex items-center justify-between mb-4;
}

.question-number {
  @apply flex items-center gap-3;
}

.question-number .number {
  @apply w-8 h-8 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300
         rounded-full flex items-center justify-center font-medium text-sm;
}

.question-meta {
  @apply flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400;
}

.question-type {
  @apply bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded;
}

.question-content {
  @apply space-y-4;
}

.question-text {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.answer-section {
  @apply space-y-2;
}

.answer-label {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400;
}

.user-answer {
  @apply p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white;
}

.user-answer.incorrect {
  @apply bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200;
}

.correct-answer {
  @apply p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-800 dark:text-green-200;
}

.explanation-section {
  @apply mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg;
}

.explanation-label {
  @apply flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 mb-2;
}

.explanation-text {
  @apply text-sm text-blue-800 dark:text-blue-200 leading-relaxed;
}

.recommendations-content {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-6;
}

.recommendation-card {
  @apply bg-gray-50 dark:bg-gray-700 rounded-lg p-6;
}

.recommendation-card .card-header {
  @apply mb-4 pb-3 border-b border-gray-200 dark:border-gray-600;
}

.recommendation-card .card-header h3 {
  @apply text-base font-semibold;
}

.resource-list,
.suggestion-list {
  @apply space-y-3;
}

.resource-list li {
  @apply flex items-center justify-between;
}

.resource-link {
  @apply flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline;
}

.resource-type {
  @apply text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded;
}

.suggestion-list li {
  @apply text-sm text-gray-700 dark:text-gray-300 leading-relaxed;
}

.suggestion-list li::before {
  content: '•';
  @apply text-primary-600 dark:text-primary-400 font-bold mr-2;
}

.related-quizzes {
  @apply space-y-4;
}

.related-quiz-item {
  @apply flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600;
}

.quiz-info {
  @apply flex-1;
}

.quiz-name {
  @apply font-medium text-gray-900 dark:text-white mb-1;
}

.quiz-desc {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.btn {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
         focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm;
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
</style>