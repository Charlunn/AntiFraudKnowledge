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
  // OAuth 2.0 令牌管理
  const accessToken = useCookie('access-token', {
    default: () => null,
    maxAge: 60 * 60, // 1小时 (OAuth 2.0 access token)
    secure: true,
    sameSite: 'strict'
  })

  const refreshToken = useCookie('refresh-token', {
    default: () => null,
    maxAge: 60 * 60 * 24, // 24小时 (OAuth 2.0 refresh token)
    secure: true,
    sameSite: 'strict'
  })



  // 清除认证状态
  const clearAuthState = () => {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    isAuthenticated.value = false
    authError.value = null
    
    // 清除本地存储
    if (process.client) {
      userStorage.removeToken()
      userStorage.removeUserInfo()
      
      // 清除cookies
      const accessTokenCookie = useCookie('access-token')
      const refreshTokenCookie = useCookie('refresh-token')
      accessTokenCookie.value = null
      refreshTokenCookie.value = null
    }
  }

  // 初始化认证状态 - 服务端和客户端都执行
  const initializeAuth = () => {
    // 首先从cookies获取token（服务端和客户端都可用）
    const accessTokenCookie = useCookie('access-token')
    const refreshTokenCookie = useCookie('refresh-token')
    
    if (accessTokenCookie.value) {
      accessToken.value = accessTokenCookie.value
      refreshToken.value = refreshTokenCookie.value
      isAuthenticated.value = true
      
      // 在客户端时，同步本地存储的用户信息
      if (process.client) {
        const storedUser = userStorage.getUserInfo()
        if (storedUser) {
          user.value = storedUser
        }
      }
    } else {
      // 没有认证信息时确保状态一致
      clearAuthState()
    }
  }

  // 立即调用初始化
  initializeAuth()

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
  
  // JWT 用户登录
  const login = async (credentials) => {
    isLoading.value = true
    authError.value = null
    
    try {
      // JWT 登录数据
      const loginData = {
        username: credentials.username,
        password: credentials.password
      }
      
      const response = await authApi.login(loginData)
      
      // JWT标准响应格式：access_token, refresh_token, user
      if (response && response.access_token) {
        // 保存令牌
        accessToken.value = response.access_token
        refreshToken.value = response.refresh_token
        
        // 保存用户信息
        user.value = response.user
        isAuthenticated.value = true
        
        // 保存到本地存储和cookie
        userStorage.setToken(response.access_token)
        userStorage.setUserInfo(response.user)
        
        // 同时保存到cookie以确保API调用能获取到token
        const accessTokenCookie = useCookie('access-token', {
          default: () => null,
          maxAge: 7 * 24 * 60 * 60 // 7天
        })
        accessTokenCookie.value = response.access_token
        
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
  
  // JWT 用户登出
  const logout = async () => {
    isLoading.value = true
    
    try {
      // 调用后端JWT登出API，传递refresh token
      if (refreshToken.value) {
        await authApi.logout(refreshToken.value)
      }
    } catch (error) {
      console.warn('JWT logout API call failed:', error)
    } finally {
      // 清除本地状态和存储
      clearAuthState()
      isLoading.value = false
      
      // 重定向到登录页面
      await navigateTo('/login')
    }
  }
  

  
  // JWT 刷新访问令牌
  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      clearAuthState()
      throw new Error('No refresh token available')
    }
    
    try {
      const response = await authApi.refreshToken({ 
        refresh: refreshToken.value
      })
      
      accessToken.value = response.access_token
      if (response.refresh_token) {
        refreshToken.value = response.refresh_token
      }
      
      // 更新本地存储
      userStorage.setToken(response.access_token)
      
      // 更新cookie中的token
      const accessTokenCookie = useCookie('access-token', {
        default: () => null,
        maxAge: 7 * 24 * 60 * 60 // 7天
      })
      accessTokenCookie.value = response.access_token
      
      // 更新refresh token cookie
      if (response.refresh_token) {
        const refreshTokenCookie = useCookie('refresh-token', {
          default: () => null,
          maxAge: 60 * 60 * 24 // 24小时
        })
        refreshTokenCookie.value = response.refresh_token
      }
      
      return response.access_token
    } catch (error) {
      // 刷新令牌失败（可能已被列入黑名单），彻底清除认证状态
      console.warn('Token refresh failed, clearing auth state:', error)
      clearAuthState()
      await navigateTo('/login')
      throw error
    }
  }
  
  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    if (!accessToken.value) {
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
      // 对于所有其他错误，清理认证状态并返回null，而不是重新抛出错误
      console.warn('获取用户信息失败:', error)
      clearAuthState()
      return null
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
        accessToken.value = response.access_token
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
    if (accessToken.value && !user.value) {
      try {
        await fetchCurrentUser()
      } catch (error) {
        console.warn('Failed to fetch current user:', error)
        // 如果获取用户信息失败，清理认证状态
        clearAuth()
      }
    }
  }
  
  // 初始化认证状态
  initializeAuth()
  
  // 监听令牌变化
  watch(accessToken, (newToken) => {
    if (newToken && !user.value) {
      // 有令牌但没有用户信息，尝试获取
      fetchCurrentUser().catch(console.warn)
    } else if (!newToken) {
      // 令牌被清除，清除用户信息
      user.value = null
      isAuthenticated.value = false
    }
  }, { immediate: true })
  
  // OAuth 2.0 自动刷新令牌
  const setupTokenRefresh = () => {
    if (!accessToken.value) return
    
    // OAuth 2.0 access token 通常1小时过期，设置50分钟后刷新
    const refreshTime = 50 * 60 * 1000 // 50分钟
    
    setTimeout(() => {
      if (refreshToken.value) {
        refreshAccessToken().catch(console.warn)
      }
    }, refreshTime)
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
    accessToken: readonly(accessToken),
    refreshToken: readonly(refreshToken),
    
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
            path: '/login',
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