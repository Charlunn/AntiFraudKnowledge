export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, checkAuthStatus } = useAuth()
  
  // 检查当前认证状态
  await checkAuthStatus()
  
  // 如果用户已认证，重定向到仪表盘
  if (isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
})