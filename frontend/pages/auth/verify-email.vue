<template>
  <div class="min-h-screen bg-muted/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-foreground">
          邮箱验证
        </h2>
        <p class="mt-2 text-sm text-muted-foreground">
          请检查您的邮箱并点击验证链接
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- 验证状态显示 -->
        <div v-if="verificationStatus === 'loading'" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p class="mt-4 text-muted-foreground">正在验证您的邮箱...</p>
        </div>

        <div v-else-if="verificationStatus === 'success'" class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/20">
            <svg class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-medium text-foreground">邮箱验证成功！</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            您的邮箱已成功验证，现在可以正常使用所有功能。
          </p>
          <div class="mt-6">
            <NuxtLink
              to="/login"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              前往登录
            </NuxtLink>
          </div>
        </div>

        <div v-else-if="verificationStatus === 'error'" class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10">
            <svg class="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-medium text-foreground">验证失败</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            {{ errorMessage || '邮箱验证失败，请检查验证链接是否正确或已过期。' }}
          </p>
          <div class="mt-6 space-y-3">
            <button
              @click="resendVerification"
              :disabled="resending"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {{ resending ? '发送中...' : '重新发送验证邮件' }}
            </button>
            <NuxtLink
              to="/register"
              class="w-full flex justify-center py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-card hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              返回注册
            </NuxtLink>
          </div>
        </div>

        <!-- 默认状态 -->
        <div v-else class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/20">
            <svg class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-medium text-foreground">验证邮件已发送</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            我们已向您的邮箱发送了验证链接，请查收并点击链接完成验证。
          </p>
          <div class="mt-6 space-y-3">
            <button
              @click="resendVerification"
              :disabled="resending"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {{ resending ? '发送中...' : '重新发送验证邮件' }}
            </button>
            <NuxtLink
              to="/login"
              class="w-full flex justify-center py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-card hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              返回登录
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '~/services/api'

// 页面元数据
useHead({
  title: '邮箱验证 - 反欺诈知识图谱',
  meta: [
    { name: 'description', content: '验证您的邮箱地址以完成注册' }
  ]
})

const route = useRoute()
const router = useRouter()

// 响应式数据
const verificationStatus = ref('idle') // idle, loading, success, error
const errorMessage = ref('')
const resending = ref(false)

// 验证邮箱
const verifyEmail = async () => {
  const token = route.query.token
  const uid = route.query.uid
  
  if (!token || !uid) {
    verificationStatus.value = 'error'
    errorMessage.value = '验证链接无效，缺少必要参数。'
    return
  }

  verificationStatus.value = 'loading'
  
  try {
    await authApi.verifyEmail({ uid, token })
    verificationStatus.value = 'success'
    
    // 3秒后自动跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (error) {
    verificationStatus.value = 'error'
    errorMessage.value = error.message || '邮箱验证失败，请重试。'
  }
}

// 重新发送验证邮件
const resendVerification = async () => {
  resending.value = true
  
  try {
    // 这里需要用户邮箱信息，可能需要从localStorage获取或让用户重新输入
    const email = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('pendingVerificationEmail') : null
    if (!email) {
      throw new Error('无法获取邮箱信息，请重新注册。')
    }
    
    await authApi.resendVerification({ email })
    
    // 显示成功消息
    verificationStatus.value = 'idle'
    
    // 可以添加toast提示
  } catch (error) {
    errorMessage.value = error.message || '重新发送失败，请稍后重试。'
  } finally {
    resending.value = false
  }
}

// 页面加载时检查是否有验证参数
onMounted(() => {
  if (route.query.token && route.query.uid) {
    verifyEmail()
  }
})
</script>

<style scoped>
/* 添加一些自定义样式 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>