<template>
  <div class="min-h-screen bg-muted/40 dark:bg-muted/40">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-foreground dark:text-foreground mb-2">
          通知中心
        </h1>
        <p class="text-muted-foreground dark:text-muted-foreground">
          查看系统通知、学习提醒和社区消息
        </p>
      </div>

      <!-- 通知操作栏 -->
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center space-x-4">
          <button
            @click="markAllAsRead"
            :disabled="unreadCount === 0"
            class="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            全部标记为已读
          </button>
          <button
            @click="clearAllNotifications"
            :disabled="notifications.length === 0"
            class="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            清空所有通知
          </button>
        </div>
        
        <div class="flex items-center space-x-2 text-sm text-muted-foreground dark:text-muted-foreground">
          <span>未读: {{ unreadCount }}</span>
          <span>|</span>
          <span>总计: {{ notifications.length }}</span>
        </div>
      </div>

      <!-- 通知过滤器 -->
      <div class="mb-6">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in notificationFilters"
            :key="filter.key"
            @click="activeFilter = filter.key"
            class="px-3 py-1 text-sm rounded-full border transition-colors duration-200"
            :class="activeFilter === filter.key 
              ? 'bg-primary text-white border-primary' 
              : 'bg-card dark:bg-card text-muted-foreground dark:text-foreground border-border dark:border-border hover:bg-muted/40 dark:hover:bg-muted/30'"
          >
            {{ filter.label }}
            <span v-if="filter.count > 0" class="ml-1 text-xs">({{ filter.count }})</span>
          </button>
        </div>
      </div>

      <!-- 通知列表 -->
      <div v-if="filteredNotifications.length > 0" class="space-y-4">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="bg-card dark:bg-card rounded-lg shadow-sm border border-border dark:border-border overflow-hidden transition-all duration-200 hover:shadow-md"
          :class="{
            'border-l-4 border-l-primary': !notification.read,
            'opacity-75': notification.read
          }"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-3 flex-1">
                <!-- 通知图标 -->
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center"
                    :class="getNotificationIconClass(notification.type)">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path v-if="notification.type === 'system'" fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                      <path v-else-if="notification.type === 'achievement'" fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      <path v-else-if="notification.type === 'reminder'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                      <path v-else-if="notification.type === 'social'" fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd" />
                      <path v-else fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <!-- 通知内容 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getNotificationTypeClass(notification.type)">
                      {{ getNotificationTypeLabel(notification.type) }}
                    </span>
                    <span v-if="!notification.read" class="w-2 h-2 bg-primary rounded-full"></span>
                  </div>
                  
                  <h3 class="text-sm font-medium text-foreground dark:text-foreground mb-1">
                    {{ notification.title }}
                  </h3>
                  
                  <p class="text-sm text-muted-foreground dark:text-muted-foreground mb-2">
                    {{ notification.message }}
                  </p>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-muted-foreground dark:text-muted-foreground">
                      {{ formatTime(notification.createdAt) }}
                    </span>
                    
                    <div class="flex items-center space-x-2">
                      <button
                        v-if="notification.actionUrl"
                        @click="handleNotificationAction(notification)"
                        class="text-xs text-primary hover:text-primary font-medium"
                      >
                        查看详情
                      </button>
                      
                      <button
                        v-if="!notification.read"
                        @click="markAsRead(notification.id)"
                        class="text-xs text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-dark-text"
                      >
                        标记已读
                      </button>
                      
                      <button
                        @click="deleteNotification(notification.id)"
                        class="text-xs text-destructive hover:text-destructive"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-muted-foreground dark:text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5a2 2 0 002 2h5M9 7h6m-6 4h6m-6 4h4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-foreground dark:text-foreground">
          {{ activeFilter === 'all' ? '暂无通知' : '暂无此类型通知' }}
        </h3>
        <p class="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
          {{ activeFilter === 'all' ? '您目前没有任何通知消息' : '请尝试查看其他类型的通知' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { dashboardApi } from '~/services/api.js'

// 设置页面元数据
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useHead({
  title: '通知中心 - 反欺诈知识平台',
  meta: [
    { name: 'description', content: '查看系统通知、学习提醒和社区消息' }
  ]
})

// 响应式数据
const router = useRouter()
const notifications = ref([])
const activeFilter = ref('all')
const loading = ref(false)

// 通知过滤器
const notificationFilters = computed(() => {
  const systemCount = notifications.value.filter(n => n.type === 'system').length
  const achievementCount = notifications.value.filter(n => n.type === 'achievement').length
  const reminderCount = notifications.value.filter(n => n.type === 'reminder').length
  const socialCount = notifications.value.filter(n => n.type === 'social').length
  
  return [
    { key: 'all', label: '全部', count: notifications.value.length },
    { key: 'system', label: '系统通知', count: systemCount },
    { key: 'achievement', label: '成就通知', count: achievementCount },
    { key: 'reminder', label: '学习提醒', count: reminderCount },
    { key: 'social', label: '社区消息', count: socialCount }
  ]
})

// 计算属性
const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') {
    return notifications.value
  }
  return notifications.value.filter(n => n.type === activeFilter.value)
})

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// 方法
const loadNotifications = async () => {
  loading.value = true
  try {
    const response = await dashboardApi.getNotifications({
      ordering: '-created_at'
    })

    const payload = response?.data ?? response
    const rawList = Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : []

    notifications.value = rawList.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.is_read,
      createdAt: notification?.created_at ? new Date(notification.created_at) : new Date(),
      actionUrl: notification.action_url
    }))
  } catch (error) {
    console.error('Failed to load notifications:', error)
    notifications.value = []
  } finally {
    loading.value = false
  }
}

