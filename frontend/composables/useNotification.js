// 通知系统管理

import { ref, reactive, computed, nextTick } from 'vue'
import { NOTIFICATION_TYPES, NOTIFICATION_DURATIONS } from '~/constants'

// 全局通知状态
const notifications = ref([])
const notificationId = ref(0)

// 通知类型配置
const notificationConfig = {
  [NOTIFICATION_TYPES.SUCCESS]: {
    icon: 'CheckCircleIcon',
    color: 'green',
    duration: NOTIFICATION_DURATIONS.MEDIUM
  },
  [NOTIFICATION_TYPES.ERROR]: {
    icon: 'XCircleIcon',
    color: 'red',
    duration: NOTIFICATION_DURATIONS.LONG
  },
  [NOTIFICATION_TYPES.WARNING]: {
    icon: 'ExclamationTriangleIcon',
    color: 'yellow',
    duration: NOTIFICATION_DURATIONS.MEDIUM
  },
  [NOTIFICATION_TYPES.INFO]: {
    icon: 'InformationCircleIcon',
    color: 'blue',
    duration: NOTIFICATION_DURATIONS.MEDIUM
  },
  [NOTIFICATION_TYPES.LOADING]: {
    icon: 'ArrowPathIcon',
    color: 'gray',
    duration: 0 // 不自动消失
  }
}

// 主要通知composable
export const useNotification = () => {
  // 添加通知
  const addNotification = (options) => {
    const {
      type = NOTIFICATION_TYPES.INFO,
      title,
      message,
      duration,
      persistent = false,
      actions = [],
      data = null
    } = options

    const config = notificationConfig[type] || notificationConfig[NOTIFICATION_TYPES.INFO]
    const id = ++notificationId.value

    const notification = {
      id,
      type,
      title,
      message,
      icon: config.icon,
      color: config.color,
      duration: duration !== undefined ? duration : config.duration,
      persistent,
      actions,
      data,
      timestamp: Date.now(),
      read: false
    }

    notifications.value.push(notification)

    // 自动移除通知
    if (!persistent && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration)
    }

    return id
  }

  // 移除通知
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  // 清除所有通知
  const clearNotifications = () => {
    notifications.value = []
  }

  // 标记通知为已读
  const markAsRead = (id) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  // 标记所有通知为已读
  const markAllAsRead = () => {
    notifications.value.forEach(n => {
      n.read = true
    })
  }

  // 快捷方法
  const success = (title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title,
      message,
      ...options
    })
  }

  const error = (title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title,
      message,
      ...options
    })
  }

  const warning = (title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title,
      message,
      ...options
    })
  }

  const info = (title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title,
      message,
      ...options
    })
  }

  const loading = (title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.LOADING,
      title,
      message,
      persistent: true,
      ...options
    })
  }

  // 计算属性
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const hasNotifications = computed(() => {
    return notifications.value.length > 0
  })

  const recentNotifications = computed(() => {
    return notifications.value
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
  })

  return {
    // 状态
    notifications: computed(() => notifications.value),
    unreadCount,
    hasNotifications,
    recentNotifications,

    // 方法
    addNotification,
    removeNotification,
    clearNotifications,
    markAsRead,
    markAllAsRead,

    // 快捷方法
    success,
    error,
    warning,
    info,
    loading
  }
}

// Toast通知composable
export const useToast = () => {
  const { success, error, warning, info } = useNotification()

  const showToast = (message, type = NOTIFICATION_TYPES.INFO, duration = NOTIFICATION_DURATIONS.SHORT) => {
    const methods = {
      [NOTIFICATION_TYPES.SUCCESS]: success,
      [NOTIFICATION_TYPES.ERROR]: error,
      [NOTIFICATION_TYPES.WARNING]: warning,
      [NOTIFICATION_TYPES.INFO]: info
    }

    const method = methods[type] || info
    return method('', message, { duration })
  }

  return {
    showToast,
    showSuccess: (message, duration) => showToast(message, NOTIFICATION_TYPES.SUCCESS, duration),
    showError: (message, duration) => showToast(message, NOTIFICATION_TYPES.ERROR, duration),
    showWarning: (message, duration) => showToast(message, NOTIFICATION_TYPES.WARNING, duration),
    showInfo: (message, duration) => showToast(message, NOTIFICATION_TYPES.INFO, duration)
  }
}

