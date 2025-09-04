<template>
  <Teleport to="body">
    <!-- 全局加载遮罩 -->
    <Transition name="loading-overlay">
      <div 
        v-if="isLoading"
        class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm"
        aria-label="页面加载中"
      >
        <div class="text-center">
          <!-- 加载动画 -->
          <div class="relative">
            <!-- 主要加载器 -->
            <div class="loading-spinner mx-auto mb-4"></div>
            
            <!-- 脉冲环 -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="pulse-ring"></div>
              <div class="pulse-ring pulse-ring-delay-1"></div>
              <div class="pulse-ring pulse-ring-delay-2"></div>
            </div>
          </div>
          
          <!-- 加载文本 -->
          <div class="mt-4">
            <h3 class="text-lg font-medium text-neutral-900 dark:text-dark-text mb-2">
              {{ loadingTitle }}
            </h3>
            <p class="text-sm text-neutral-500 dark:text-dark-text-secondary">
              {{ loadingMessage }}
            </p>
            
            <!-- 进度条 -->
            <div v-if="showProgress" class="mt-4 w-64 mx-auto">
              <div class="flex justify-between text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">
                <span>{{ progressText }}</span>
                <span>{{ Math.round(progress) }}%</span>
              </div>
              <div class="w-full bg-neutral-200 dark:bg-dark-border rounded-full h-2 overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300 ease-out"
                  :style="{ width: progress + '%' }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- 取消按钮 -->
          <button 
            v-if="showCancel"
            @click="handleCancel"
            class="mt-6 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-dark-text-secondary hover:text-neutral-800 dark:hover:text-dark-text border border-neutral-300 dark:border-dark-border rounded-md hover:bg-neutral-50 dark:hover:bg-dark-surface transition-colors duration-200"
          >
            取消
          </button>
        </div>
      </div>
    </Transition>
    
    <!-- 页面顶部加载条 -->
    <Transition name="loading-bar">
      <div 
        v-if="showTopBar"
        class="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-primary-500 to-primary-600 transform-gpu"
        :style="{ transform: `translateX(-${100 - topBarProgress}%)` }"
      ></div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '加载中...'
  },
  message: {
    type: String,
    default: '请稍候，正在处理您的请求'
  },
  progress: {
    type: Number,
    default: 0
  },
  progressText: {
    type: String,
    default: '正在加载'
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  showTopBar: {
    type: Boolean,
    default: false
  },
  topBarProgress: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'cancel'])

// 响应式数据
const isLoading = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loadingTitle = computed(() => props.title)
const loadingMessage = computed(() => props.message)
const progress = computed(() => Math.max(0, Math.min(100, props.progress)))

// 全局加载状态管理
const globalLoadingState = ref({
  isLoading: false,
  title: '加载中...',
  message: '请稍候，正在处理您的请求',
  progress: 0,
  progressText: '正在加载',
  showProgress: false,
  showCancel: false,
  showTopBar: false,
  topBarProgress: 0
})

// 方法
const handleCancel = () => {
  emit('cancel')
  isLoading.value = false
}

const show = (options = {}) => {
  Object.assign(globalLoadingState.value, {
    isLoading: true,
    title: '加载中...',
    message: '请稍候，正在处理您的请求',
    progress: 0,
    progressText: '正在加载',
    showProgress: false,
    showCancel: false,
    showTopBar: false,
    topBarProgress: 0,
    ...options
  })
}

const hide = () => {
  globalLoadingState.value.isLoading = false
}

const updateProgress = (progress, text = '') => {
  globalLoadingState.value.progress = progress
  if (text) {
    globalLoadingState.value.progressText = text
  }
}

const showTopBar = (progress = 0) => {
  globalLoadingState.value.showTopBar = true
  globalLoadingState.value.topBarProgress = progress
}

const hideTopBar = () => {
  globalLoadingState.value.showTopBar = false
  globalLoadingState.value.topBarProgress = 0
}

const updateTopBar = (progress) => {
  globalLoadingState.value.topBarProgress = progress
}

// 全局加载服务
const loadingService = {
  show,
  hide,
  updateProgress,
  showTopBar,
  hideTopBar,
  updateTopBar,
  get isLoading() {
    return globalLoadingState.value.isLoading
  }
}

// 注册全局服务
if (process.client) {
  window.$loading = loadingService
}

// 监听全局状态变化
watch(globalLoadingState, (newState) => {
  if (newState.isLoading !== isLoading.value) {
    isLoading.value = newState.isLoading
  }
}, { deep: true })

// 防止页面滚动
watch(isLoading, (loading) => {
  if (process.client) {
    if (loading) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
})

// 清理
onUnmounted(() => {
  if (process.client) {
    document.body.style.overflow = ''
  }
})

// 暴露方法
defineExpose({
  show,
  hide,
  updateProgress,
  showTopBar,
  hideTopBar,
  updateTopBar
})
</script>

<style scoped>
/* 加载遮罩动画 */
.loading-overlay-enter-active,
.loading-overlay-leave-active {
  transition: all 0.3s ease;
}

.loading-overlay-enter-from,
.loading-overlay-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* 顶部加载条动画 */
.loading-bar-enter-active,
.loading-bar-leave-active {
  transition: all 0.3s ease;
}

.loading-bar-enter-from,
.loading-bar-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* 加载动画 */
.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.dark .loading-spinner {
  border-color: #374151;
  border-top-color: #60a5fa;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 脉冲环动画 */
.pulse-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  opacity: 0;
  animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
}

.dark .pulse-ring {
  border-color: #60a5fa;
}

.pulse-ring-delay-1 {
  animation-delay: 0.5s;
}

.pulse-ring-delay-2 {
  animation-delay: 1s;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .loading-spinner {
    width: 48px;
    height: 48px;
    border-width: 3px;
  }
  
  .pulse-ring {
    width: 64px;
    height: 64px;
  }
}
</style>