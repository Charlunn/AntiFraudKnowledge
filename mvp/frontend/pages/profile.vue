<template>
  <div class="space-y-6">
    <PageHeader title="用户主页" description="管理个人资料与通知偏好" />
    <div class="grid gap-6 md:grid-cols-2">
      <Card class="border border-border/70">
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>更新昵称、邮箱与手机号。</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit.prevent="saveProfile">
            <div>
              <Label for="nickname">昵称</Label>
              <Input id="nickname" v-model="profileForm.nickname" placeholder="反诈骑士" />
            </div>
            <div>
              <Label for="email">邮箱</Label>
              <Input id="email" v-model="profileForm.email" type="email" placeholder="you@example.com" />
            </div>
            <div>
              <Label for="phone">手机号</Label>
              <Input id="phone" v-model="profileForm.phone_number" placeholder="138****" />
            </div>
            <Button type="submit" class="w-full" :disabled="profileLoading">
              {{ profileLoading ? '保存中...' : '保存个人资料' }}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card class="border border-border/70">
        <CardHeader>
          <CardTitle>通知偏好</CardTitle>
          <CardDescription>配置站内提醒方式。</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit.prevent="saveSettings">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">邮件通知</p>
                <p class="text-xs text-muted-foreground">重要事件提醒</p>
              </div>
              <Switch v-model:checked="settingsForm.email_notifications" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">推送通知</p>
                <p class="text-xs text-muted-foreground">实时互动更新</p>
              </div>
              <Switch v-model:checked="settingsForm.push_notifications" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">短信通知</p>
                <p class="text-xs text-muted-foreground">关键安全提醒</p>
              </div>
              <Switch v-model:checked="settingsForm.sms_notifications" />
            </div>
            <Button type="submit" class="w-full" variant="outline" :disabled="settingsLoading">
              {{ settingsLoading ? '保存中...' : '保存通知设置' }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: true,
})

const profileLoading = ref(false)
const settingsLoading = ref(false)
const { $api } = useNuxtApp()

const profileForm = reactive({
  nickname: '',
  email: '',
  phone_number: '',
})

const settingsForm = reactive({
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
})

const loadProfile = async () => {
  const [{ data: profile }, { data: settings }] = await Promise.all([
    $api.get('/users/profile/'),
    $api.get('/users/settings/'),
  ])
  Object.assign(profileForm, profile)
  Object.assign(settingsForm, settings)
}

const saveProfile = async () => {
  profileLoading.value = true
  try {
    await $api.put('/users/profile/', profileForm)
    useMessage('资料已更新')
  } finally {
    profileLoading.value = false
  }
}

const saveSettings = async () => {
  settingsLoading.value = true
  try {
    await $api.put('/users/settings/', settingsForm)
    useMessage('通知设置已更新')
  } finally {
    settingsLoading.value = false
  }
}

const useMessage = (msg: string) => {
  if (process.client) window.alert(msg)
}

onMounted(loadProfile)
</script>
