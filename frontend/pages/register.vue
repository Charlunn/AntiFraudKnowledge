<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-bg dark:to-dark-surface py-12 px-4 sm:px-6 lg:px-8 fadeInUp">
    <div class="max-w-md w-full space-y-8 animate-fadeInUp">
      <!-- 头部 -->
      <div class="text-center animate-fadeInDown">
        <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20 hover-lift pulse">
          <svg class="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-neutral-900 dark:text-dark-text fadeInLeft delay-100">
          创建账户
        </h2>
        <p class="mt-2 text-sm text-neutral-600 dark:text-dark-text-secondary fadeInRight delay-200">
          加入反欺诈知识平台，开始您的学习之旅
        </p>
      </div>

      <!-- 注册表单 -->
      <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-8 hover-lift animate-fadeInUp animate-delay-200">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- 用户名 -->
          <div class="slideInLeft delay-300">
            <label for="username" class="block text-sm font-medium text-neutral-700 dark:text-dark-text mb-2">
              用户名
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
                :class="{
                  'border-error-500 focus:ring-error-500': hasFieldError('username'),
                  'border-success-500 focus:ring-success-500': formData.username && isValidUsername && !hasFieldError('username')
                }"
                placeholder="请输入用户名"
                autocomplete="username"
              >
            </div>
            <p v-if="hasFieldError('username')" class="mt-1 text-sm text-error-500 fadeInUp">
              {{ getFieldError('username')[0] }}
            </p>
            <p v-else class="mt-1 text-xs text-neutral-500 dark:text-dark-text-secondary">
              用户名长度为3-20个字符，只能包含字母、数字和下划线
            </p>
          </div>

          <!-- 邮箱 -->
          <div>
            <label for="email" class="block text-sm font-medium text-neutral-700 dark:text-dark-text mb-2">
              邮箱地址
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-neutral-400 dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                @blur="handleFieldBlur('email')"
                class="block w-full pl-10 pr-3 py-3 border border-neutral-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-neutral-900 dark:text-dark-text placeholder-neutral-500 dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                :class="{
                  'border-error-500 focus:ring-error-500': hasFieldError('email'),
                  'border-success-500 focus:ring-success-500': formData.email && isValidEmail && !hasFieldError('email')
                }"
                placeholder="请输入邮箱地址"
                autocomplete="email"
              >
            </div>
            <p v-if="hasFieldError('email')" class="mt-1 text-sm text-error-500">
              {{ getFieldError('email')[0] }}
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
                :class="{
                  'border-error-500 focus:ring-error-500': hasFieldError('password'),
                  'border-success-500 focus:ring-success-500': formData.password && isValidPassword && !hasFieldError('password')
                }"
                placeholder="请输入密码"
                autocomplete="new-password"
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
            <!-- 密码强度指示器 -->
            <div v-else class="mt-2">
              <div class="flex items-center space-x-1">
                <div class="flex-1 h-1 rounded-full bg-neutral-200 dark:bg-dark-border overflow-hidden">
                  <div 
                    class="h-full transition-all duration-300"
                    :class="passwordStrengthClass"
                    :style="{ width: passwordStrengthWidth }"
                  ></div>
                </div>
                <span class="text-xs font-medium" :class="passwordStrengthTextClass">
                  {{ passwordStrengthText }}
                </span>
              </div>
              <p class="mt-1 text-xs text-neutral-500 dark:text-dark-text-secondary">
                密码长度至少8个字符，建议包含大小写字母、数字和特殊字符
              </p>
            </div>
          </div>

          <!-- 确认密码 -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-neutral-700 dark:text-dark-text mb-2">
              确认密码
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-neutral-400 dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                @blur="handleFieldBlur('confirmPassword')"
                class="block w-full pl-10 pr-12 py-3 border border-neutral-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-neutral-900 dark:text-dark-text placeholder-neutral-500 dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                :class="{
                  'border-error-500 focus:ring-error-500': hasFieldError('confirmPassword'),
                  'border-success-500 focus:ring-success-500': formData.confirmPassword && isPasswordMatch && !hasFieldError('confirmPassword')
                }"
                placeholder="请再次输入密码"
                autocomplete="new-password"
              >
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 dark:text-dark-text-secondary hover:text-neutral-600 dark:hover:text-dark-text transition-colors duration-200"
              >
                <svg v-if="showConfirmPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="hasFieldError('confirmPassword')" class="mt-1 text-sm text-error-500">
              {{ getFieldError('confirmPassword')[0] }}
            </p>
          </div>

          <!-- 服务条款 -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="agree-terms"
                v-model="formData.agreeTerms"
                type="checkbox"
                required
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg"
                :class="{ 'border-error-500': hasFieldError('agreeTerms') }"
              >
            </div>
            <div class="ml-3 text-sm">
              <label for="agree-terms" class="text-neutral-700 dark:text-dark-text">
                我已阅读并同意
                <NuxtLink to="/terms" class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200">
                  服务条款
                </NuxtLink>
                和
                <NuxtLink to="/privacy" class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200">
                  隐私政策
                </NuxtLink>
              </label>
            </div>
          </div>

          <!-- 注册按钮 -->
          <div>
            <button
              type="submit"
              :disabled="!canSubmit"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span v-if="isSubmitting" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <div class="loading-spinner-sm"></div>
              </span>
              {{ isSubmitting ? '注册中...' : '创建账户' }}
            </button>
          </div>
        </form>

        <!-- 登录链接 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-neutral-600 dark:text-dark-text-secondary">
            已有账户？
            <NuxtLink
              to="/login"
              class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200"
            >
              立即登录
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
import { useRegisterForm } from '~/composables/useForm'
import { useToast } from '~/composables/useNotification'

// 页面元数据
useHead({
  title: '注册',
  meta: [
    { name: 'description', content: '注册反欺诈知识平台账户，开始您的学习之旅' }
  ]
})

// 路由
const router = useRouter()
const { register } = useAuth()
const { showSuccess, showError } = useToast()

// 状态管理
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 使用注册表单
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
} = useRegisterForm(async (userData) => {
  const result = await register(userData)
  
  if (result.success) {
    showSuccess('注册成功！请查收邮箱验证邮件')
    // 跳转到登录页面
    await router.push('/login')
  } else {
    showError(result.error || '注册失败，请重试')
  }
  
  return result
})

// 注册处理
const handleRegister = async () => {
  await submitForm()
}

// 计算属性
const isValidUsername = computed(() => {
  return formData.username.length >= 3 && /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(formData.username)
})

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(formData.email)
})

const isValidPassword = computed(() => {
  return formData.password.length >= 6 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)
})

const isPasswordMatch = computed(() => {
  return formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
})

// 密码强度计算
const passwordStrength = computed(() => {
  const password = formData.password
  if (!password) return 0
  
  let score = 0
  
  // 长度检查
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  
  // 字符类型检查
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  
  return Math.min(score, 4)
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  const texts = ['很弱', '弱', '中等', '强', '很强']
  return texts[strength] || '很弱'
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  const classes = [
    'bg-error-500',
    'bg-error-400', 
    'bg-warning-500',
    'bg-success-400',
    'bg-success-500'
  ]
  return classes[strength] || classes[0]
})

const passwordStrengthTextClass = computed(() => {
  const strength = passwordStrength.value
  const classes = [
    'text-error-500',
    'text-error-400',
    'text-warning-500', 
    'text-success-400',
    'text-success-500'
  ]
  return classes[strength] || classes[0]
})

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrength.value / 4) * 100}%`
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