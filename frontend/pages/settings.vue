<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
          设置
        </h1>
        <p class="text-gray-600 dark:text-dark-text-secondary">
          管理您的账户设置和偏好
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- 侧边栏导航 -->
        <div class="lg:col-span-1">
          <nav class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-4">
            <ul class="space-y-2">
              <li v-for="section in settingSections" :key="section.id">
                <button
                  @click="activeSection = section.id"
                  class="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                  :class="activeSection === section.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg'"
                >
                  <div class="flex items-center space-x-3">
                    <component :is="section.icon" class="w-5 h-5" />
                    <span>{{ section.name }}</span>
                  </div>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <!-- 主要内容区域 -->
        <div class="lg:col-span-3">
          <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
            <!-- 个人信息设置 -->
            <div v-if="activeSection === 'profile'">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-6">个人信息</h2>
              
              <form @submit.prevent="updateProfile" class="space-y-6">
                <!-- 头像上传 -->
                <div class="flex items-center space-x-6">
                  <div class="relative">
                    <img 
                      :src="profileForm.avatar || '/default-avatar.png'" 
                      alt="头像" 
                      class="w-20 h-20 rounded-full object-cover"
                    >
                    <button 
                      type="button"
                      class="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-dark-text">更换头像</h3>
                    <p class="text-sm text-gray-500 dark:text-dark-text-secondary">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
                  </div>
                </div>

                <!-- 基本信息 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      用户名
                    </label>
                    <input
                      v-model="profileForm.username"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                      placeholder="请输入用户名"
                    >
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      邮箱
                    </label>
                    <input
                      v-model="profileForm.email"
                      type="email"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                      placeholder="请输入邮箱"
                    >
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      手机号
                    </label>
                    <input
                      v-model="profileForm.phone"
                      type="tel"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                      placeholder="请输入手机号"
                    >
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      职业
                    </label>
                    <select
                      v-model="profileForm.occupation"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                    >
                      <option value="">请选择职业</option>
                      <option value="student">学生</option>
                      <option value="teacher">教师</option>
                      <option value="finance">金融从业者</option>
                      <option value="it">IT从业者</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                </div>

                <!-- 个人简介 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                    个人简介
                  </label>
                  <textarea
                    v-model="profileForm.bio"
                    rows="4"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                    placeholder="介绍一下自己..."
                  ></textarea>
                </div>

                <div class="flex justify-end">
                  <button
                    type="submit"
                    class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    保存更改
                  </button>
                </div>
              </form>
            </div>

            <!-- 账户安全设置 -->
            <div v-else-if="activeSection === 'security'">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-6">账户安全</h2>
              
              <div class="space-y-6">
                <!-- 修改密码 -->
                <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">修改密码</h3>
                  <form @submit.prevent="changePassword" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                        当前密码
                      </label>
                      <input
                        v-model="passwordForm.currentPassword"
                        type="password"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                        placeholder="请输入当前密码"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                        新密码
                      </label>
                      <input
                        v-model="passwordForm.newPassword"
                        type="password"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                        placeholder="请输入新密码"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                        确认新密码
                      </label>
                      <input
                        v-model="passwordForm.confirmPassword"
                        type="password"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                        placeholder="请再次输入新密码"
                      >
                    </div>
                    <button
                      type="submit"
                      class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      更新密码
                    </button>
                  </form>
                </div>

                <!-- 两步验证 -->
                <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-lg font-medium text-gray-900 dark:text-dark-text">两步验证</h3>
                      <p class="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
                        为您的账户添加额外的安全保护
                      </p>
                    </div>
                    <button
                      @click="toggleTwoFactor"
                      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      :class="securitySettings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'"
                    >
                      <span
                        class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        :class="securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'"
                      ></span>
                    </button>
                  </div>
                </div>

                <!-- 登录设备 -->
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">登录设备</h3>
                  <div class="space-y-3">
                    <div v-for="device in loginDevices" :key="device.id" class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p class="font-medium text-gray-900 dark:text-dark-text">{{ device.name }}</p>
                          <p class="text-sm text-gray-500 dark:text-dark-text-secondary">{{ device.location }} • {{ device.lastActive }}</p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span v-if="device.current" class="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300 rounded-full">
                          当前设备
                        </span>
                        <button v-else class="text-red-600 hover:text-red-700 text-sm font-medium">
                          移除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 通知设置 -->
            <div v-else-if="activeSection === 'notifications'">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-6">通知设置</h2>
              
              <div class="space-y-6">
                <div v-for="notification in notificationSettings" :key="notification.id" class="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-dark-text">{{ notification.title }}</h3>
                    <p class="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">{{ notification.description }}</p>
                  </div>
                  <button
                    @click="toggleNotification(notification.id)"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    :class="notification.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'"
                  >
                    <span
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      :class="notification.enabled ? 'translate-x-6' : 'translate-x-1'"
                    ></span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 隐私设置 -->
            <div v-else-if="activeSection === 'privacy'">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-6">隐私设置</h2>
              
              <div class="space-y-6">
                <div v-for="privacy in privacySettings" :key="privacy.id" class="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-dark-text">{{ privacy.title }}</h3>
                    <p class="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">{{ privacy.description }}</p>
                  </div>
                  <button
                    @click="togglePrivacy(privacy.id)"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    :class="privacy.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'"
                  >
                    <span
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      :class="privacy.enabled ? 'translate-x-6' : 'translate-x-1'"
                    ></span>
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
import { ref, onMounted } from 'vue'