// 确认对话框composable
export const useConfirm = () => {
  const confirmDialogs = ref([])
  const dialogId = ref(0)

  const showConfirm = (options) => {
    return new Promise((resolve) => {
      const {
        title = '确认操作',
        message = '您确定要执行此操作吗？',
        confirmText = '确认',
        cancelText = '取消',
        type = 'warning',
        persistent = false
      } = options

      const id = ++dialogId.value
      const dialog = {
        id,
        title,
        message,
        confirmText,
        cancelText,
        type,
        persistent,
        resolve
      }

      confirmDialogs.value.push(dialog)
    })
  }

  const resolveConfirm = (id, result) => {
    const index = confirmDialogs.value.findIndex(d => d.id === id)
    if (index > -1) {
      const dialog = confirmDialogs.value[index]
      dialog.resolve(result)
      confirmDialogs.value.splice(index, 1)
    }
  }

  const closeConfirm = (id) => {
    resolveConfirm(id, false)
  }

  return {
    confirmDialogs: computed(() => confirmDialogs.value),
    showConfirm,
    resolveConfirm,
    closeConfirm
  }
}

// 加载状态管理composable
export const useLoading = () => {
  const loadingStates = reactive({})
  const globalLoading = ref(false)

  const setLoading = (key, loading = true) => {
    if (typeof key === 'boolean') {
      globalLoading.value = key
    } else {
      loadingStates[key] = loading
      if (!loading) {
        delete loadingStates[key]
      }
    }
  }

  const isLoading = (key) => {
    if (key) {
      return !!loadingStates[key]
    }
    return globalLoading.value || Object.keys(loadingStates).length > 0
  }

  const clearLoading = (key) => {
    if (key) {
      delete loadingStates[key]
    } else {
      Object.keys(loadingStates).forEach(k => delete loadingStates[k])
      globalLoading.value = false
    }
  }

  // 异步操作包装器
  const withLoading = async (key, asyncFn) => {
    setLoading(key, true)
    try {
      return await asyncFn()
    } finally {
      setLoading(key, false)
    }
  }

  return {
    loadingStates: computed(() => loadingStates),
    globalLoading: computed(() => globalLoading.value),
    setLoading,
    isLoading,
    clearLoading,
    withLoading
  }
}

// 进度条composable
export const useProgress = () => {
  const progressStates = reactive({})

  const setProgress = (key, progress, total = 100) => {
    progressStates[key] = {
      current: progress,
      total,
      percentage: Math.round((progress / total) * 100)
    }
  }

  const incrementProgress = (key, increment = 1) => {
    if (progressStates[key]) {
      const current = progressStates[key].current + increment
      setProgress(key, current, progressStates[key].total)
    }
  }

  const getProgress = (key) => {
    return progressStates[key] || { current: 0, total: 100, percentage: 0 }
  }

  const clearProgress = (key) => {
    if (key) {
      delete progressStates[key]
    } else {
      Object.keys(progressStates).forEach(k => delete progressStates[k])
    }
  }

  return {
    progressStates: computed(() => progressStates),
    setProgress,
    incrementProgress,
    getProgress,
    clearProgress
  }
}

// 消息队列composable
export const useMessageQueue = () => {
  const messageQueue = ref([])
  const processing = ref(false)

  const addMessage = (message, priority = 0) => {
    const queueItem = {
      id: Date.now() + Math.random(),
      message,
      priority,
      timestamp: Date.now()
    }

    messageQueue.value.push(queueItem)
    messageQueue.value.sort((a, b) => b.priority - a.priority)

    processQueue()
  }

  const processQueue = async () => {
    if (processing.value || messageQueue.value.length === 0) {
      return
    }

    processing.value = true

    while (messageQueue.value.length > 0) {
      const item = messageQueue.value.shift()
      
      try {
        if (typeof item.message === 'function') {
          await item.message()
        } else {
          console.log('Processing message:', item.message)
        }
      } catch (error) {
        console.error('Message processing error:', error)
      }

      // 添加延迟以避免过快处理
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    processing.value = false
  }

  const clearQueue = () => {
    messageQueue.value = []
  }

  return {
    messageQueue: computed(() => messageQueue.value),
    processing: computed(() => processing.value),
    addMessage,
    clearQueue
  }
}

// 导出所有通知相关composables
export default {
  useNotification,
  useToast,
  useConfirm,
  useLoading,
  useProgress,
  useMessageQueue
}