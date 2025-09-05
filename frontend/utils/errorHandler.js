// 错误处理工具 - 统一处理API错误和用户友好的错误提示

import { ApiError } from '~/services/api'

// 错误类型枚举
export const ErrorTypes = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  SERVER: 'server',
  CLIENT: 'client',
  UNKNOWN: 'unknown'
}

// 错误严重程度
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

// 错误消息映射
const errorMessages = {
  // 网络错误
  'network_error': '网络连接失败，请检查网络设置',
  'timeout': '请求超时，请稍后重试',
  'connection_refused': '无法连接到服务器',
  
  // 认证错误
  'unauthorized': '登录已过期，请重新登录',
  'forbidden': '权限不足，无法执行此操作',
  'invalid_credentials': '用户名或密码错误',
  'token_expired': '登录已过期，请重新登录',
  'account_locked': '账户已被锁定，请联系管理员',
  'email_not_verified': '邮箱未验证，请先验证邮箱',
  
  // 验证错误
  'validation_failed': '输入信息有误，请检查后重试',
  'required_field_missing': '必填字段不能为空',
  'invalid_email': '邮箱格式不正确',
  'invalid_password': '密码格式不符合要求',
  'password_too_weak': '密码强度不够',
  'passwords_not_match': '两次输入的密码不一致',
  
  // 业务错误
  'user_not_found': '用户不存在',
  'email_already_exists': '邮箱已被注册',
  'username_already_exists': '用户名已被使用',
  'quiz_not_found': '测验不存在',
  'quiz_already_completed': '测验已完成',
  'post_not_found': '帖子不存在',
  'comment_not_found': '评论不存在',
  'insufficient_permissions': '权限不足',
  
  // 服务器错误
  'internal_server_error': '服务器内部错误，请稍后重试',
  'service_unavailable': '服务暂时不可用，请稍后重试',
  'database_error': '数据库错误，请稍后重试',
  'rate_limit_exceeded': '请求过于频繁，请稍后重试',
  
  // 文件上传错误
  'file_too_large': '文件大小超出限制',
  'invalid_file_type': '不支持的文件类型',
  'upload_failed': '文件上传失败',
  
  // 默认错误
  'unknown_error': '发生未知错误，请稍后重试'
}

// 错误处理类
export class ErrorHandler {
  constructor() {
    this.errorLog = []
    this.maxLogSize = 100
  }
  
  // 处理错误
  handle(error, context = {}) {
    const processedError = this.processError(error, context)
    this.logError(processedError)
    
    // 根据错误类型执行相应操作
    this.executeErrorAction(processedError)
    
    return processedError
  }
  
  // 处理错误信息
  processError(error, context) {
    let processedError = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      context,
      originalError: error
    }
    
    if (error instanceof ApiError) {
      processedError = {
        ...processedError,
        type: this.getErrorType(error),
        severity: this.getErrorSeverity(error),
        status: error.status,
        message: this.getErrorMessage(error),
        userMessage: this.getUserFriendlyMessage(error),
        data: error.data,
        isRetryable: this.isRetryable(error)
      }
    } else if (error instanceof Error) {
      processedError = {
        ...processedError,
        type: ErrorTypes.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        message: error.message,
        userMessage: this.getUserFriendlyMessage(error),
        stack: error.stack,
        isRetryable: false
      }
    } else {
      processedError = {
        ...processedError,
        type: ErrorTypes.UNKNOWN,
        severity: ErrorSeverity.LOW,
        message: String(error),
        userMessage: '发生未知错误',
        isRetryable: false
      }
    }
    
