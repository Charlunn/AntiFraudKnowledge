<template>
  <div class="quiz-start-page fadeInUp">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state pulse">
      <div class="loading-spinner"></div>
      <p>正在加载测验...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state fadeInDown">
      <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500" />
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="initializeQuiz" class="btn btn-primary hover-lift">重试</button>
    </div>
    
    <!-- 测验界面 -->
    <div v-else-if="quiz && !quizCompleted" class="quiz-interface">
      <!-- 测验头部 -->
      <div class="quiz-header slideInDown">
        <div class="quiz-info fadeInLeft">
          <h1 class="quiz-title">{{ quiz.title }}</h1>
          <div class="quiz-progress">
            <span class="progress-text">
              第 {{ currentQuestionIndex + 1 }} 题 / 共 {{ quiz.questions.length }} 题
            </span>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="quiz-controls fadeInRight">
          <!-- 时间倒计时 -->
          <div class="timer hover-lift" :class="{ 'timer-warning': timeRemaining < 300 }">
            <Icon name="heroicons:clock" class="w-5 h-5" />
            <span class="timer-text">{{ formatTime(timeRemaining) }}</span>
          </div>
          
          <!-- 退出按钮 -->
          <button @click="confirmExit" class="btn btn-secondary btn-sm hover-lift">
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
            退出
          </button>
        </div>
      </div>
      
      <!-- 当前题目 -->
      <div class="question-container">
        <div class="question-card">
          <div class="question-header">
            <div class="question-type">
              {{ getQuestionTypeLabel(currentQuestion.type) }}
            </div>
            <div class="question-points">
              {{ currentQuestion.points }} 分
            </div>
          </div>
          
          <div class="question-content">
            <h2 class="question-text">{{ currentQuestion.question }}</h2>
            
            <!-- 题目描述或提示 -->
            <div v-if="currentQuestion.description" class="question-description">
              {{ currentQuestion.description }}
            </div>
            
            <!-- 题目图片 -->
            <div v-if="currentQuestion.image" class="question-image">
              <img :src="currentQuestion.image" :alt="currentQuestion.question" />
            </div>
          </div>
          
          <!-- 答案选项 -->
          <div class="answer-options">
            <!-- 单选题 -->
            <div v-if="currentQuestion.type === 'single_choice'" class="options-list">
              <div 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="option-item"
                :class="{ 'selected': selectedAnswers[currentQuestionIndex] === index }"
                @click="selectSingleAnswer(index)"
              >
                <div class="option-radio">
                  <div class="radio-dot" v-if="selectedAnswers[currentQuestionIndex] === index"></div>
                </div>
                <div class="option-content">
                  <div class="option-label">{{ String.fromCharCode(65 + index) }}</div>
                  <div class="option-text">{{ option.text }}</div>
                </div>
              </div>
            </div>
            
            <!-- 多选题 -->
            <div v-else-if="currentQuestion.type === 'multiple_choice'" class="options-list">
              <div 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="option-item"
                :class="{ 'selected': isMultipleAnswerSelected(index) }"
                @click="toggleMultipleAnswer(index)"
              >
                <div class="option-checkbox">
                  <Icon 
                    v-if="isMultipleAnswerSelected(index)" 
                    name="heroicons:check" 
                    class="w-4 h-4 text-white" 
                  />
                </div>
                <div class="option-content">
                  <div class="option-label">{{ String.fromCharCode(65 + index) }}</div>
                  <div class="option-text">{{ option.text }}</div>
                </div>
              </div>
            </div>
            
            <!-- 判断题 -->
            <div v-else-if="currentQuestion.type === 'true_false'" class="true-false-options">
              <div 
                class="option-item"
                :class="{ 'selected': selectedAnswers[currentQuestionIndex] === true }"
                @click="selectTrueFalse(true)"
              >
                <div class="option-radio">
                  <div class="radio-dot" v-if="selectedAnswers[currentQuestionIndex] === true"></div>
                </div>
                <div class="option-content">
                  <div class="option-text">正确</div>
                </div>
              </div>
              <div 
                class="option-item"
                :class="{ 'selected': selectedAnswers[currentQuestionIndex] === false }"
                @click="selectTrueFalse(false)"
              >
                <div class="option-radio">
                  <div class="radio-dot" v-if="selectedAnswers[currentQuestionIndex] === false"></div>
                </div>
                <div class="option-content">
                  <div class="option-text">错误</div>
                </div>
              </div>
            </div>
            
            <!-- 填空题 -->
            <div v-else-if="currentQuestion.type === 'fill_blank'" class="fill-blank-input">
              <textarea 
                v-model="selectedAnswers[currentQuestionIndex]"
                placeholder="请输入您的答案..."
                class="answer-textarea"
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>
        
        <!-- 导航按钮 -->
        <div class="question-navigation">
          <button 
            @click="previousQuestion" 
            :disabled="currentQuestionIndex === 0"
            class="btn btn-secondary"
          >
            <Icon name="heroicons:chevron-left" class="w-4 h-4" />
            上一题
          </button>
          
          <div class="nav-info">
            <span class="answered-count">
              已答题: {{ answeredCount }} / {{ quiz.questions.length }}
            </span>
          </div>
          
          <button 
            v-if="currentQuestionIndex < quiz.questions.length - 1"
            @click="nextQuestion" 
            class="btn btn-primary"
          >
            下一题
            <Icon name="heroicons:chevron-right" class="w-4 h-4" />
          </button>
          
          <button 
            v-else
            @click="confirmSubmit" 
            class="btn btn-success"
            :disabled="answeredCount === 0"
          >
            <Icon name="heroicons:check" class="w-4 h-4" />
            提交测验
          </button>
        </div>
      </div>
      
      <!-- 题目导航面板 -->
      <div class="question-panel">
        <div class="panel-header">
          <h3>题目导航</h3>
          <button @click="toggleQuestionPanel" class="panel-toggle">
            <Icon name="heroicons:chevron-up" class="w-4 h-4" />
          </button>
        </div>
        <div class="panel-content">
          <div class="question-grid">
            <button 
              v-for="(question, index) in quiz.questions" 
              :key="index"
              class="question-nav-btn"
              :class="{
                'current': index === currentQuestionIndex,
                'answered': hasAnswer(index),
                'unanswered': !hasAnswer(index)
              }"
              @click="goToQuestion(index)"
            >
              {{ index + 1 }}
            </button>
          </div>
          <div class="panel-legend">
            <div class="legend-item">
              <div class="legend-dot current"></div>
              <span>当前题目</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot answered"></div>
              <span>已答题</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot unanswered"></div>
              <span>未答题</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 测验完成 -->
    <div v-else-if="quizCompleted" class="quiz-completed">
      <div class="completion-card">
        <div class="completion-icon">
          <Icon name="heroicons:check-circle" class="w-16 h-16 text-green-500" />
        </div>
        <h2>测验已提交</h2>
        <p>您的答案已成功提交，正在计算成绩...</p>
        <div class="completion-actions">
          <button @click="viewResults" class="btn btn-primary">
            查看结果
          </button>
          <button @click="goToQuizList" class="btn btn-secondary">
            返回测验列表
          </button>
        </div>
      </div>
    </div>
    
    <!-- 确认对话框 -->
    <div v-if="showConfirmDialog" class="modal-overlay" @click="closeConfirmDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ confirmDialog.title }}</h3>
          <button @click="closeConfirmDialog" class="modal-close">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        <div class="modal-body">
          <p>{{ confirmDialog.message }}</p>
          <div v-if="confirmDialog.type === 'submit'" class="submit-summary">
            <div class="summary-item">
              <span>已答题目:</span>
              <span>{{ answeredCount }} / {{ quiz?.questions.length || 0 }}</span>
            </div>
            <div class="summary-item">
              <span>未答题目:</span>
              <span>{{ (quiz?.questions.length || 0) - answeredCount }}</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeConfirmDialog" class="btn btn-secondary">
            取消
          </button>
          <button @click="confirmAction" class="btn btn-primary">
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 设置页面布局和认证中间件
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// 路由参数
const route = useRoute()
const quizId = route.params.id

