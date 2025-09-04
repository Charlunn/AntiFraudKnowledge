<template>
  <div class="tooltip-container relative inline-block" @mouseenter="show" @mouseleave="hide">
    <!-- 触发元素 -->
    <slot></slot>
    
    <!-- 工具提示内容 -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="visible"
          ref="tooltipRef"
          class="tooltip-content fixed z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg pointer-events-none"
          :class="[sizeClass, themeClass]"
          :style="tooltipStyle"
        >
          <!-- 工具提示文本 -->
          <slot name="content">
            {{ content }}
          </slot>
          
          <!-- 箭头 -->
          <div
            v-if="showArrow"
            class="tooltip-arrow absolute w-2 h-2 bg-gray-900 transform rotate-45"
            :class="[arrowClass, themeClass]"
          ></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
interface Props {
  content?: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'
  trigger?: 'hover' | 'click' | 'focus' | 'manual'
  delay?: number
  hideDelay?: number
  disabled?: boolean
  showArrow?: boolean
  size?: 'sm' | 'md' | 'lg'
  theme?: 'dark' | 'light'
  offset?: number
}

interface Emits {
  (e: 'show'): void
  (e: 'hide'): void
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  trigger: 'hover',
  delay: 100,
  hideDelay: 100,
  disabled: false,
  showArrow: true,
  size: 'md',
  theme: 'dark',
  offset: 8
})

const emit = defineEmits<Emits>()

const visible = ref(false)
const tooltipRef = ref(null)
const triggerRef = ref(null)
const showTimer = ref(null)
const hideTimer = ref(null)

// 计算样式类
const sizeClass = computed(() => {
  const sizeMap = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  }
  return sizeMap[props.size]
})

const themeClass = computed(() => {
  const themeMap = {
    dark: 'bg-gray-900 text-white',
    light: 'bg-white text-gray-900 border border-gray-200 shadow-lg'
  }
  return themeMap[props.theme]
})

// 计算工具提示位置
const tooltipStyle = ref({})
const arrowClass = ref('')

const updatePosition = () => {
  if (!tooltipRef.value || !triggerRef.value) return
  
  const trigger = triggerRef.value
  const tooltip = tooltipRef.value
  const triggerRect = trigger.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  
  let top = 0
  let left = 0
  let arrowPosition = ''
  
  const offset = props.offset
  const arrowSize = 4 // 箭头大小的一半
  
  switch (props.placement) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - offset
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      arrowPosition = 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1'
      break
    case 'top-start':
      top = triggerRect.top - tooltipRect.height - offset
      left = triggerRect.left
      arrowPosition = 'top-full left-4 transform -translate-y-1'
      break
    case 'top-end':
      top = triggerRect.top - tooltipRect.height - offset
      left = triggerRect.right - tooltipRect.width
      arrowPosition = 'top-full right-4 transform -translate-y-1'
      break
    case 'bottom':
      top = triggerRect.bottom + offset
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      arrowPosition = 'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1'
      break
    case 'bottom-start':
      top = triggerRect.bottom + offset
      left = triggerRect.left
      arrowPosition = 'bottom-full left-4 transform translate-y-1'
      break
    case 'bottom-end':
      top = triggerRect.bottom + offset
      left = triggerRect.right - tooltipRect.width
      arrowPosition = 'bottom-full right-4 transform translate-y-1'
      break
    case 'left':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.left - tooltipRect.width - offset
      arrowPosition = 'left-full top-1/2 transform -translate-y-1/2 -translate-x-1'
      break
    case 'left-start':
      top = triggerRect.top
      left = triggerRect.left - tooltipRect.width - offset
      arrowPosition = 'left-full top-4 transform -translate-x-1'
      break
    case 'left-end':
      top = triggerRect.bottom - tooltipRect.height
      left = triggerRect.left - tooltipRect.width - offset
      arrowPosition = 'left-full bottom-4 transform -translate-x-1'
      break
    case 'right':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.right + offset
      arrowPosition = 'right-full top-1/2 transform -translate-y-1/2 translate-x-1'
      break
    case 'right-start':
      top = triggerRect.top
      left = triggerRect.right + offset
      arrowPosition = 'right-full top-4 transform translate-x-1'
      break
    case 'right-end':
      top = triggerRect.bottom - tooltipRect.height
      left = triggerRect.right + offset
      arrowPosition = 'right-full bottom-4 transform translate-x-1'
      break
  }
  
  // 确保工具提示在视窗内
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  if (left < 0) left = 8
  if (left + tooltipRect.width > viewportWidth) left = viewportWidth - tooltipRect.width - 8
  if (top < 0) top = 8
  if (top + tooltipRect.height > viewportHeight) top = viewportHeight - tooltipRect.height - 8
  
  tooltipStyle.value = {
    top: `${top + window.scrollY}px`,
    left: `${left + window.scrollX}px`
  }
  
  arrowClass.value = arrowPosition
}

// 显示工具提示
const show = () => {
  if (props.disabled) return
  
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
    hideTimer.value = null
  }
  
  showTimer.value = setTimeout(() => {
    visible.value = true
    emit('show')
    nextTick(() => {
      updatePosition()
    })
  }, props.delay)
}

// 隐藏工具提示
const hide = () => {
  if (showTimer.value) {
    clearTimeout(showTimer.value)
    showTimer.value = null
  }
  
  hideTimer.value = setTimeout(() => {
    visible.value = false
    emit('hide')
  }, props.hideDelay)
}

// 手动控制显示/隐藏
const toggle = () => {
  if (visible.value) {
    hide()
  } else {
    show()
  }
}

// 获取触发元素引用
onMounted(() => {
  const container = document.querySelector('.tooltip-container')
  if (container) {
    triggerRef.value = container
  }
})

// 清理定时器
onUnmounted(() => {
  if (showTimer.value) clearTimeout(showTimer.value)
  if (hideTimer.value) clearTimeout(hideTimer.value)
})

// 暴露方法
defineExpose({
  show,
  hide,
  toggle
})
</script>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.tooltip-arrow {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}
</style>