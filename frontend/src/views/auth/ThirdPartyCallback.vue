<template>
  <div class="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
    <Card class="w-full max-w-sm">
      <CardContent class="flex flex-col items-center gap-4 py-12 text-center">
        <Loader2 v-if="loading" class="h-12 w-12 animate-spin text-primary" />
        <template v-else-if="error">
          <CircleX class="h-12 w-12 text-destructive" />
        </template>
        <template v-else>
          <CircleCheck class="h-12 w-12 text-success-500" />
        </template>

        <div class="space-y-2">
          <p class="text-base font-semibold text-foreground">
            {{ loading ? '正在处理第三方登录...' : error ? error : '登录成功，正在跳转...' }}
          </p>
          <p v-if="loading" class="text-sm text-muted-foreground">请稍候，我们正在与第三方服务安全通信。</p>
        </div>

        <Button v-if="error" variant="outline" class="mt-2" @click="goToLogin">返回登录</Button>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CircleCheck, CircleX, Loader2 } from 'lucide-vue-next'

import Button from '~/components/ui/button.vue'
import Card from '~/components/ui/card.vue'
import CardContent from '~/components/ui/card-content.vue'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useNotification'
import apiClient from '@/api/http'

const route = useRoute()
const router = useRouter()
const { setUser, setToken } = useAuth()
const { showSuccess, showError } = useToast()

const loading = ref(true)
const error = ref('')

const handleOAuthCallback = async (provider, payload) => {
  try {
    const response = await apiClient.post(`/api/users/oauth/${provider}/login/`, payload)

    if (response.data.success) {
      const { access_token, refresh_token, user } = response.data.data
      setToken(access_token, refresh_token)
      setUser(user)
      showSuccess(`${providerDisplayName(provider)}登录成功`)
      const redirect = route.query.redirect || '/'
      await router.replace(redirect)
    } else {
      throw new Error(response.data.message || `${providerDisplayName(provider)}登录失败`)
    }
  } catch (err) {
    if (err.response?.status === 409 && err.response?.data?.conflict_details) {
      const conflictData = err.response.data
      await router.replace({
        path: '/auth/oauth-conflict',
        query: {
          temp_token: conflictData.temp_token,
          provider
        }
      })
      return
    }

    const message = err.response?.data?.message || err.message || `${providerDisplayName(provider)}登录失败`
    error.value = message
    showError(message)
  } finally {
    loading.value = false
  }
}

const providerDisplayName = (provider) => {
  const map = {
    qq: 'QQ',
    wechat: '微信',
    douyin: '抖音',
    alipay: '支付宝'
  }
  return map[provider] || '第三方'
}

const goToLogin = () => {
  router.replace('/login')
}

onMounted(async () => {
  const { code, auth_code, state, error: authError } = route.query

  if (authError) {
    error.value = `授权失败：${authError}`
    loading.value = false
    showError(error.value)
    return
  }

  const authorizationCode = auth_code || code

  if (!authorizationCode) {
    error.value = '缺少授权码'
    loading.value = false
    showError(error.value)
    return
  }

  const path = route.path

  if (path.includes('/qq/')) {
    await handleOAuthCallback('qq', { code: authorizationCode, state })
  } else if (path.includes('/wechat/')) {
    await handleOAuthCallback('wechat', { code: authorizationCode, state })
  } else if (path.includes('/douyin/')) {
    await handleOAuthCallback('douyin', { code: authorizationCode, state })
  } else if (path.includes('/alipay/')) {
    await handleOAuthCallback('alipay', { auth_code: authorizationCode, state })
  } else {
    error.value = '未知的第三方登录类型'
    loading.value = false
    showError(error.value)
  }
})
</script>