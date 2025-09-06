<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex justify-center">
          <img class="h-12 w-auto" src="/logo.svg" alt="Logo" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          完善注册信息
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          使用 {{ providerName }} 登录，请补全以下信息
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <!-- 用户名 -->
          <div class="relative">
            <label for="username" class="sr-only">用户名</label>
            <input
              id="username"
              v-model="form.username"
              name="username"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="{
                'border-red-300': usernameError,
                'border-green-300': usernameValid
              }"
              placeholder="用户名"
              @input="checkUsername"
            />
            <div v-if="usernameError" class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <ExclamationCircleIcon class="h-5 w-5 text-red-500" />
            </div>
            <div v-if="usernameValid" class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <CheckCircleIcon class="h-5 w-5 text-green-500" />
            </div>
          </div>
          
          <!-- 用户名错误提示 -->
          <div v-if="usernameError" class="text-red-600 text-sm mt-1 px-3">
            {{ usernameError }}
          </div>
          
          <!-- 用户名推荐 -->
          <div v-if="usernameRecommendations.length > 0" class="mt-2 px-3">
            <p class="text-sm text-gray-600 mb-2">推荐用户名：</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="recommendation in usernameRecommendations"
                :key="recommendation"
                type="button"
                class="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors"
                @click="selectRecommendation(recommendation)"
              >
                {{ recommendation }}
              </button>
            </div>
          </div>
          
          <!-- 邮箱 -->
          <div>
            <label for="email" class="sr-only">邮箱</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="邮箱地址"
            />
          </div>
          
          <!-- 密码 -->
          <div>
            <label for="password" class="sr-only">密码</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="密码"
            />
          </div>
          
          <!-- 确认密码 -->
          <div>
            <label for="confirm-password" class="sr-only">确认密码</label>
            <input
              id="confirm-password"
              v-model="form.confirmPassword"
              name="confirm-password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="确认密码"
            />
          </div>
        </div>
        
        <!-- 第三方账户信息显示 -->
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
        
        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </span>
            {{ loading ? '注册中...' : '完成注册' }}
          </button>
        </div>
        
        <div class="text-center">
          <button
            type="button"
            class="text-indigo-600 hover:text-indigo-500 text-sm"
            @click="goBack"
          >
            返回登录页面
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { ExclamationCircleIcon, CheckCircleIcon, UserIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 表单数据
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 状态
const loading = ref(false)
const error = ref('')
const usernameError = ref('')
const usernameValid = ref(false)
const usernameRecommendations = ref([])
const checkingUsername = ref(false)

// 从路由参数获取信息
const provider = ref(route.query.provider || '')
const tempToken = ref(route.query.temp_token || '')
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

const isFormValid = computed(() => {
  return form.value.username &&
         form.value.email &&
         form.value.password &&
         form.value.confirmPassword &&
         form.value.password === form.value.confirmPassword &&
         usernameValid.value &&
         !usernameError.value
})

// 用户名检查防抖
let usernameCheckTimeout = null

const checkUsername = () => {
  if (usernameCheckTimeout) {
    clearTimeout(usernameCheckTimeout)
  }
  
  usernameCheckTimeout = setTimeout(async () => {
    if (!form.value.username) {
      usernameError.value = ''
      usernameValid.value = false
      usernameRecommendations.value = []
      return
    }
    
    if (form.value.username.length < 3) {
      usernameError.value = '用户名至少需要3个字符'
      usernameValid.value = false
      usernameRecommendations.value = []
      return
    }
    
    checkingUsername.value = true
    
    try {
      const response = await $fetch('/api/users/check-username/', {
        method: 'POST',
        body: {
          username: form.value.username
        }
      })
      
      if (response.available) {
        usernameError.value = ''
        usernameValid.value = true
        usernameRecommendations.value = []
      } else {
        usernameError.value = response.message || '用户名不可用'
        usernameValid.value = false
        usernameRecommendations.value = response.recommendations || []
      }
    } catch (err) {
      usernameError.value = '检查用户名时出错'
      usernameValid.value = false
      usernameRecommendations.value = []
    } finally {
      checkingUsername.value = false
    }
  }, 500)
}

const selectRecommendation = (username) => {
  form.value.username = username
  usernameError.value = ''
  usernameValid.value = true
  usernameRecommendations.value = []
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/users/oauth/register/', {
      method: 'POST',
      body: {
        temp_token: tempToken.value,
        username: form.value.username,
        email: form.value.email,
        password: form.value.password
      }
    })
    
    if (response.access_token) {
      // 注册成功，保存token
      authStore.setTokens({
        access: response.access_token,
        refresh: response.refresh_token
      })
      
      // 跳转到引导流程或仪表板
      if (response.requires_onboarding) {
        await router.push('/auth/onboarding')
      } else {
        await router.push('/dashboard')
      }
    }
  } catch (err) {
    error.value = err.data?.error || '注册失败，请重试'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/login')
}

onMounted(() => {
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