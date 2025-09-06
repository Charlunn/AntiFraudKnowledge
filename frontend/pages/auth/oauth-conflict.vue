<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex justify-center">
          <img class="h-12 w-auto" src="/logo.svg" alt="Logo" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          账户冲突处理
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          检测到账户冲突，请选择处理方式
        </p>
      </div>
      
      <!-- 冲突信息显示 -->
      <div v-if="conflictInfo" class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">
              账户冲突
            </h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>{{ conflictInfo.message }}</p>
              <div v-if="conflictInfo.existing_user" class="mt-2">
                <p class="font-medium">现有账户信息：</p>
                <p>用户名: {{ conflictInfo.existing_user.username }}</p>
                <p>邮箱: {{ conflictInfo.existing_user.email }}</p>
                <p>注册时间: {{ formatDate(conflictInfo.existing_user.date_joined) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 第三方账户信息 -->
      <div v-if="userInfo" class="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <img
              v-if="userInfo.avatar_url"
              :src="userInfo.avatar_url"
              :alt="userInfo.nickname"
              class="h-10 w-10 rounded-full"
            />
            <div v-else class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <UserIcon class="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-blue-900">
              {{ userInfo.nickname || '未知用户' }}
            </p>
            <p class="text-sm text-blue-700">
              来自 {{ providerName }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- 处理选项 -->
      <div class="space-y-4">
        <!-- 选项1: 登录现有账户 -->
        <div class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
          <div class="flex items-center">
            <input
              id="login-existing"
              v-model="selectedOption"
              name="conflict-option"
              type="radio"
              value="login"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label for="login-existing" class="ml-3 block text-sm font-medium text-gray-700">
              登录现有账户
            </label>
          </div>
          <p class="mt-2 text-sm text-gray-500 ml-7">
            使用现有账户登录，并将 {{ providerName }} 账户绑定到该账户
          </p>
          
          <!-- 密码输入 -->
          <div v-if="selectedOption === 'login'" class="mt-3 ml-7">
            <input
              v-model="password"
              type="password"
              placeholder="请输入账户密码"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        <!-- 选项2: 创建新账户 -->
        <div class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
          <div class="flex items-center">
            <input
              id="create-new"
              v-model="selectedOption"
              name="conflict-option"
              type="radio"
              value="create"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label for="create-new" class="ml-3 block text-sm font-medium text-gray-700">
              创建新账户
            </label>
          </div>
          <p class="mt-2 text-sm text-gray-500 ml-7">
            使用不同的用户名和邮箱创建新账户
          </p>
        </div>
        
        <!-- 选项3: 取消操作 -->
        <div class="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
          <div class="flex items-center">
            <input
              id="cancel"
              v-model="selectedOption"
              name="conflict-option"
              type="radio"
              value="cancel"
              class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
            />
            <label for="cancel" class="ml-3 block text-sm font-medium text-gray-700">
              取消操作
            </label>
          </div>
          <p class="mt-2 text-sm text-gray-500 ml-7">
            返回登录页面，不进行任何操作
          </p>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="space-y-3">
        <button
          :disabled="!selectedOption || loading || (selectedOption === 'login' && !password)"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleSubmit"
        >
          <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          </span>
          {{ getButtonText() }}
        </button>
        
        <button
          type="button"
          class="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          @click="goBack"
        >
          返回登录页面
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { ExclamationTriangleIcon, ExclamationCircleIcon, UserIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 状态
const loading = ref(false)
const error = ref('')
const selectedOption = ref('')
const password = ref('')

// 从路由参数获取信息
const provider = ref(route.query.provider || '')
const tempToken = ref(route.query.temp_token || '')
const conflictInfo = ref(null)
const userInfo = ref(null)

// 计算属性
const providerName = computed(() => {
  const names = {
    qq: 'QQ',
    wechat: '微信',
    douyin: '抖音',
    alipay: '支付宝'
  }
  return names[provider.value] || '第三方平台'
})

const getButtonText = () => {
  if (loading.value) return '处理中...'
  
  switch (selectedOption.value) {
    case 'login':
      return '登录并绑定账户'
    case 'create':
      return '创建新账户'
    case 'cancel':
      return '取消操作'
    default:
      return '请选择处理方式'
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const handleSubmit = async () => {
  if (!selectedOption.value) return
  
  if (selectedOption.value === 'cancel') {
    goBack()
    return
  }
  
  if (selectedOption.value === 'login' && !password.value) {
    error.value = '请输入密码'
    return
  }
  
  if (selectedOption.value === 'create') {
    // 跳转到注册页面
    const query = {
      provider: provider.value,
      temp_token: tempToken.value
    }
    
    if (userInfo.value) {
      query.user_info = JSON.stringify(userInfo.value)
    }
    
    await router.push({
      path: '/auth/oauth-register',
      query
    })
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/users/oauth/resolve-conflict/', {
      method: 'POST',
      body: {
        temp_token: tempToken.value,
        action: selectedOption.value,
        password: selectedOption.value === 'login' ? password.value : undefined
      }
    })
    
    if (response.access_token) {
      // 处理成功，保存token
      authStore.setTokens({
        access: response.access_token,
        refresh: response.refresh_token
      })
      
      // 跳转到仪表板
      await router.push('/dashboard')
    }
  } catch (err) {
    if (err.status === 400) {
      error.value = err.data?.error || '处理失败'
    } else {
      error.value = '处理失败，请重试'
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/login')
}

onMounted(() => {
  // 解析冲突信息
  if (route.query.conflict_info) {
    try {
      conflictInfo.value = JSON.parse(route.query.conflict_info)
    } catch (e) {
      console.error('解析冲突信息失败:', e)
    }
  }
  
  // 解析用户信息
  if (route.query.user_info) {
    try {
      userInfo.value = JSON.parse(route.query.user_info)
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }
  
  // 检查必要参数
  if (!provider.value || !tempToken.value) {
    router.push('/login')
  }
})
</script>