const markAsRead = async (notificationId) => {
  try {
    await dashboardApi.markNotificationRead(notificationId)
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

const markAllAsRead = async () => {
  try {
    await dashboardApi.markAllNotificationsRead()
    notifications.value.forEach(n => n.read = true)
  } catch (error) {
    console.error('全部标记已读失败:', error)
  }
}

const deleteNotification = async (notificationId) => {
  try {
    // 模拟API调用
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  } catch (error) {
    console.error('删除通知失败:', error)
  }
}

const clearAllNotifications = async () => {
  if (confirm('确定要清空所有通知吗？此操作不可撤销。')) {
    try {
      await dashboardApi.clearAllNotifications()
      notifications.value = []
    } catch (error) {
      console.error('清空通知失败:', error)
    }
  }
}

const handleNotificationAction = async (notification) => {
  // 标记为已读
  if (!notification.read) {
    await markAsRead(notification.id)
  }
  
  // 跳转到相关页面
  if (notification.actionUrl) {
    router.push(notification.actionUrl)
  }
}

const getNotificationIconClass = (type) => {
  const classes = {
    system: 'bg-primary/20 text-primary dark:bg-primary/20 dark:text-primary',
    achievement: 'bg-primary/20 text-primary dark:bg-yellow-900/20 dark:text-primary',
    reminder: 'bg-primary/20 text-primary dark:bg-success-900/20 dark:text-success-400',
    social: 'bg-purple-100 text-primary dark:bg-purple-900/20 dark:text-purple-400'
  }
  return classes[type] || 'bg-muted/60 text-muted-foreground dark:bg-background/20 dark:text-muted-foreground'
}

const getNotificationTypeClass = (type) => {
  const classes = {
    system: 'bg-primary/20 text-primary dark:bg-primary/20 dark:text-primary',
    achievement: 'bg-primary/20 text-yellow-800 dark:bg-yellow-900/20 dark:text-primary',
    reminder: 'bg-primary/20 text-success-700 dark:bg-success-900/20 dark:text-success-400',
    social: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
  }
  return classes[type] || 'bg-muted/60 text-foreground dark:bg-background/20 dark:text-muted-foreground'
}

const getNotificationTypeLabel = (type) => {
  const labels = {
    system: '系统通知',
    achievement: '成就通知',
    reminder: '学习提醒',
    social: '社区消息'
  }
  return labels[type] || '其他'
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 生命周期
onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
/* 自定义样式 */
</style>