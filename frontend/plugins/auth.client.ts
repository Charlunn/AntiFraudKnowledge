import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(async (nuxtApp) => {
  // 只在客户端执行
  if (process.server) {
    return
  }

  const { initializeAuth } = useAuth()

  // 在应用挂载前调用，以确保认证状态在任何页面渲染前都已设置
  initializeAuth()

  // 你也可以在这里添加其他只在客户端运行的认证相关逻辑
  // 例如，设置一个定时器来刷新令牌
})