    return processedError
  }
  
  // 获取错误类型
  getErrorType(error) {
    if (error.isNetworkError()) return ErrorTypes.NETWORK
    if (error.isAuthError()) return ErrorTypes.AUTH
    if (error.isClientError()) return ErrorTypes.CLIENT
    if (error.isServerError()) return ErrorTypes.SERVER
    if (error.status === 422) return ErrorTypes.VALIDATION
    return ErrorTypes.UNKNOWN
  }
  
  // 获取错误严重程度
  getErrorSeverity(error) {
    if (error.isNetworkError()) return ErrorSeverity.HIGH
    if (error.isAuthError()) return ErrorSeverity.MEDIUM
    if (error.isServerError()) return ErrorSeverity.HIGH
    if (error.status === 422) return ErrorSeverity.LOW
    if (error.status === 429) return ErrorSeverity.MEDIUM
    return ErrorSeverity.MEDIUM
  }
  
  // 获取错误消息
  getErrorMessage(error) {
    if (error.data && error.data.code) {
      return errorMessages[error.data.code] || error.message
    }
    
    // 根据状态码返回默认消息
    switch (error.status) {
      case 400:
        return '请求参数错误'
      case 401:
        return '未授权访问'
      case 403:
        return '权限不足'
      case 404:
        return '请求的资源不存在'
      case 422:
        return '输入数据验证失败'
      case 429:
        return '请求过于频繁'
      case 500:
        return '服务器内部错误'
      case 502:
        return '网关错误'
      case 503:
        return '服务不可用'
      case 504:
        return '网关超时'
      default:
        return error.message || '未知错误'
    }
  }
  
  // 获取用户友好的错误消息
  getUserFriendlyMessage(error) {
    if (error instanceof ApiError) {
      // 检查是否有自定义错误代码
      if (error.data && error.data.code && errorMessages[error.data.code]) {
        return errorMessages[error.data.code]
      }
      
      // 检查是否有验证错误详情
      if (error.status === 422 && error.data && error.data.errors) {
        const firstError = Object.values(error.data.errors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          return firstError[0]
        }
      }
      
      return this.getErrorMessage(error)
    }
    
    return errorMessages.unknown_error
  }
  
  // 判断错误是否可重试
  isRetryable(error) {
    if (error.isNetworkError()) return true
    if (error.status === 408) return true // 请求超时
    if (error.status === 429) return true // 请求过于频繁
    if (error.status >= 500) return true // 服务器错误
    return false
  }
  
  // 执行错误相关操作
  executeErrorAction(processedError) {
    const { type, severity, status } = processedError
    
    // 认证错误处理
    if (type === ErrorTypes.AUTH) {
      this.handleAuthError(processedError)
    }
    
    // 网络错误处理
    if (type === ErrorTypes.NETWORK) {
      this.handleNetworkError(processedError)
    }
    
    // 严重错误上报
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      this.reportError(processedError)
    }
    
    // 显示用户通知
    this.showUserNotification(processedError)
  }
  
  // 处理认证错误
  handleAuthError(error) {
    if (error.status === 401) {
      // 清除认证状态并重定向到登录页
      const { clearAuthState } = useAuth()
      clearAuthState()
      
      if (process.client) {
        const currentRoute = useRoute()
        navigateTo({
          path: '/login',
          query: { redirect: currentRoute.fullPath }
        })
      }
    }
  }
  
  // 处理网络错误
  handleNetworkError(error) {
    // 可以在这里添加网络状态检测和重连逻辑
    console.warn('Network error detected:', error)
  }
  
  // 上报错误
  async reportError(error) {
    try {
      // 只在生产环境上报错误
      if (process.env.NODE_ENV === 'production') {
        const { systemApi } = await import('~/services/api')
        await systemApi.reportError({
          id: error.id,
          type: error.type,
          severity: error.severity,
          message: error.message,
          status: error.status,
          context: error.context,
          timestamp: error.timestamp,
          userAgent: process.client ? navigator.userAgent : null,
          url: process.client ? window.location.href : null
        })
      }
    } catch (reportError) {
      console.warn('Failed to report error:', reportError)
    }
  }
  
  // 显示用户通知
  showUserNotification(error) {
    if (process.client) {
      // 使用 Nuxt 的通知系统或第三方通知库
      const toast = useNuxtApp().$toast
      
      if (toast) {
        const notificationType = this.getNotificationType(error.severity)
        toast[notificationType](error.userMessage, {
          duration: this.getNotificationDuration(error.severity)
        })
      } else {
        // 降级到浏览器原生通知
        console.error('Error:', error.userMessage)
      }
    }
  }
  
  // 获取通知类型
  getNotificationType(severity) {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error'
      case ErrorSeverity.MEDIUM:
        return 'warning'
      case ErrorSeverity.LOW:
        return 'info'
      default:
        return 'error'
    }
  }
  
  // 获取通知持续时间
  getNotificationDuration(severity) {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 0 // 不自动关闭
      case ErrorSeverity.HIGH:
        return 8000
      case ErrorSeverity.MEDIUM:
        return 5000
      case ErrorSeverity.LOW:
        return 3000
      default:
        return 5000
    }
  }
  
  // 记录错误日志
  logError(error) {
    this.errorLog.unshift(error)
    
    // 限制日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }
    
    // 控制台输出
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${error.type}]`)
      console.error('Message:', error.message)
      console.error('User Message:', error.userMessage)
      console.error('Status:', error.status)
      console.error('Context:', error.context)
      console.error('Original Error:', error.originalError)
      console.groupEnd()
    }
  }
  
  // 生成错误ID
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // 获取错误日志
  getErrorLog() {
    return [...this.errorLog]
  }
  
  // 清除错误日志
  clearErrorLog() {
    this.errorLog = []
  }
  
  // 重试操作
  async retry(operation, maxRetries = 3, delay = 1000) {
    let lastError
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        const processedError = this.processError(error)
        
        // 如果错误不可重试，直接抛出
        if (!processedError.isRetryable) {
          throw error
        }
        
        // 最后一次重试失败，抛出错误
        if (i === maxRetries - 1) {
          throw error
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
    
    throw lastError
  }
}

// 创建全局错误处理器实例
const globalErrorHandler = new ErrorHandler()

// 导出错误处理函数
export const handleError = (error, context) => {
  return globalErrorHandler.handle(error, context)
}

// 导出重试函数
export const retryOperation = (operation, maxRetries, delay) => {
  return globalErrorHandler.retry(operation, maxRetries, delay)
}

// 导出错误处理器实例
export { globalErrorHandler }

// 异步错误处理装饰器
export const withErrorHandling = (asyncFn, context = {}) => {
  return async (...args) => {
    try {
      return await asyncFn(...args)
    } catch (error) {
      handleError(error, { ...context, args })
      throw error
    }
  }
}

// Vue 组合式函数
export const useErrorHandler = () => {
  const error = ref(null)
  const isError = computed(() => !!error.value)
  
  const handleAsyncError = async (asyncFn, context = {}) => {
    error.value = null
    
    try {
      return await asyncFn()
    } catch (err) {
      error.value = handleError(err, context)
      throw err
    }
  }
  
  const clearError = () => {
    error.value = null
  }
  
  return {
    error: readonly(error),
    isError,
    handleAsyncError,
    clearError,
    handleError
  }
}