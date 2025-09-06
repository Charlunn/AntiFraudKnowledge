<template>
  <div class="callback-container">
    <div class="callback-content">
      <div v-if="loading" class="loading">
        <Icon name="eos-icons:loading" size="48" />
        <p>正在处理微信登录...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <Icon name="material-symbols:error" size="48" color="#f56c6c" />
        <p>{{ error }}</p>
        <button class="btn-primary" @click="goToLogin">返回登录</button>
      </div>
      
      <div v-else class="success">
        <Icon name="material-symbols:check-circle" size="48" color="#67c23a" />
        <p>微信登录成功，正在跳转...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const router = useRouter()
const { setUser, setToken } = useAuth()

const loading = ref(true)
const error = ref('')

const handleWeChatCallback = async (code, state) => {
  try {
    const { $api } = useNuxtApp()
    
    const response = await $api('/api/users/oauth/wechat/login/', {
      method: 'POST',
      body: {
        code,
        state
      }
    })
    
    if (response.success) {
      const { access_token, refresh_token, user } = response.data
      
      // 设置token和用户信息
      setToken(access_token, refresh_token)
      setUser(user)
      
      // 显示成功消息
      useNuxtApp().$toast?.success('微信登录成功')
      
      // 跳转到首页或之前的页面
      const redirect = route.query.redirect || '/'
      await navigateTo(redirect)
    } else {
      throw new Error(response.message || '微信登录失败')
    }
  } catch (err) {
    console.error('WeChat login error:', err)
    error.value = err.data?.message || err.message || '微信登录失败'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  navigateTo('/login')
}

onMounted(async () => {
  const { code, state, error: authError } = route.query
  
  if (authError) {
    error.value = '授权失败：' + authError
    loading.value = false
    return
  }
  
  if (!code) {
    error.value = '缺少授权码'
    loading.value = false
    return
  }
  
  await handleWeChatCallback(code, state)
})
</script>

<style scoped>
.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.callback-content {
  background: white;
  padding: 48px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 300px;
}

.loading,
.error,
.success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading p,
.error p,
.success p {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

.btn-primary {
  background: #409eff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #337ecc;
}
</style>