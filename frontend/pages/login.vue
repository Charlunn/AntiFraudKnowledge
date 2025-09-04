<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-bg dark:to-dark-surface py-12 px-4 sm:px-6 lg:px-8 fadeInUp">
    <div class="max-w-md w-full space-y-8 animate-fadeInUp">
      <!-- 头部 -->
      <div class="text-center animate-fadeInDown">
        <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20 hover-lift pulse">
          <svg class="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-neutral-900 dark:text-dark-text fadeInLeft delay-100">
          登录账户
        </h2>
        <p class="mt-2 text-sm text-neutral-600 dark:text-dark-text-secondary fadeInRight delay-200">
          欢迎回到反欺诈知识平台
        </p>
      </div>

      <!-- 登录表单 -->
      <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-8 hover-lift animate-fadeInUp animate-delay-200">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 用户名/邮箱 -->
          <div class="slideInLeft delay-300">
            <label for="username" class="block text-sm font-medium text-neutral-700 dark:text-dark-text mb-2">
              用户名或邮箱
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-neutral-400 dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                required
                @blur="handleFieldBlur('username')"
                class="block w-full pl-10 pr-3 py-3 border border-neutral-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-neutral-900 dark:text-dark-text placeholder-neutral-500 dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 hover-lift"
                :class="{ 'border-error-500 focus:ring-error-500': hasFieldError('username') }"
                placeholder="请输入用户名或邮箱"
                autocomplete="username"
              >
            </div>
            <p v-if="hasFieldError('username')" class="mt-1 text-sm text-error-500 fadeInUp">
              {{ getFieldError('username')[0] }}
            </p>
          </div>

          <!-- 密码 -->
          <div>
            <label for="password" class="block text-sm font-medium text-neutral-700 dark:text-dark-text mb-2">
              密码
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-neutral-400 dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                @blur="handleFieldBlur('password')"
                class="block w-full pl-10 pr-12 py-3 border border-neutral-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-neutral-900 dark:text-dark-text placeholder-neutral-500 dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                :class="{ 'border-error-500 focus:ring-error-500': hasFieldError('password') }"
                placeholder="请输入密码"
                autocomplete="current-password"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 dark:text-dark-text-secondary hover:text-neutral-600 dark:hover:text-dark-text transition-colors duration-200"
              >
                <svg v-if="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="hasFieldError('password')" class="mt-1 text-sm text-error-500">
              {{ getFieldError('password')[0] }}
            </p>
          </div>

          <!-- 记住我和忘记密码 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="formData.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg"
              >
              <label for="remember-me" class="ml-2 block text-sm text-neutral-700 dark:text-dark-text">
                记住我
              </label>
            </div>

            <div class="text-sm">
              <NuxtLink
                to="/forgot-password"
                class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200"
              >
                忘记密码？
              </NuxtLink>
            </div>
          </div>

          <!-- 登录按钮 -->
          <div>
            <button
              type="submit"
              :disabled="!canSubmit"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span v-if="isSubmitting" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <div class="loading-spinner-sm"></div>
              </span>
              {{ isSubmitting ? '登录中...' : '登录' }}
            </button>
          </div>

          <!-- 分隔线 -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-neutral-300 dark:border-dark-border"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-dark-surface text-neutral-500 dark:text-dark-text-secondary">
                或
              </span>
            </div>
          </div>

          <!-- 第三方登录 -->
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="handleSocialLogin('github')"
              class="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 dark:border-dark-border rounded-lg shadow-sm bg-white dark:bg-dark-bg text-sm font-medium text-neutral-500 dark:text-dark-text hover:bg-neutral-50 dark:hover:bg-dark-surface transition-colors duration-200"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span class="ml-2">GitHub</span>
            </button>

            <button
              type="button"
              @click="handleSocialLogin('google')"
              class="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 dark:border-dark-border rounded-lg shadow-sm bg-white dark:bg-dark-bg text-sm font-medium text-neutral-500 dark:text-dark-text hover:bg-neutral-50 dark:hover:bg-dark-surface transition-colors duration-200"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="ml-2">Google</span>
            </button>
          </div>
        </form>

        <!-- 注册链接 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-neutral-600 dark:text-dark-text-secondary">
            还没有账户？
            <NuxtLink
              to="/register"
              class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200"
            >
              立即注册
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useLoginForm } from '~/composables/useForm'
import { useToast } from '~/composables/useNotification'

// 页面元数据
useHead({
  title: '登录',
  meta: [
    { name: 'description', content: '登录反欺诈知识平台，开始您的学习之旅' }
  ]
})

// 路由
const router = useRouter()
const { login } = useAuth()
const { showSuccess, showError } = useToast()

// 状态管理
const showPassword = ref(false)

// 使用登录表单
const {
  formData,
  isSubmitting,
  submitError,
  submitSuccess,
  fieldErrors,
  canSubmit,
  submitForm,
  handleFieldBlur,
  hasFieldError,
  getFieldError
} = useLoginForm(async (credentials) => {
  const result = await login(credentials)
  
  if (result.success) {
    showSuccess('登录成功，欢迎回来！')
    // 跳转到仪表板或指定页面
    const redirect = router.currentRoute.value.query.redirect || '/dashboard'
    await router.push(redirect)
  } else {
    showError(result.error || '登录失败，请重试')
  }
  
  return result
})

// 登录处理
const handleLogin = async () => {
  await submitForm()
}

// 第三方登录
const handleSocialLogin = async (provider) => {
  try {
    console.log('第三方登录:', provider)
    showError('第三方登录功能暂未开放')
    // TODO: 实现第三方登录
  } catch (error) {
    console.error('第三方登录失败:', error)
  }
}

// 计算属性
const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(formData.username)
})

const isValidPassword = computed(() => {
  return formData.password.length >= 6
})

// 页面布局
definePageMeta({
  layout: false
})
</script>

<style scoped>
/* 小型加载动画 */
.loading-spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>