// 页面元数据
useHead({
  title: '进行测验 - 反欺诈知识图谱系统',
  meta: [
    { name: 'description', content: '在线知识测验答题' }
  ]
})

// 响应式数据
const loading = ref(false)
const error = ref(null)
const quiz = ref(null)
const currentQuestionIndex = ref(0)
const selectedAnswers = ref({})
const timeRemaining = ref(0)
const quizCompleted = ref(false)
const showConfirmDialog = ref(false)
const confirmDialog = ref({
  type: '',
  title: '',
  message: ''
})

// 定时器
let timer = null

// 模拟测验数据
const mockQuiz = {
  id: 1,
  title: '反欺诈基础知识测验',
  time_limit: 30, // 分钟
  questions: [
    {
      id: 1,
      type: 'single_choice',
      question: '以下哪种行为属于信用卡欺诈？',
      description: '请选择最准确的答案',
      points: 5,
      options: [
        { text: '使用自己的信用卡进行正常消费', correct: false },
        { text: '盗用他人信用卡信息进行消费', correct: true },
        { text: '向银行申请提高信用额度', correct: false },
        { text: '按时还款信用卡账单', correct: false }
      ]
    },
    {
      id: 2,
      type: 'multiple_choice',
      question: '常见的网络欺诈手段包括哪些？',
      description: '可以选择多个答案',
      points: 8,
      options: [
        { text: '钓鱼邮件', correct: true },
        { text: '虚假网站', correct: true },
        { text: '正常的银行官网', correct: false },
        { text: '电话诈骗', correct: true },
        { text: '合法的在线支付', correct: false }
      ]
    },
    {
      id: 3,
      type: 'true_false',
      question: '所有的异常交易都是欺诈行为。',
      description: '请判断这个说法是否正确',
      points: 3,
      correct_answer: false
    },
    {
      id: 4,
      type: 'fill_blank',
      question: '请简述什么是反洗钱，以及它在反欺诈中的作用。',
      description: '请用自己的话回答，不少于50字',
      points: 10
    },
    {
      id: 5,
      type: 'single_choice',
      question: '在进行风险评估时，以下哪个因素最重要？',
      points: 5,
      options: [
        { text: '交易金额', correct: false },
        { text: '用户历史行为模式', correct: true },
        { text: '交易时间', correct: false },
        { text: '支付方式', correct: false }
      ]
    }
  ]
}

