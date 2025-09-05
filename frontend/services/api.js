// API服务层 - 管理与后端的HTTP通信

// API基础配置
const getApiBaseUrl = () => {
  // 在Nuxt 3中，客户端需要使用useRuntimeConfig
  if (process.client) {
    try {
      const config = useRuntimeConfig()
      return config.public.apiBase || '/api'
    } catch {
      return '/api'
    }
  }
  // 服务端可以直接使用环境变量
  return process.env.NUXT_PUBLIC_API_BASE || '/api'
}

const API_TIMEOUT = 30000 // 30秒超时

// 创建HTTP客户端实例
class ApiClient {
  constructor() {
    this.baseURL = getApiBaseUrl()
    this.timeout = API_TIMEOUT
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  // 获取认证头
  getAuthHeaders() {
    const token = useCookie('access-token').value
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...options.headers
    }

    const config = {
      method: options.method || 'GET',
      headers,
      ...options
    }

    // 处理请求体
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    // 添加调试日志（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        url,
        method: config.method,
        headers: Object.keys(headers),
        bodyLength: config.body ? config.body.length : 0
      })
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      // 处理HTTP错误状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        )
      }

      // 处理空响应
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return response.text()
      }

      return await response.json()
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError('请求超时', 408)
      }
      
      if (error instanceof ApiError) {
        throw error
      }
      
      throw new ApiError('网络连接失败', 0, { originalError: error })
    }
  }

  // GET请求
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: 'GET' })
  }

  // POST请求
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data
    })
  }

  // PUT请求
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data
    })
  }

  // PATCH请求
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data
    })
  }

  // DELETE请求
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  // 文件上传
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData()
    formData.append('file', file)
    
    // 添加额外数据
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key])
    })

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // 不设置Content-Type，让浏览器自动设置multipart/form-data边界
        ...this.getAuthHeaders()
      }
    })
  }
}

// API错误类
class ApiError extends Error {
  constructor(message, status = 0, data = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }

  // 判断是否为认证错误
  isAuthError() {
    return this.status === 401 || this.status === 403
  }

  // 判断是否为网络错误
  isNetworkError() {
    return this.status === 0
  }

  // 判断是否为服务器错误
  isServerError() {
    return this.status >= 500
  }

  // 判断是否为客户端错误
  isClientError() {
    return this.status >= 400 && this.status < 500
  }
}

// 创建API客户端实例
const apiClient = new ApiClient()

// 认证相关API
export const authApi = {
  // OAuth 2.0 用户登录
  login: (credentials) => apiClient.post('/users/login/', credentials),
  
  // 用户注册
  register: (userData) => {
    // 转换前端字段名到后端期望的字段名
    const backendData = {
      ...userData,
      password2: userData.confirmPassword // 后端期望password2而不是confirmPassword
    }
    // 删除前端字段
    delete backendData.confirmPassword
    delete backendData.agreeToTerms // 后端不需要这个字段
    
    return apiClient.post('/users/register/', backendData)
  },
  
  // OAuth 2.0 刷新令牌
  refreshToken: (refreshData) => apiClient.post('/users/token/refresh/', refreshData),
  
  // OAuth 2.0 用户登出
  logout: () => apiClient.post('/users/logout/'),

  // OAuth 2.0 验证令牌
  verifyToken: (token) => apiClient.post('/users/token/verify/', { token }),

  // 忘记密码
  forgotPassword: (email) => apiClient.post('/users/password/reset/', { email }),

  // 重置密码
  resetPassword: (data) => apiClient.post('/users/password/reset/confirm/', data),

  // 验证邮箱
  verifyEmail: (data) => apiClient.post('/users/verify-email/', data),

  // 获取当前用户信息
  getCurrentUser: () => apiClient.get('/users/profile/')
}

