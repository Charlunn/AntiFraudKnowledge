<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <Separator class="flex-1" />
      <span class="text-xs uppercase tracking-wider text-muted-foreground">或使用第三方登录</span>
      <Separator class="flex-1" />
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <Button
        v-for="provider in providers"
        :key="provider.name"
        type="button"
        variant="outline"
        class="flex items-center justify-center gap-3"
        :disabled="loading"
        @click="handleThirdPartyLogin(provider)"
      >
        <span :class="['flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold', provider.badgeClass]">
          {{ provider.initial }}
        </span>
        <span class="text-sm font-medium">{{ provider.label }}</span>
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import Button from '~/components/ui/button.vue'
import Separator from '~/components/ui/separator.vue'
import { useToast } from '~/composables/useNotification'

const loading = ref(false)
const { showError } = useToast()

const QQ_APP_ID = '你的QQ应用ID'
const QQ_REDIRECT_URI = encodeURIComponent('http://localhost:3001/auth/qq/callback')
const WECHAT_APP_ID = '你的微信应用ID'
const WECHAT_REDIRECT_URI = encodeURIComponent('http://localhost:3001/auth/wechat/callback')

const providers = [
  {
    name: 'qq',
    label: 'QQ 登录',
    badgeClass: 'bg-primary/10 text-primary',
    initial: 'QQ',
    buildUrl: () =>
      `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${QQ_APP_ID}&redirect_uri=${QQ_REDIRECT_URI}&scope=get_user_info&state=qq_login`
  },
  {
    name: 'wechat',
    label: '微信登录',
    badgeClass: 'bg-success-100 text-success-700',
    initial: 'WX',
    buildUrl: () =>
      `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_APP_ID}&redirect_uri=${WECHAT_REDIRECT_URI}&response_type=code&scope=snsapi_login&state=wechat_login`
  }
]

const handleThirdPartyLogin = (provider) => {
  if (!provider.buildUrl) {
    showError('暂不支持该第三方登录方式')
    return
  }

  loading.value = true
  window.location.href = provider.buildUrl()
}
</script>