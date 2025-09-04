// API服务层 - 管理与后端的HTTP通信

// API基础配置
const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'
const API_TIMEOUT = 30000 // 30秒超时

// 创建HTTP客户端实例
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.timeout = API_TIMEOUT
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  // 获取认证头
  getAuthHeaders() {
    const token = useCookie('auth-token').value
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
  // 用户登录
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  // 用户注册
  register: (userData) => apiClient.post('/auth/register', userData),
  
  // 刷新令牌
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
  
  // 用户登出
  logout: () => apiClient.post('/auth/logout'),
  
  // 忘记密码
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  
  // 重置密码
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
  
  // 验证邮箱
  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),
  
  // 获取当前用户信息
  getCurrentUser: () => apiClient.get('/auth/me')
}

// 用户相关API
export const userApi = {
  // 获取用户资料
  getProfile: (userId) => apiClient.get(`/users/${userId}`),
  
  // 更新用户资料
  updateProfile: (userId, data) => apiClient.put(`/users/${userId}`, data),
  
  // 上传头像
  uploadAvatar: (file) => apiClient.upload('/users/avatar', file),
  
  // 修改密码
  changePassword: (data) => apiClient.post('/users/change-password', data),
  
  // 获取用户统计
  getUserStats: (userId) => apiClient.get(`/users/${userId}/stats`),
  
  // 获取用户成就
  getUserAchievements: (userId) => apiClient.get(`/users/${userId}/achievements`),
  
  // 获取学习记录
  getLearningRecords: (userId, params) => apiClient.get(`/users/${userId}/learning-records`, params),
  
  // 获取用户帖子
  getUserPosts: (userId, params) => apiClient.get(`/users/${userId}/posts`, params),
  
  // 更新隐私设置
  updatePrivacySettings: (settings) => apiClient.put('/users/privacy-settings', settings),
  
  // 更新通知设置
  updateNotificationSettings: (settings) => apiClient.put('/users/notification-settings', settings),
  
  // 导出用户数据
  exportUserData: (type) => apiClient.get(`/users/export/${type}`),
  
  // 删除账户
  deleteAccount: () => apiClient.delete('/users/account')
}

// 知识图谱相关API
export const graphApi = {
  // 获取图谱数据
  getGraphData: (params) => apiClient.get('/graph/data', params),
  
  // 搜索节点
  searchNodes: (query, params) => apiClient.get('/graph/search', { query, ...params }),
  
  // 获取节点详情
  getNodeDetails: (nodeId) => apiClient.get(`/graph/nodes/${nodeId}`),
  
  // 获取节点关系
  getNodeRelations: (nodeId, params) => apiClient.get(`/graph/nodes/${nodeId}/relations`, params),
  
  // 执行图分析
  executeAnalysis: (analysisType, params) => apiClient.post('/graph/analysis', { type: analysisType, ...params }),
  
  // 执行复杂查询
  executeComplexQuery: (query) => apiClient.post('/graph/query', query),
  
  // 获取图统计
  getGraphStats: () => apiClient.get('/graph/stats'),
  
  // 导出图数据
  exportGraph: (format, params) => apiClient.get('/graph/export', { format, ...params })
}

// 测验相关API
export const quizApi = {
  // 获取测验列表
  getQuizzes: (params) => apiClient.get('/quizzes', params),
  
  // 获取测验详情
  getQuizDetails: (quizId) => apiClient.get(`/quizzes/${quizId}`),
  
  // 开始测验
  startQuiz: (quizId) => apiClient.post(`/quizzes/${quizId}/start`),
  
  // 提交答案
  submitAnswer: (quizId, questionId, answer) => apiClient.post(`/quizzes/${quizId}/answers`, {
    question_id: questionId,
    answer
  }),
  
  // 完成测验
  finishQuiz: (quizId, answers) => apiClient.post(`/quizzes/${quizId}/finish`, { answers }),
  
  // 获取测验结果
  getQuizResult: (quizId, attemptId) => apiClient.get(`/quizzes/${quizId}/results/${attemptId}`),
  
  // 获取用户测验历史
  getUserQuizHistory: (params) => apiClient.get('/quizzes/history', params),
  
  // 获取测验统计
  getQuizStats: (quizId) => apiClient.get(`/quizzes/${quizId}/stats`),
  
  // 创建测验
  createQuiz: (quizData) => apiClient.post('/quizzes', quizData),
  
  // 更新测验
  updateQuiz: (quizId, quizData) => apiClient.put(`/quizzes/${quizId}`, quizData),
  
  // 删除测验
  deleteQuiz: (quizId) => apiClient.delete(`/quizzes/${quizId}`)
}

// 社区相关API
export const communityApi = {
  // 获取帖子列表
  getPosts: (params) => apiClient.get('/community/posts', params),
  
  // 获取帖子详情
  getPostDetails: (postId) => apiClient.get(`/community/posts/${postId}`),
  
  // 创建帖子
  createPost: (postData) => apiClient.post('/community/posts', postData),
  
  // 更新帖子
  updatePost: (postId, postData) => apiClient.put(`/community/posts/${postId}`, postData),
  
  // 删除帖子
  deletePost: (postId) => apiClient.delete(`/community/posts/${postId}`),
  
  // 点赞帖子
  likePost: (postId) => apiClient.post(`/community/posts/${postId}/like`),
  
  // 取消点赞
  unlikePost: (postId) => apiClient.delete(`/community/posts/${postId}/like`),
  
  // 收藏帖子
  bookmarkPost: (postId) => apiClient.post(`/community/posts/${postId}/bookmark`),
  
  // 取消收藏
  unbookmarkPost: (postId) => apiClient.delete(`/community/posts/${postId}/bookmark`),
  
  // 获取评论列表
  getComments: (postId, params) => apiClient.get(`/community/posts/${postId}/comments`, params),
  
  // 创建评论
  createComment: (postId, commentData) => apiClient.post(`/community/posts/${postId}/comments`, commentData),
  
  // 更新评论
  updateComment: (commentId, commentData) => apiClient.put(`/community/comments/${commentId}`, commentData),
  
  // 删除评论
  deleteComment: (commentId) => apiClient.delete(`/community/comments/${commentId}`),
  
  // 点赞评论
  likeComment: (commentId) => apiClient.post(`/community/comments/${commentId}/like`),
  
  // 取消点赞评论
  unlikeComment: (commentId) => apiClient.delete(`/community/comments/${commentId}/like`),
  
  // 获取热门标签
  getPopularTags: () => apiClient.get('/community/tags/popular'),
  
  // 获取社区统计
  getCommunityStats: () => apiClient.get('/community/stats')
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
  getNotifications: (params) => apiClient.get('/dashboard/notifications', params),
  
  // 标记通知为已读
  markNotificationRead: (notificationId) => apiClient.patch(`/dashboard/notifications/${notificationId}`, { read: true }),
  
  // 标记所有通知为已读
  markAllNotificationsRead: () => apiClient.patch('/dashboard/notifications/mark-all-read')
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
  getSystemStats: () => apiClient.get('/system/stats')
}

// 导出API客户端和错误类
export { apiClient, ApiError }

// 导出默认实例
export default apiClient