// 用户相关API
export const userApi = {
  // 获取用户资料
  getProfile: (userId) => apiClient.get('/users/profile/'),
  
  // 更新用户资料
  updateProfile: (data) => apiClient.put('/users/profile/', data),
  
  // 修改密码
  changePassword: (data) => apiClient.post('/users/password/change/', data),
  
  // 获取用户统计
  getStats: (userId) => apiClient.get('/users/stats/'),
  
  // 获取用户成就
  getAchievements: (userId) => apiClient.get(`/users/${userId || 'me'}/achievements/`),
  
  // 获取学习记录
  getLearningRecords: (userId, params) => apiClient.get(`/users/${userId || 'me'}/learning-records/`, params),
  
  // 绑定邮箱
  bindEmail: (data) => apiClient.post('/users/bind-email/', data),
  
  // 绑定手机
  bindPhone: (data) => apiClient.post('/users/bind-phone/', data),
  
  // 解绑邮箱
  unbindEmail: () => apiClient.post('/users/unbind-email/'),
  
  // 解绑手机
  unbindPhone: () => apiClient.post('/users/unbind-phone/'),
  
  // 用户设置
  getSettings: () => apiClient.get('/users/settings/'),
  updateSettings: (data) => apiClient.put('/users/settings/', data),
  
  // 删除账户
  deleteAccount: () => apiClient.delete('/users/delete-account/')
}

// 知识图谱相关API
export const graphApi = {
  // 获取图谱数据
  getGraph: (params) => apiClient.get('/graph/', params),
  
  // 搜索节点
  searchNodes: (query, params) => apiClient.get('/graph/search/', { query, ...params }),
  
  // 获取节点详情
  getNode: (nodeId) => apiClient.get(`/graph/nodes/${nodeId}/`),
  
  // 获取节点关系
  getNodeRelations: (nodeId, params) => apiClient.get(`/graph/nodes/${nodeId}/relations/`, params),
  
  // 执行图分析
  executeAnalysis: (analysisType, params) => apiClient.post('/graph/analysis/', { type: analysisType, ...params }),
  
  // 执行复杂查询
  executeComplexQuery: (query) => apiClient.post('/graph/query/', query),
  
  // 获取图统计
  getGraphStats: () => apiClient.get('/graph/stats/'),
  
  // 导出图数据
  exportGraph: (format, params) => apiClient.get('/graph/export', { format, ...params })
}

// 测验相关API
export const quizApi = {
  // 获取题目列表
  getQuestions: (params) => apiClient.get('/quiz/questions/', params),
  
  // 提交测验答案
  submitQuiz: (data) => apiClient.post('/quiz/submit/', data),
  
  // 获取用户测验历史
  getUserQuizHistory: (params) => apiClient.get('/quiz/history/', params),
  
  // 获取用户测验统计
  getUserQuizStats: () => apiClient.get('/quiz/stats/'),
  
  // 管理员功能
  admin: {
    // 获取题目列表（管理员）
    getQuestions: (params) => apiClient.get('/quiz/admin/questions/', params),
    
    // 获取题目详情（管理员）
    getQuestionDetail: (id) => apiClient.get(`/quiz/admin/questions/${id}/`),
    
    // 获取测验统计（管理员）
    getStats: () => apiClient.get('/quiz/admin/stats/')
  }
}

// 社区相关API
export const communityApi = {
  // 获取帖子列表
  getPosts: (params) => apiClient.get('/api/community/posts/', params),
  
  // 获取帖子详情
  getPostDetails: (postId) => apiClient.get(`/api/community/posts/${postId}/`),
  
  // 创建帖子
  createPost: (postData) => apiClient.post('/api/community/posts/', postData),
  
  // 更新帖子
  updatePost: (postId, postData) => apiClient.put(`/api/community/posts/${postId}/`, postData),
  
  // 删除帖子
  deletePost: (postId) => apiClient.delete(`/api/community/posts/${postId}/`),
  
  // 点赞帖子
  likePost: (postId) => apiClient.post(`/api/community/posts/${postId}/like/`),
  
  // 取消点赞
  unlikePost: (postId) => apiClient.delete(`/api/community/posts/${postId}/like/`),
  
  // 收藏帖子
  bookmarkPost: (postId) => apiClient.post(`/api/community/posts/${postId}/bookmark/`),
  
  // 取消收藏
  unbookmarkPost: (postId) => apiClient.delete(`/api/community/posts/${postId}/bookmark/`),
  
  // 获取评论列表
  getComments: (postId, params) => apiClient.get(`/api/community/posts/${postId}/comments/`, params),
  
  // 创建评论
  createComment: (postId, commentData) => apiClient.post(`/api/community/posts/${postId}/comments/`, commentData),
  
  // 更新评论
  updateComment: (commentId, commentData) => apiClient.put(`/api/community/comments/${commentId}/`, commentData),
  
  // 删除评论
  deleteComment: (commentId) => apiClient.delete(`/api/community/comments/${commentId}/`),
  
  // 点赞评论
  likeComment: (commentId) => apiClient.post(`/api/community/comments/${commentId}/like/`),
  
  // 取消点赞评论
  unlikeComment: (commentId) => apiClient.delete(`/api/community/comments/${commentId}/like/`),
  
  // 获取热门标签
  getPopularTags: () => apiClient.get('/api/community/tags/popular/'),
  
  // 获取社区统计
  getCommunityStats: () => apiClient.get('/api/community/stats/')
}