// 计算属性
const currentQuestion = computed(() => {
  return quiz.value?.questions[currentQuestionIndex.value]
})

const answeredCount = computed(() => {
  return Object.keys(selectedAnswers.value).length
})

// 方法
const initializeQuiz = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await getQuizDetail(quizId)
    quiz.value = response
    
    // 初始化时间
    timeRemaining.value = quiz.value.time_limit * 60 // 转换为秒
    
    // 启动计时器
    startTimer()
    
    // 更新页面标题
    useHead({
      title: `${quiz.value.title} - 进行测验`
    })
    
    showToast('测验加载成功', 'success')
  } catch (err) {
    error.value = '加载测验失败'
    showToast('加载测验失败', 'error')
    console.error('Failed to initialize quiz:', err)
  } finally {
    loading.value = false
  }
}

const startTimer = () => {
  timer = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      // 时间到，自动提交
      autoSubmitQuiz()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
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

const selectSingleAnswer = (optionIndex) => {
  selectedAnswers.value[currentQuestionIndex.value] = optionIndex
}

const isMultipleAnswerSelected = (optionIndex) => {
  const answers = selectedAnswers.value[currentQuestionIndex.value] || []
  return answers.includes(optionIndex)
}

const toggleMultipleAnswer = (optionIndex) => {
  if (!selectedAnswers.value[currentQuestionIndex.value]) {
    selectedAnswers.value[currentQuestionIndex.value] = []
  }
  
  const answers = selectedAnswers.value[currentQuestionIndex.value]
  const index = answers.indexOf(optionIndex)
  
  if (index > -1) {
    answers.splice(index, 1)
  } else {
    answers.push(optionIndex)
  }
}

const selectTrueFalse = (value) => {
  selectedAnswers.value[currentQuestionIndex.value] = value
}

const hasAnswer = (questionIndex) => {
  const answer = selectedAnswers.value[questionIndex]
  if (answer === undefined || answer === null) return false
  if (Array.isArray(answer)) return answer.length > 0
  if (typeof answer === 'string') return answer.trim().length > 0
  return true
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < quiz.value.questions.length - 1) {
    currentQuestionIndex.value++
  }
}

