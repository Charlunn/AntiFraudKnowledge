// 认证状态管理 - 处理用户登录状态和令牌管理

import { ref, computed, watch } from 'vue'
import { authApi, ApiError } from '~/services/api'
import { userStorage } from '~/utils/storage'
import { handleError } from '~/utils/errorHandler'
import { USER_ROLES, PERMISSIONS } from '~/constants'

// 全局认证状态
const user = ref(null)
const isAuthenticated = ref(false)
const isLoading = ref(false)
const authError = ref(null)

export const useAuth = () => {
  // 令牌管理
  const authToken = useCookie('auth-token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7, // 7天
    secure: true,
    sameSite: 'strict'
  })

  const refreshToken = useCookie('refresh-token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30, // 30天
    secure: true,
    sameSite: 'strict'
  })

  // 初始化认证状态
  const initializeAuth = () => {
    const storedToken = userStorage.getToken()
    const storedUser = userStorage.getUserInfo()
    
    if (storedToken && storedUser) {
      authToken.value = storedToken
      user.value = storedUser
      isAuthenticated.value = true
    }
  }

  // 计算属性
  const userRole = computed(() => user.value?.role || 'guest')
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')
  const userAvatar = computed(() => user.value?.avatar || '')
  
  // 检查用户权限
  const hasPermission = (permission) => {
    if (!user.value || !user.value.permissions) return false
    if (user.value.role === USER_ROLES.ADMIN) return true // 管理员拥有所有权限
    return user.value.permissions.includes(permission)
  }
  
  // 检查用户角色
  const hasRole = (role) => {
    if (!user.value) return false
    return user.value.role === role || user.value.roles?.includes(role)
  }
  
  // 检查是否为管理员
  const isAdmin = computed(() => hasRole(USER_ROLES.ADMIN))
  
  // 检查是否为版主
  const isModerator = computed(() => hasRole(USER_ROLES.MODERATOR) || isAdmin.value)
  
  // 用户登录
  const login = async (credentials) => {
    isLoading.value = true
    authError.value = null
    
    try {
      // JWT TokenObtainPairSerializer期望username和password字段
      const loginData = {
        username: credentials.username,
        password: credentials.password
      }
      
      const response = await authApi.login(loginData)
      
      // JWT标准响应格式：access, refresh, user
      if (response && response.access) {
        // 保存令牌
        authToken.value = response.access
        refreshToken.value = response.refresh
        
        // 保存用户信息
        user.value = response.user
        isAuthenticated.value = true
        
        // 保存到本地存储
        userStorage.setToken(response.access)
        userStorage.setUserInfo(response.user)
        
        return { success: true, data: response }
      } else {
        console.error('登录响应数据:', response)
        throw new Error('登录响应格式错误')
      }
    } catch (error) {
      const processedError = handleError(error, { action: 'login', credentials: { email: credentials.username } })
      authError.value = processedError.userMessage
      return { success: false, error: processedError.userMessage }
    } finally {
      isLoading.value = false
    }
  }
  
  // 用户注册
  const register = async (userData) => {
    isLoading.value = true
    authError.value = null
    
    try {
      const response = await authApi.register(userData)
      
      // 注册成功，返回结果给调用方处理
      return { success: true, data: response }
    } catch (error) {
      const processedError = handleError(error, { action: 'register', userData: { email: userData.email, username: userData.username } })
      authError.value = processedError.userMessage
      return { success: false, error: processedError.userMessage }
    } finally {
      isLoading.value = false
    }
  }
  
  // 用户登出
  const logout = async () => {
    isLoading.value = true
    
    try {
      // 调用后端登出API
      if (authToken.value) {
        await authApi.logout()
      }
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      // 清除本地状态和存储
      clearAuthState()
      isLoading.value = false
      
      // 重定向到登录页面
      await navigateTo('/auth/login')
    }
  }
  
  // 清除认证状态
  const clearAuthState = () => {
    user.value = null
    isAuthenticated.value = false
    authToken.value = null
    refreshToken.value = null
    authError.value = null
    
    // 清除本地存储
    userStorage.clearUserData()
  }
  
  // 刷新访问令牌
  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }
    
    try {
      const response = await authApi.refreshToken({ refresh: refreshToken.value })
      
      authToken.value = response.access
      if (response.refresh) {
        refreshToken.value = response.refresh
      }
      
      return response.access
    } catch (error) {
      // 刷新令牌失败，清除认证状态
      clearAuthState()
      await navigateTo('/login')
      throw error
    }
  }
  
  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    if (!authToken.value) {
      return null
    }
    
    isLoading.value = true
    
    try {
      const userData = await authApi.getCurrentUser()
      user.value = userData
      isAuthenticated.value = true
      return userData
    } catch (error) {
      if (error instanceof ApiError && error.isAuthError()) {
        // 尝试刷新令牌
        try {
          await refreshAccessToken()
          const userData = await authApi.getCurrentUser()
          user.value = userData
          isAuthenticated.value = true
          return userData
        } catch (refreshError) {
          clearAuthState()
          return null
        }
      }
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // 忘记密码
  const forgotPassword = async (email) => {
    isLoading.value = true
    authError.value = null
    
    try {
      const response = await authApi.forgotPassword(email)
      return response
    } catch (error) {
      const processedError = handleError(error, { action: 'forgotPassword', email })
      authError.value = processedError.userMessage
      throw processedError
    } finally {
      isLoading.value = false
    }
  }
  
  // 重置密码
  const resetPassword = async (token, password) => {
    isLoading.value = true
    authError.value = null
    
    try {
      const response = await authApi.resetPassword(token, password)
      return response
    } catch (error) {
      const processedError = handleError(error, { action: 'resetPassword', token })
      authError.value = processedError.userMessage
      throw processedError
    } finally {
      isLoading.value = false
    }
  }
  
  // 验证邮箱
  const verifyEmail = async (token) => {
    isLoading.value = true
    authError.value = null
    
    try {
      const response = await authApi.verifyEmail(token)
      
      // 如果验证后自动登录
      if (response.access_token) {
        authToken.value = response.access_token
        refreshToken.value = response.refresh_token
        user.value = response.user
        isAuthenticated.value = true
        
        // 保存到本地存储
        userStorage.setToken(response.access_token)
        userStorage.setUserInfo(response.user)
        
        await navigateTo('/dashboard')
      }
      
      return response
    } catch (error) {
      const processedError = handleError(error, { action: 'verifyEmail', token })
      authError.value = processedError.userMessage
      throw processedError
    } finally {
      isLoading.value = false
    }
  }
  
  // 更新用户信息
  const updateUser = (userData) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      // 更新本地存储
      userStorage.setUserInfo(user.value)
    }
  }
  
  // 检查认证状态
  const checkAuthStatus = async () => {
    if (authToken.value && !user.value) {
      try {
        await fetchCurrentUser()
      } catch (error) {
        console.warn('Failed to fetch current user:', error)
      }
    }
  }
  
  // 初始化认证状态
  initializeAuth()
  
  // 监听令牌变化
  watch(authToken, (newToken) => {
    if (newToken && !user.value) {
      // 有令牌但没有用户信息，尝试获取
      fetchCurrentUser().catch(console.warn)
    } else if (!newToken) {
      // 令牌被清除，清除用户信息
      user.value = null
      isAuthenticated.value = false
    }
  }, { immediate: true })
  
  // 自动刷新令牌
  const setupTokenRefresh = () => {
    if (!authToken.value) return
    
    // 解析JWT令牌获取过期时间
    try {
      const payload = JSON.parse(atob(authToken.value.split('.')[1]))
      const expirationTime = payload.exp * 1000 // 转换为毫秒
      const currentTime = Date.now()
      const timeUntilExpiry = expirationTime - currentTime
      
      // 在令牌过期前5分钟刷新
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0)
      
      if (refreshTime > 0) {
        setTimeout(() => {
          refreshAccessToken().catch(console.warn)
        }, refreshTime)
      }
    } catch (error) {
      console.warn('Failed to parse token for auto-refresh:', error)
    }
  }
  
  // 初始化时设置令牌刷新
  if (process.client) {
    setupTokenRefresh()
  }
  
  return {
    // 状态
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    authError: readonly(authError),
    
    // 计算属性
    userRole,
    userName,
    userEmail,
    userAvatar,
    isAdmin,
    isModerator,
    
    // 方法
    initializeAuth,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    fetchCurrentUser,
    updateUser,
    checkAuthStatus,
    refreshAccessToken,
    hasPermission,
    hasRole,
    clearAuthState
  }
}

