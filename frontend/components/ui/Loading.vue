<template>
  <div class="loading-container" :class="containerClass">
    <!-- 旋转加载器 -->
    <div v-if="type === 'spinner'" class="loading-spinner" :class="sizeClass">
      <div class="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
    </div>

    <!-- 脉冲加载器 -->
    <div v-else-if="type === 'pulse'" class="loading-pulse" :class="sizeClass">
      <div class="animate-pulse bg-blue-600 rounded-full"></div>
    </div>

    <!-- 弹跳加载器 -->
    <div v-else-if="type === 'bounce'" class="loading-bounce flex space-x-1" :class="sizeClass">
      <div class="animate-bounce bg-blue-600 rounded-full" style="animation-delay: 0s"></div>
      <div class="animate-bounce bg-blue-600 rounded-full" style="animation-delay: 0.1s"></div>
      <div class="animate-bounce bg-blue-600 rounded-full" style="animation-delay: 0.2s"></div>
    </div>

    <!-- 点状加载器 -->
    <div v-else-if="type === 'dots'" class="loading-dots" :class="colorClass">
      <span class="loading-dots"></span>
    </div>

    <!-- 进度条加载器 -->
    <div v-else-if="type === 'progress'" class="loading-progress w-full" :class="sizeClass">
      <div class="progress-bar bg-gray-200 rounded-full overflow-hidden">
        <div 
          class="h-full bg-blue-600 transition-all duration-300 ease-out"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <!-- 骨架屏加载器 -->
    <div v-else-if="type === 'skeleton'" class="loading-skeleton space-y-3">
      <div class="skeleton h-4 rounded" :class="sizeClass"></div>
      <div class="skeleton h-4 rounded w-3/4" :class="sizeClass"></div>
      <div class="skeleton h-4 rounded w-1/2" :class="sizeClass"></div>
    </div>

    <!-- 默认旋转加载器 -->
    <div v-else class="loading-spinner" :class="sizeClass">
      <div class="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
    </div>

    <!-- 加载文本 -->
    <div v-if="text" class="loading-text mt-3 text-center" :class="textClass">
      {{ text }}
    </div>
  </div>
</template>

<script setup>
interface Props {
  type?: 'spinner' | 'pulse' | 'bounce' | 'dots' | 'progress' | 'skeleton'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'
  text?: string
  progress?: number
  fullscreen?: boolean
  overlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'spinner',
  size: 'md',
  color: 'blue',
  progress: 0,
  fullscreen: false,
  overlay: false
})

// 计算样式类
const containerClass = computed(() => {
  const classes = ['flex', 'flex-col', 'items-center', 'justify-center']
  
  if (props.fullscreen) {
    classes.push('fixed', 'inset-0', 'z-50')
  }
  
  if (props.overlay) {
    classes.push('bg-white', 'bg-opacity-80', 'backdrop-blur-sm')
  }
  
  return classes
})

const sizeClass = computed(() => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  return sizeMap[props.size]
})

const colorClass = computed(() => {
  const colorMap = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  }
  return colorMap[props.color]
})

const textClass = computed(() => {
  const textSizeMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }
  return [textSizeMap[props.size], props.color ? `text-${props.color}-600` : 'text-gray-600']
})
</script>

<style scoped>
.loading-bounce > div {
  width: 0.5rem;
  height: 0.5rem;
}

.loading-bounce.w-8 > div {
  width: 0.75rem;
  height: 0.75rem;
}

.loading-bounce.w-12 > div {
  width: 1rem;
  height: 1rem;
}

.loading-bounce.w-16 > div {
  width: 1.25rem;
  height: 1.25rem;
}

.loading-progress.w-4 {
  height: 0.25rem;
}

.loading-progress.w-8 {
  height: 0.5rem;
}

.loading-progress.w-12 {
  height: 0.75rem;
}

.loading-progress.w-16 {
  height: 1rem;
}
</style>