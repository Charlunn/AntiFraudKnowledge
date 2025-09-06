<template>
  <div class="callback-container">
    <div class="callback-content">
      <div v-if="loading" class="loading">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <p>正在处理第三方登录...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <el-icon>
          <CircleClose />
        </el-icon>
        <p>{{ error }}</p>
        <el-button @click="goToLogin">返回登录</el-button>
      </div>
      
      <div v-else class="success">
        <el-icon>
          <CircleCheck />
        </el-icon>
        <p>登录成功，正在跳转...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { ElMessage } from 'element-plus'
import { Loading, CircleClose, CircleCheck } from '@element-plus/icons-vue'
import apiClient from '@/api/http'

const route = useRoute()
const router = useRouter()
const { setUser, setToken } = useAuth()

const loading = ref(true)
const error = ref('')

const handleQQCallback = async (code, state) => {
  try {
    const response = await apiClient.post('/api/users/oauth/qq/login/', {
      code,
      state
    })
    
    if (response.data.success) {
      const { access_token, refresh_token, user } = response.data.data
      
      // 设置token和用户信息
      setToken(access_token, refresh_token)
      setUser(user)
      
      ElMessage.success('QQ登录成功')
      
      // 跳转到首页或之前的页面
      const redirect = route.query.redirect || '/'
      router.replace(redirect)
    } else {
      throw new Error(response.data.message || 'QQ登录失败')
    }
  } catch (err) {
    console.error('QQ login error:', err)
    
    // 检查是否是账户冲突
    if (err.response?.status === 409 && err.response?.data?.conflict_details) {
      // 跳转到冲突处理页面
      const conflictData = err.response.data
      router.replace({
        path: '/auth/oauth-conflict',
        query: {
          temp_token: conflictData.temp_token,
          provider: 'qq'
        }
      })
      return
    }
    
    error.value = err.response?.data?.message || err.message || 'QQ登录失败'
  } finally {
    loading.value = false
  }
}

const handleWeChatCallback = async (code, state) => {
  try {
    const response = await apiClient.post('/api/users/oauth/wechat/login/', {
      code,
      state
    })
    
    if (response.data.success) {
      const { access_token, refresh_token, user } = response.data.data
      
      // 设置token和用户信息
      setToken(access_token, refresh_token)
      setUser(user)
      
      ElMessage.success('微信登录成功')
      
      // 跳转到首页或之前的页面
      const redirect = route.query.redirect || '/'
      router.replace(redirect)
    } else {
      throw new Error(response.data.message || '微信登录失败')
    }
  } catch (err) {
    console.error('WeChat login error:', err)
    
    // 检查是否是账户冲突
    if (err.response?.status === 409 && err.response?.data?.conflict_details) {
      // 跳转到冲突处理页面
      const conflictData = err.response.data
      router.replace({
        path: '/auth/oauth-conflict',
        query: {
          temp_token: conflictData.temp_token,
          provider: 'wechat'
        }
      })
      return
    }
    
    error.value = err.response?.data?.message || err.message || '微信登录失败'
  } finally {
    loading.value = false
  }
}

const handleDouyinCallback = async (code, state) => {
  try {
    const response = await apiClient.post('/api/users/oauth/douyin/login/', {
      code,
      state
    })
    
    if (response.data.success) {
      const { access_token, refresh_token, user } = response.data.data
      
      // 设置token和用户信息
      setToken(access_token, refresh_token)
      setUser(user)
      
      ElMessage.success('抖音登录成功')
      
      // 跳转到首页或之前的页面
      const redirect = route.query.redirect || '/'
      router.replace(redirect)
    } else {
      throw new Error(response.data.message || '抖音登录失败')
    }
  } catch (err) {
    console.error('Douyin login error:', err)
    
    // 检查是否是账户冲突
    if (err.response?.status === 409 && err.response?.data?.conflict_details) {
      // 跳转到冲突处理页面
      const conflictData = err.response.data
      router.replace({
        path: '/auth/oauth-conflict',
        query: {
          temp_token: conflictData.temp_token,
          provider: 'douyin'
        }
      })
      return
    }
    
    error.value = err.response?.data?.message || err.message || '抖音登录失败'
  } finally {
    loading.value = false
  }
}

const handleAlipayCallback = async (auth_code, state) => {
  try {
    const response = await apiClient.post('/api/users/oauth/alipay/login/', {
      auth_code,
      state
    })
    
    if (response.data.success) {
      const { access_token, refresh_token, user } = response.data.data
      
      // 设置token和用户信息
      setToken(access_token, refresh_token)
      setUser(user)
      
      ElMessage.success('支付宝登录成功')
      
      // 跳转到首页或之前的页面
      const redirect = route.query.redirect || '/'
      router.replace(redirect)
    } else {
      throw new Error(response.data.message || '支付宝登录失败')
    }
  } catch (err) {
    console.error('Alipay login error:', err)
    
    // 检查是否是账户冲突
    if (err.response?.status === 409 && err.response?.data?.conflict_details) {
      // 跳转到冲突处理页面
      const conflictData = err.response.data
      router.replace({
        path: '/auth/oauth-conflict',
        query: {
          temp_token: conflictData.temp_token,
          provider: 'alipay'
        }
      })
      return
    }
    
    error.value = err.response?.data?.message || err.message || '支付宝登录失败'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.replace('/login')
}

onMounted(async () => {
  const { code, auth_code, state, error: authError } = route.query
  
  if (authError) {
    error.value = '授权失败：' + authError
    loading.value = false
    return
  }
  
  // 支付宝使用auth_code，其他平台使用code
  const authorizationCode = auth_code || code
  
  if (!authorizationCode) {
    error.value = '缺少授权码'
    loading.value = false
    return
  }
  
  // 根据路径判断第三方登录类型
  const path = route.path
  
  if (path.includes('/qq/')) {
    await handleQQCallback(authorizationCode, state)
  } else if (path.includes('/wechat/')) {
    await handleWeChatCallback(authorizationCode, state)
  } else if (path.includes('/douyin/')) {
    await handleDouyinCallback(authorizationCode, state)
  } else if (path.includes('/alipay/')) {
    await handleAlipayCallback(authorizationCode, state)
  } else {
    error.value = '未知的第三方登录类型'
    loading.value = false
  }
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

.loading .el-icon {
  font-size: 48px;
  color: #409eff;
}

.error .el-icon {
  font-size: 48px;
  color: #f56c6c;
}

.success .el-icon {
  font-size: 48px;
  color: #67c23a;
}

.loading p,
.error p,
.success p {
  margin: 0;
  font-size: 16px;
  color: #606266;
}
</style>