const goToQuestion = (index) => {
  currentQuestionIndex.value = index
}

const toggleQuestionPanel = () => {
  // 实现面板折叠/展开逻辑
}

const confirmExit = () => {
  confirmDialog.value = {
    type: 'exit',
    title: '确认退出',
    message: '您确定要退出测验吗？当前进度将不会保存。'
  }
  showConfirmDialog.value = true
}

const confirmSubmit = () => {
  confirmDialog.value = {
    type: 'submit',
    title: '确认提交',
    message: '您确定要提交测验吗？提交后将无法修改答案。'
  }
  showConfirmDialog.value = true
}

const closeConfirmDialog = () => {
  showConfirmDialog.value = false
}

const confirmAction = () => {
  if (confirmDialog.value.type === 'exit') {
    exitQuiz()
  } else if (confirmDialog.value.type === 'submit') {
    submitQuiz()
  }
  closeConfirmDialog()
}

const exitQuiz = () => {
  stopTimer()
  navigateTo(`/quiz/${quizId}`)
}

const submitQuiz = async () => {
  try {
    stopTimer()
    
    const response = await submitQuizAnswers(quizId, {
      answers: selectedAnswers.value,
      time_spent: (quiz.value.time_limit * 60) - timeRemaining.value
    })
    
    quizCompleted.value = true
    showToast('测验提交成功', 'success')
    
    // 跳转到结果页面
    await navigateTo(`/quiz/${quizId}/results`)
  } catch (err) {
    showToast('提交测验失败', 'error')
    console.error('Failed to submit quiz:', err)
  }
}

const autoSubmitQuiz = () => {
  // 时间到自动提交
  submitQuiz()
}

const viewResults = () => {
  navigateTo(`/quiz/${quizId}/results`)
}

const goToQuizList = () => {
  navigateTo('/quiz')
}

// 生命周期
onMounted(() => {
  initializeQuiz()
})

onUnmounted(() => {
  stopTimer()
})

