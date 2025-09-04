<template>
  <Teleport to="body">
    <div class="notification-container fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 flex items-start space-x-3"
          :class="getNotificationClass(notification.type)"
        >
          <!-- 图标 -->
          <div class="flex-shrink-0">
            <CheckCircleIcon v-if="notification.type === 'success'" class="w-5 h-5 text-green-500" />
            <ExclamationTriangleIcon v-else-if="notification.type === 'warning'" class="w-5 h-5 text-yellow-500" />
            <XCircleIcon v-else-if="notification.type === 'error'" class="w-5 h-5 text-red-500" />
            <InformationCircleIcon v-else class="w-5 h-5 text-blue-500" />
          </div>

          <!-- 内容 -->
          <div class="flex-1 min-w-0">
            <h4 v-if="notification.title" class="text-sm font-medium text-gray-900 mb-1">
              {{ notification.title }}
            </h4>
            <p class="text-sm text-gray-600">
              {{ notification.message }}
            </p>
          </div>

          <!-- 关闭按钮 -->
          <button
            @click="removeNotification(notification.id)"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  persistent?: boolean
}

const notifications = ref<Notification[]>([])
const timers = new Map<string, NodeJS.Timeout>()

// 添加通知
const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  const newNotification: Notification = {
    id,
    duration: 5000,
    ...notification
  }

  notifications.value.push(newNotification)

  // 自动移除（除非是持久化通知）
  if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
    const timer = setTimeout(() => {
      removeNotification(id)
    }, newNotification.duration)
    timers.set(id, timer)
  }

  return id
}

// 移除通知
const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
    
    // 清除定时器
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
  }
}

// 清除所有通知
const clearAll = () => {
  notifications.value = []
  timers.forEach(timer => clearTimeout(timer))
  timers.clear()
}

// 获取通知样式类
const getNotificationClass = (type: Notification['type']) => {
  const classMap = {
    success: 'border-green-500 bg-green-50',
    error: 'border-red-500 bg-red-50',
    warning: 'border-yellow-500 bg-yellow-50',
    info: 'border-blue-500 bg-blue-50'
  }
  return classMap[type] || classMap.info
}

// 暴露方法给外部使用
defineExpose({
  addNotification,
  removeNotification,
  clearAll
})

// 组件卸载时清理定时器
onUnmounted(() => {
  timers.forEach(timer => clearTimeout(timer))
  timers.clear()
})
</script>

<style scoped>
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>