// 认证中间件
export const authMiddleware = () => {
  const { isAuthenticated, checkAuthStatus } = useAuth()
  
  return {
    // 需要认证的路由守卫
    requireAuth: async () => {
      await checkAuthStatus()
      
      if (!isAuthenticated.value) {
        const currentRoute = useRoute()
        await navigateTo({
          path: '/login',
          query: { redirect: currentRoute.fullPath }
        })
        return false
      }
      
      return true
    },
    
    // 游客路由守卫（已登录用户不能访问）
    requireGuest: async () => {
      await checkAuthStatus()
      
      if (isAuthenticated.value) {
        await navigateTo('/dashboard')
        return false
      }
      
      return true
    },
    
    // 角色权限守卫
    requireRole: (requiredRole) => {
      return async () => {
        await checkAuthStatus()
        
        if (!isAuthenticated.value) {
          const currentRoute = useRoute()
          await navigateTo({
            path: '/login',
            query: { redirect: currentRoute.fullPath }
          })
          return false
        }
        
        const { hasRole } = useAuth()
        if (!hasRole(requiredRole)) {
          throw createError({
            statusCode: 403,
            statusMessage: '权限不足'
          })
        }
        
        return true
      }
    },
    
    // 权限守卫
    requirePermission: (requiredPermission) => {
      return async () => {
        await checkAuthStatus()
        
        if (!isAuthenticated.value) {
          const currentRoute = useRoute()
          await navigateTo({
            path: '/auth/login',
            query: { redirect: currentRoute.fullPath }
          })
          return false
        }
        
        const { hasPermission } = useAuth()
        if (!hasPermission(requiredPermission)) {
          throw createError({
            statusCode: 403,
            statusMessage: '权限不足'
          })
        }
        
        return true
      }
    }
  }
}

// 导出单例实例
let authInstance = null

export const getAuthInstance = () => {
  if (!authInstance) {
    authInstance = useAuth()
  }
  return authInstance
}