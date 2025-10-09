<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-4 py-12">
    <div class="w-full max-w-md space-y-8">
      <div class="space-y-2 text-center">
        <h1 class="text-3xl font-semibold tracking-tight text-foreground">欢迎回到澄源</h1>
        <p class="text-sm text-muted-foreground">使用您的账户登录，继续构建更坚实的反诈防线。</p>
      </div>

      <Card>
        <CardHeader class="space-y-1">
          <CardTitle class="text-2xl">账户登录</CardTitle>
          <CardDescription>请输入登录凭证，或使用下方的第三方账户登录。</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-6" @submit.prevent="handleLogin">
            <div class="space-y-2">
              <Label for="username">用户名或邮箱</Label>
              <div class="relative">
                <Input
                  id="username"
                  v-model="formData.username"
                  type="text"
                  placeholder="请输入用户名或邮箱"
                  autocomplete="username"
                  @blur="handleFieldBlur('username')"
                  :class="hasFieldError('username') ? 'border-destructive focus-visible:ring-destructive' : ''"
                />
                <Mail class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <p v-if="hasFieldError('username')" class="text-sm text-destructive">{{ getFieldError('username')[0] }}</p>
            </div>

            <div class="space-y-2">
              <Label for="password">密码</Label>
              <div class="relative">
                <Input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                  @blur="handleFieldBlur('password')"
                  :class="hasFieldError('password') ? 'border-destructive focus-visible:ring-destructive' : ''"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                  @click="showPassword = !showPassword"
                >
                  <Eye class="h-4 w-4" v-if="!showPassword" />
                  <EyeOff class="h-4 w-4" v-else />
                </Button>
              </div>
              <p v-if="hasFieldError('password')" class="text-sm text-destructive">{{ getFieldError('password')[0] }}</p>
            </div>

            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 text-muted-foreground">
                <input v-model="formData.rememberMe" type="checkbox" class="h-4 w-4 rounded border-border" />
                记住我
              </label>
              <NuxtLink to="/forgot-password" class="font-medium text-primary hover:text-primary/80">忘记密码？</NuxtLink>
            </div>

            <Button type="submit" class="w-full" :disabled="!canSubmit || isSubmitting">
              <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              {{ isSubmitting ? '登录中...' : '登录' }}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div v-if="shouldShowOAuthUI" class="space-y-4">
        <div v-if="shouldShowOAuthDivider" class="flex items-center gap-4">
          <Separator class="flex-1" />
          <span class="text-xs uppercase tracking-wide text-muted-foreground">或使用以下方式</span>
          <Separator class="flex-1" />
        </div>
        <Card>
          <CardContent class="grid gap-3 pt-6 sm:grid-cols-2">
            <Button
              v-for="platform in availableOAuthPlatforms"
              :key="platform.name"
              variant="outline"
              class="flex items-center justify-center gap-2"
              type="button"
              @click="handleOAuthLogin(platform.name)"
            >
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                {{ platform.displayName.charAt(0) }}
              </span>
              <span>{{ platform.displayName }}</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p class="text-center text-sm text-muted-foreground">
        还没有账户？
        <NuxtLink to="/register" class="font-medium text-primary hover:text-primary/80">立即注册</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, Loader2, Mail } from 'lucide-vue-next'

import Button from '~/components/ui/button.vue'
import Card from '~/components/ui/card.vue'
import CardContent from '~/components/ui/card-content.vue'
import CardDescription from '~/components/ui/card-description.vue'
import CardHeader from '~/components/ui/card-header.vue'
import CardTitle from '~/components/ui/card-title.vue'
import Input from '~/components/ui/input.vue'
import Label from '~/components/ui/label.vue'
import Separator from '~/components/ui/separator.vue'

import { useAuth } from '~/composables/useAuth'
import { useLoginForm } from '~/composables/useForm'
import { useToast } from '~/composables/useNotification'
import { useOAuth } from '~/composables/useOAuth'

useHead({
  title: '登录',
  meta: [
    { name: 'description', content: '登录澄源反诈平台，继续您的学习与防诈旅程。' }
  ]
})

const router = useRouter()
const { login } = useAuth()
const { showSuccess, showError } = useToast()

const {
  shouldShowOAuthUI,
  shouldShowOAuthDivider,
  getAvailableOAuthPlatforms,
  handleOAuthLogin
} = useOAuth()

const availableOAuthPlatforms = getAvailableOAuthPlatforms()
const showPassword = ref(false)

const {
  formData,
  isSubmitting,
  canSubmit,
  submitForm,
  handleFieldBlur,
  hasFieldError,
  getFieldError
} = useLoginForm(async (credentials) => {
  const result = await login(credentials)

  if (result.success) {
    showSuccess('登录成功，欢迎回来！')
    const redirect = router.currentRoute.value.query.redirect || '/dashboard'
    await router.push(redirect)
  } else {
    showError(result.error || '登录失败，请重试')
  }

  return result
})

const handleLogin = async () => {
  await submitForm()
}

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})
</script>