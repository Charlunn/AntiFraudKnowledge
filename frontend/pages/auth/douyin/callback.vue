<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/40 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-foreground">
          抖音登录处理中...
        </h2>
        <div class="mt-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const { code, state } = route.query
    
    if (!code) {
      throw new Error('授权码缺失')
    }
    
    // 调用后端抖音OAuth登录接口
    const response = await $fetch('/api/users/oauth/douyin/login/', {
      method: 'POST',
      body: {
        code,
        state
      }
    })
    
    if (response.access_token) {
      // 登录成功，保存token
      authStore.setTokens({
        access: response.access_token,
        refresh: response.refresh_token
      })
      
      // 跳转到仪表板
      await router.push('/dashboard')
    } else if (response.requires_registration) {
      // 需要补全注册信息
      await router.push({
        path: '/auth/oauth-register',
        query: {
          provider: 'douyin',
          temp_token: response.temp_token,
          user_info: JSON.stringify(response.user_info)
        }
      })
    } else if (response.conflict) {
      // 账户冲突，需要处理
      await router.push({
        path: '/auth/oauth-conflict',
        query: {
          provider: 'douyin',
          temp_token: response.temp_token,
          conflict_info: JSON.stringify(response.conflict_info)
        }
      })
    }
  } catch (error) {
    console.error('抖音登录失败:', error)
    
    // 显示错误信息并跳转到登录页
    await router.push({
      path: '/login',
      query: {
        error: '抖音登录失败，请重试',
        provider: 'douyin'
      }
    })
  }
})
</script>