<template>
  <Teleport to="body">
    <!-- 通知容器 -->
    <div 
      class="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="通知"
    >
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white dark:bg-dark-surface shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10"
          :class="getNotificationClasses(notification.type)"
        >
          <div class="p-4">
            <div class="flex items-start">
              <!-- 图标 -->
              <div class="flex-shrink-0">
                <component 
                  :is="getNotificationIcon(notification.type)"
                  class="h-6 w-6"
                  :class="getIconClasses(notification.type)"
                />
              </div>
              
              <!-- 内容 -->
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p 
                  v-if="notification.title"
                  class="text-sm font-medium text-neutral-900 dark:text-dark-text"
                >
                  {{ notification.title }}
                </p>
                <p class="mt-1 text-sm text-neutral-500 dark:text-dark-text-secondary">
                  {{ notification.message }}
                </p>
                
                <!-- 操作按钮 -->
                <div v-if="notification.actions" class="mt-3 flex space-x-2">
                  <button
                    v-for="action in notification.actions"
                    :key="action.label"
                    @click="handleAction(notification.id, action)"
                    class="rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
                    :class="action.primary ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 px-3 py-1.5' : 'text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300'"
                  >
                    {{ action.label }}
                  </button>
                </div>
              </div>
              
              <!-- 关闭按钮 -->
              <div class="ml-4 flex flex-shrink-0">
                <button
                  @click="removeNotification(notification.id)"
                  class="inline-flex rounded-md bg-white dark:bg-dark-surface text-neutral-400 dark:text-dark-text-secondary hover:text-neutral-500 dark:hover:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface transition-colors duration-200"
                >
                  <span class="sr-only">关闭</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- 进度条 -->
          <div 
            v-if="notification.duration && notification.duration > 0"
            class="h-1 bg-neutral-200 dark:bg-dark-border overflow-hidden"
          >
            <div 
              class="h-full transition-all ease-linear"
              :class="getProgressClasses(notification.type)"
              :style="{ width: getProgressWidth(notification) + '%', transitionDuration: notification.duration + 'ms' }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, h } from 'vue'
import { useNotification } from '~/composables/useNotification'

// 使用全局通知系统
const { notifications, removeNotification: globalRemoveNotification, clearNotifications, addNotification } = useNotification()

// 通知类型图标映射
const iconMap = {
  success: 'CheckCircleIcon',
  error: 'XCircleIcon',
  warning: 'ExclamationTriangleIcon',
  info: 'InformationCircleIcon'
}

// 图标组件 - 使用h函数避免运行时编译
const CheckCircleIcon = {
  render() {
    return h('svg', {
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ])
  }
}

const XCircleIcon = {
  render() {
    return h('svg', {
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ])
  }
}

const ExclamationTriangleIcon = {
  render() {
    return h('svg', {
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
      })
    ])
  }
}

const InformationCircleIcon = {
  render() {
    return h('svg', {
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
      })
    ])
  }
}

// 方法
const getNotificationIcon = (type) => {
  const iconComponents = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }
  return iconComponents[type] || InformationCircleIcon
}

const getNotificationClasses = (type) => {
  const classes = {
    success: 'border-l-4 border-success-500',
    error: 'border-l-4 border-error-500',
    warning: 'border-l-4 border-warning-500',
    info: 'border-l-4 border-primary-500'
  }
  return classes[type] || classes.info
}

const getIconClasses = (type) => {
  const classes = {
    success: 'text-success-500',
    error: 'text-error-500',
    warning: 'text-warning-500',
    info: 'text-primary-500'
  }
  return classes[type] || classes.info
}

const getProgressClasses = (type) => {
  const classes = {
    success: 'bg-success-500',
    error: 'bg-error-500',
    warning: 'bg-warning-500',
    info: 'bg-primary-500'
  }
  return classes[type] || classes.info
}

const getProgressWidth = (notification) => {
  if (!notification.startTime || !notification.duration) return 100
  const elapsed = Date.now() - notification.startTime
  const progress = Math.max(0, 100 - (elapsed / notification.duration) * 100)
  return progress
}

// addNotification现在由全局useNotification提供

const removeNotification = (id) => {
  globalRemoveNotification(id)
}

const clearAllNotifications = () => {
  clearNotifications()
}

const handleAction = (notificationId, action) => {
  if (action.handler) {
    action.handler()
  }
  if (action.closeOnClick !== false) {
    removeNotification(notificationId)
  }
}

// 全局方法注册
const notificationService = {
  success: (message, options = {}) => addNotification({ ...options, type: 'success', message }),
  error: (message, options = {}) => addNotification({ ...options, type: 'error', message }),
  warning: (message, options = {}) => addNotification({ ...options, type: 'warning', message }),
  info: (message, options = {}) => addNotification({ ...options, type: 'info', message }),
  add: addNotification,
  remove: removeNotification,
  clear: clearAllNotifications
}

// 在组件挂载时注册全局服务
onMounted(() => {
  if (process.client) {
    window.$notify = notificationService
  }
})

// 在组件卸载时清理全局服务
onUnmounted(() => {
  if (process.client && window.$notify) {
    delete window.$notify
  }
})

// 暴露方法给父组件
defineExpose({
  addNotification,
  removeNotification,
  clearAllNotifications
})
</script>

<style scoped>
/* 通知动画 */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>