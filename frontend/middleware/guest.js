export default defineNuxtRouteMiddleware(async (to, from) => {
  // 只在客户端执行认证检查
  if (process.server) return
  
  const { isAuthenticated, checkAuthStatus } = useAuth()
  
  // 检查当前认证状态
  await checkAuthStatus()
  
  // 如果用户已认证，重定向到仪表盘
  if (isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
})