// 页面离开前确认
const beforeUnload = (event) => {
  if (!quizCompleted.value) {
    event.preventDefault()
    event.returnValue = '您的测验进度将丢失，确定要离开吗？'
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', beforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>

<style scoped>
.quiz-start-page {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

.loading-state,
.error-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mb-4;
}

.quiz-interface {
  @apply max-w-6xl mx-auto p-6;
}

.quiz-header {
  @apply bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700
         flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6;
}

.quiz-info {
  @apply flex-1;
}

.quiz-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-3;
}

.quiz-progress {
  @apply space-y-2;
}

.progress-text {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.progress-bar {
  @apply w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2;
}

.progress-fill {
  @apply bg-primary-600 h-2 rounded-full transition-all duration-300;
}

.quiz-controls {
  @apply flex items-center gap-4;
}

.timer {
  @apply flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg
         text-gray-700 dark:text-gray-300;
}

.timer-warning {
  @apply bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300;
}

.timer-text {
  @apply font-mono font-medium;
}

.question-container {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-6;
}

.question-card {
  @apply lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm 
         border border-gray-200 dark:border-gray-700;
}

.question-header {
  @apply flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700;
}

.question-type {
  @apply text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900
         px-3 py-1 rounded-full;
}

.question-points {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400;
}

.question-content {
  @apply mb-8;
}

.question-text {
  @apply text-xl font-semibold text-gray-900 dark:text-white mb-4 leading-relaxed;
}

.question-description {
  @apply text-gray-600 dark:text-gray-400 mb-4;
}

.question-image {
  @apply mb-6;
}

.question-image img {
  @apply max-w-full h-auto rounded-lg shadow-sm;
}

.answer-options {
  @apply space-y-4;
}

.options-list {
  @apply space-y-3;
}

.option-item {
  @apply flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg
         cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700;
}

.option-item.selected {
  @apply border-primary-500 bg-primary-50 dark:bg-primary-900;
}

.option-radio {
  @apply w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full
         flex items-center justify-center flex-shrink-0 mt-0.5;
}

.option-item.selected .option-radio {
  @apply border-primary-500;
}

.radio-dot {
  @apply w-2.5 h-2.5 bg-primary-500 rounded-full;
}

.option-checkbox {
  @apply w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded
         flex items-center justify-center flex-shrink-0 mt-0.5;
}

.option-item.selected .option-checkbox {
  @apply border-primary-500 bg-primary-500;
}

.option-content {
  @apply flex-1;
}

.option-label {
  @apply inline-block w-6 h-6 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300
         rounded-full text-sm font-medium text-center leading-6 mr-3;
}

.option-item.selected .option-label {
  @apply bg-primary-500 text-white;
}

.option-text {
  @apply text-gray-900 dark:text-white leading-relaxed;
}

.true-false-options {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4;
}

.fill-blank-input {
  @apply space-y-4;
}

.answer-textarea {
  @apply w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-primary-500 focus:border-transparent
         resize-none;
}

.question-navigation {
  @apply flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700;
}

.nav-info {
  @apply text-center;
}

.answered-count {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.question-panel {
  @apply bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700
         h-fit;
}

.panel-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700;
}

.panel-header h3 {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.panel-toggle {
  @apply p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200;
}

.question-grid {
  @apply grid grid-cols-5 gap-2 mb-4;
}

.question-nav-btn {
  @apply w-10 h-10 rounded-lg border-2 font-medium text-sm transition-all
         flex items-center justify-center;
}

.question-nav-btn.current {
  @apply border-primary-500 bg-primary-500 text-white;
}

.question-nav-btn.answered {
  @apply border-green-500 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300;
}

.question-nav-btn.unanswered {
  @apply border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300
         hover:border-gray-400 dark:hover:border-gray-500;
}

.panel-legend {
  @apply flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400;
}

.legend-item {
  @apply flex items-center gap-2;
}

.legend-dot {
  @apply w-3 h-3 rounded-full;
}

.legend-dot.current {
  @apply bg-primary-500;
}

.legend-dot.answered {
  @apply bg-green-500;
}

.legend-dot.unanswered {
  @apply bg-gray-300 dark:bg-gray-600;
}

.quiz-completed {
  @apply flex items-center justify-center min-h-screen p-6;
}

.completion-card {
  @apply bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg text-center max-w-md;
}

.completion-icon {
  @apply mb-6;
}

.completion-card h2 {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-4;
}

.completion-card p {
  @apply text-gray-600 dark:text-gray-400 mb-8;
}

.completion-actions {
  @apply flex flex-col sm:flex-row gap-3 justify-center;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.modal-header h3 {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.modal-close {
  @apply p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200;
}

.modal-body {
  @apply p-6;
}

.modal-body p {
  @apply text-gray-700 dark:text-gray-300 mb-4;
}

.submit-summary {
  @apply bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2;
}

.summary-item {
  @apply flex justify-between text-sm;
}

.modal-actions {
  @apply flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-700;
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

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700 focus:ring-green-500;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>