// 仪表板相关API
export const dashboardApi = {
  // 获取仪表板数据
  getDashboardData: () => apiClient.get('/dashboard'),
  
  // 获取学习统计
  getLearningStats: (period) => apiClient.get('/dashboard/learning-stats', { period }),
  
  // 获取最近活动
  getRecentActivities: (limit) => apiClient.get('/dashboard/activities', { limit }),
  
  // 获取推荐内容
  getRecommendations: (type) => apiClient.get('/dashboard/recommendations', { type }),
  
  // 获取系统通知
  getNotifications: (params) => apiClient.get('/notifications/notifications/', { params }),
  
  // 标记通知为已读
  markNotificationRead: (notificationId) => apiClient.patch(`/notifications/notifications/${notificationId}/`, { is_read: true }),
  
  // 标记所有通知为已读
  markAllNotificationsRead: () => apiClient.post('/notifications/notifications/mark-all-read/'),
  
  // 获取未读通知数量
  getNotificationCount: () => apiClient.get('/notifications/notifications/count/'),
  
  // 清空所有通知
  clearAllNotifications: () => apiClient.delete('/notifications/notifications/clear-all/'),
  
  // 获取通知统计
  getNotificationStats: () => apiClient.get('/notifications/notifications/stats/')
}

// 搜索相关API
export const searchApi = {
  // 全局搜索
  globalSearch: (query, params) => apiClient.get('/search', { query, ...params }),
  
  // 搜索建议
  getSearchSuggestions: (query) => apiClient.get('/search/suggestions', { query }),
  
  // 搜索历史
  getSearchHistory: () => apiClient.get('/search/history'),
  
  // 清除搜索历史
  clearSearchHistory: () => apiClient.delete('/search/history')
}

// 系统相关API
export const systemApi = {
  // 获取系统信息
  getSystemInfo: () => apiClient.get('/system/info'),
  
  // 健康检查
  healthCheck: () => apiClient.get('/system/health'),
  
  // 获取系统配置
  getSystemConfig: () => apiClient.get('/system/config'),
  
  // 上报错误
  reportError: (errorData) => apiClient.post('/system/errors', errorData),
  
  // 获取系统统计
  getStats: () => apiClient.get('/system/stats'),
  getSystemStats: () => apiClient.get('/system/stats')
}

// 反馈相关API
export const feedbackApi = {
  // 提交反馈
  submitFeedback: (data) => apiClient.post('/feedback/', data),
  
  // 获取我的反馈列表
  getMyFeedback: (params) => apiClient.get('/feedback/user/', params),
  
  // 获取反馈详情
  getFeedbackDetail: (id) => apiClient.get(`/feedback/${id}/`),
  
  // 管理员获取反馈列表
  getAdminFeedbackList: (params) => apiClient.get('/feedback/admin/', params),
  
  // 管理员获取反馈详情
  getAdminFeedbackDetail: (id) => apiClient.get(`/feedback/admin/${id}/`),
  
  // 获取反馈统计（管理员）
  getFeedbackStats: () => apiClient.get('/feedback/admin/stats/')
}

// 导出API客户端和错误类
export { apiClient, ApiError }

// 导出默认实例
export default apiClient