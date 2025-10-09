<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 dark:from-dark-bg dark:to-dark-surface py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- 头部 -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary/20 dark:bg-primary/20">
          <svg class="h-8 w-8 text-primary dark:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-foreground dark:text-foreground">
          重置密码
        </h2>
        <p class="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
          输入您的邮箱地址，我们将发送重置密码的链接
        </p>
      </div>

      <!-- 重置密码表单 -->
      <div class="bg-card dark:bg-card rounded-xl shadow-lg p-8">
        <!-- 步骤指示器 -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-8 h-8 rounded-full" :class="step >= 1 ? 'bg-primary text-white' : 'bg-muted/60 dark:bg-border text-muted-foreground dark:text-muted-foreground'">
                <span class="text-sm font-medium">1</span>
              </div>
              <span class="ml-2 text-sm font-medium" :class="step >= 1 ? 'text-primary dark:text-primary' : 'text-muted-foreground dark:text-muted-foreground'">
                输入邮箱
              </span>
            </div>
            <div class="flex-1 mx-4 h-0.5" :class="step >= 2 ? 'bg-primary' : 'bg-muted/60 dark:bg-border'"></div>
            <div class="flex items-center">
              <div class="flex items-center justify-center w-8 h-8 rounded-full" :class="step >= 2 ? 'bg-primary text-white' : 'bg-muted/60 dark:bg-border text-muted-foreground dark:text-muted-foreground'">
                <span class="text-sm font-medium">2</span>
              </div>
              <span class="ml-2 text-sm font-medium" :class="step >= 2 ? 'text-primary dark:text-primary' : 'text-muted-foreground dark:text-muted-foreground'">
                验证邮箱
              </span>
            </div>
          </div>
        </div>

        <!-- 步骤1: 输入邮箱 -->
        <div v-if="step === 1">
          <form @submit.prevent="handleSendResetEmail" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                邮箱地址
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-muted-foreground dark:text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="block w-full pl-10 pr-3 py-3 border border-border dark:border-border rounded-lg bg-card dark:bg-muted/40 text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                  :class="{ 'border-error-500 focus:ring-error-500': errors.email }"
                  placeholder="请输入您的邮箱地址"
                  autocomplete="email"
                >
              </div>
              <p v-if="errors.email" class="mt-1 text-sm text-error-500">
                {{ errors.email }}
              </p>
            </div>

            <div>
              <button
                type="submit"
                :disabled="isLoading"
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <div class="loading-spinner-sm"></div>
                </span>
                {{ isLoading ? '发送中...' : '发送重置链接' }}
              </button>
            </div>
          </form>
        </div>

        <!-- 步骤2: 邮箱验证成功 -->
        <div v-else-if="step === 2" class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-100 dark:bg-success-900/20 mb-6">
            <svg class="h-8 w-8 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h3 class="text-lg font-medium text-foreground dark:text-foreground mb-2">
            邮件已发送
          </h3>
          
          <p class="text-sm text-muted-foreground dark:text-muted-foreground mb-6">
            我们已向 <span class="font-medium text-foreground dark:text-foreground">{{ form.email }}</span> 发送了重置密码的链接。
            请检查您的邮箱（包括垃圾邮件文件夹）并点击链接重置密码。
          </p>
          
          <!-- 重新发送倒计时 -->
          <div class="mb-6">
            <button
              v-if="resendCountdown > 0"
              disabled
              class="text-sm text-muted-foreground dark:text-muted-foreground cursor-not-allowed"
            >
              {{ resendCountdown }} 秒后可重新发送
            </button>
            <button
              v-else
              @click="handleResendEmail"
              :disabled="isResending"
              class="text-sm font-medium text-primary dark:text-primary hover:text-primary dark:hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {{ isResending ? '发送中...' : '重新发送邮件' }}
            </button>
          </div>
          
          <!-- 提示信息 -->
          <div class="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-primary dark:text-primary/70">
                  温馨提示
                </h3>
                <div class="mt-2 text-sm text-primary dark:text-primary/80">
                  <ul class="list-disc list-inside space-y-1">
                    <li>重置链接有效期为24小时</li>
                    <li>如果没有收到邮件，请检查垃圾邮件文件夹</li>
                    <li>确保邮箱地址输入正确</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 返回登录 -->
        <div class="mt-6 text-center">
          <NuxtLink
            to="/login"
            class="inline-flex items-center text-sm font-medium text-primary dark:text-primary hover:text-primary dark:hover:text-primary/80 transition-colors duration-200"
          >
            <svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回登录页面
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// 页面元数据
useHead({
  title: '忘记密码',
  meta: [
    { name: 'description', content: '重置您的反欺诈知识平台账户密码' }
  ]
})

// 路由
const router = useRouter()

// 响应式数据
const step = ref(1)
const isLoading = ref(false)
const isResending = ref(false)
const resendCountdown = ref(0)
let countdownTimer = null

// 表单数据
const form = reactive({
  email: ''
})

// 错误信息
const errors = reactive({
  email: '',
  general: ''
})

// 表单验证
const validateForm = () => {
  errors.email = ''
  errors.general = ''
  
  if (!form.email.trim()) {
    errors.email = '请输入邮箱地址'
    return false
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    return false
  }
  
  return true
}

// 发送重置邮件
const handleSendResetEmail = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  errors.general = ''

  try {
    await sendPasswordResetEmail(form.email)
    
    step.value = 2
    startResendCountdown()
    
    if (process.client && window.$notify) {
      window.$notify.success('重置邮件已发送', {
        title: '发送成功',
        message: '请检查您的邮箱'
      })
    }
  } catch (error) {
    console.error('发送重置邮件失败:', error)
    errors.general = '发送失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 重新发送邮件
const handleResendEmail = async () => {
  isResending.value = true
  
  try {
    await sendPasswordResetEmail(form.email)
    
    startResendCountdown()
    
    if (process.client && window.$notify) {
      window.$notify.success('邮件已重新发送', {
        title: '发送成功'
      })
    }
  } catch (error) {
    console.error('重新发送失败:', error)
    if (process.client && window.$notify) {
      window.$notify.error('重新发送失败，请稍后重试', {
        title: '发送失败'
      })
    }
  } finally {
    isResending.value = false
  }
}

// 开始重新发送倒计时
const startResendCountdown = () => {
  resendCountdown.value = 60
  
  countdownTimer = setInterval(() => {
    resendCountdown.value--
    
    if (resendCountdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

// 清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
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