// 页面布局
definePageMeta({
  layout: 'default'
})

// 页面元数据
useHead({
  title: '设置',
  meta: [
    { name: 'description', content: '管理您的账户设置和偏好' }
  ]
})

// 响应式数据
const activeSection = ref('profile')

// 设置分类
const settingSections = [
  { id: 'profile', name: '个人信息', icon: 'div' },
  { id: 'security', name: '账户安全', icon: 'div' },
  { id: 'notifications', name: '通知设置', icon: 'div' },
  { id: 'privacy', name: '隐私设置', icon: 'div' }
]

// 个人信息表单
const profileForm = ref({
  username: 'testuser',
  email: 'test@example.com',
  phone: '',
  occupation: '',
  bio: '',
  avatar: ''
})

// 密码修改表单
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 安全设置
const securitySettings = ref({
  twoFactorEnabled: false
})

// 登录设备
const loginDevices = ref([
  {
    id: 1,
    name: 'Windows PC',
    location: '北京市',
    lastActive: '刚刚',
    current: true
  },
  {
    id: 2,
    name: 'iPhone 13',
    location: '上海市',
    lastActive: '2小时前',
    current: false
  }
])

// 通知设置
const notificationSettings = ref([
  {
    id: 'email_notifications',
    title: '邮件通知',
    description: '接收重要更新和活动通知',
    enabled: true
  },
  {
    id: 'push_notifications',
    title: '推送通知',
    description: '接收实时推送消息',
    enabled: false
  },
  {
    id: 'quiz_reminders',
    title: '测验提醒',
    description: '定期提醒您参与测验',
    enabled: true
  },
  {
    id: 'community_updates',
    title: '社区动态',
    description: '接收社区新帖子和回复通知',
    enabled: true
  }
])

// 隐私设置
const privacySettings = ref([
  {
    id: 'profile_visibility',
    title: '个人资料可见性',
    description: '允许其他用户查看您的个人资料',
    enabled: true
  },
  {
    id: 'activity_tracking',
    title: '活动跟踪',
    description: '允许系统跟踪您的学习活动以改善体验',
    enabled: true
  },
  {
    id: 'data_analytics',
    title: '数据分析',
    description: '允许使用您的数据进行匿名分析',
    enabled: false
  }
])

// 方法
const updateProfile = async () => {
  try {
    // TODO: 调用API更新个人信息
    console.log('更新个人信息:', profileForm.value)
    // 显示成功消息
  } catch (error) {
    console.error('更新失败:', error)
    // 显示错误消息
  }
}

const changePassword = async () => {
  try {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      alert('新密码和确认密码不匹配')
      return
    }
    // TODO: 调用API修改密码
    console.log('修改密码')
    // 清空表单
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    // 显示成功消息
  } catch (error) {
    console.error('密码修改失败:', error)
    // 显示错误消息
  }
}

const toggleTwoFactor = () => {
  securitySettings.value.twoFactorEnabled = !securitySettings.value.twoFactorEnabled
  // TODO: 调用API更新两步验证设置
}

const toggleNotification = (id) => {
  const notification = notificationSettings.value.find(n => n.id === id)
  if (notification) {
    notification.enabled = !notification.enabled
    // TODO: 调用API更新通知设置
  }
}

const togglePrivacy = (id) => {
  const privacy = privacySettings.value.find(p => p.id === id)
  if (privacy) {
    privacy.enabled = !privacy.enabled
    // TODO: 调用API更新隐私设置
  }
}

// 生命周期
onMounted(() => {
  // TODO: 从API加载用户设置
  // loadUserSettings()
})
</script>

<style scoped>
/* 组件特定样式 */
</style>