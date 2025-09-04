// API数据获取和状态管理

import { ref, computed } from 'vue'
import { 
  userApi, 
  graphApi, 
  quizApi, 
  communityApi, 
  dashboardApi, 
  searchApi 
} from '~/services/api'
import { handleError } from '~/utils/errorHandler'
import { appStorage } from '~/utils/storage'

// 通用数据获取composable
export const useApiData = (key, fetchFn, options = {}) => {
  const {
    immediate = true,
    cache = true,
    cacheTime = 5 * 60 * 1000, // 5分钟缓存
    transform = null,
    onError = null
  } = options

  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const lastFetch = ref(null)

  // 检查缓存
  const getCachedData = () => {
    if (!cache) return null
    
    const cached = appStorage.get(`api_cache_${key}`)
    if (cached && cached.timestamp && Date.now() - cached.timestamp < cacheTime) {
      return cached.data
    }
    return null
  }

  // 设置缓存
  const setCachedData = (responseData) => {
    if (cache) {
      appStorage.set(`api_cache_${key}`, {
        data: responseData,
        timestamp: Date.now()
      })
    }
  }

  // 执行数据获取
  const execute = async (...args) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetchFn(...args)
      let responseData = response.data || response
      
      // 数据转换
      if (transform && typeof transform === 'function') {
        responseData = transform(responseData)
      }
      
      data.value = responseData
      lastFetch.value = Date.now()
      
      // 设置缓存
      setCachedData(responseData)
      
      return responseData
    } catch (err) {
      const processedError = handleError(err, { action: key, args })
      error.value = processedError
      
      if (onError && typeof onError === 'function') {
        onError(processedError)
      }
      
      throw processedError
    } finally {
      loading.value = false
    }
  }

  // 刷新数据
  const refresh = () => execute()

  // 清除缓存
  const clearCache = () => {
    if (cache) {
      appStorage.remove(`api_cache_${key}`)
    }
  }

  // 初始化
  if (immediate) {
    const cachedData = getCachedData()
    if (cachedData) {
      data.value = cachedData
    } else {
      execute()
    }
  }

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    lastFetch: computed(() => lastFetch.value),
    execute,
    refresh,
    clearCache
  }
}

// 用户相关API
export const useUserApi = () => {
  const getUserProfile = (userId) => {
    return useApiData(
      `user_profile_${userId}`,
      () => userApi.getProfile(userId),
      { cache: true, cacheTime: 10 * 60 * 1000 }
    )
  }

  const getUserStats = (userId) => {
    return useApiData(
      `user_stats_${userId}`,
      () => userApi.getStats(userId),
      { cache: true, cacheTime: 5 * 60 * 1000 }
    )
  }

  const getUserAchievements = (userId) => {
    return useApiData(
      `user_achievements_${userId}`,
      () => userApi.getAchievements(userId),
      { cache: true, cacheTime: 15 * 60 * 1000 }
    )
  }

  const getUserLearningRecords = (userId, params = {}) => {
    return useApiData(
      `user_learning_${userId}_${JSON.stringify(params)}`,
      () => userApi.getLearningRecords(userId, params),
      { cache: true, cacheTime: 2 * 60 * 1000 }
    )
  }

  return {
    getUserProfile,
    getUserStats,
    getUserAchievements,
    getUserLearningRecords
  }
}

// 知识图谱相关API
export const useGraphApi = () => {
  const getGraphData = (params = {}) => {
    return useApiData(
      `graph_data_${JSON.stringify(params)}`,
      () => graphApi.getGraph(params),
      { 
        cache: true, 
        cacheTime: 10 * 60 * 1000,
        transform: (data) => {
          // 处理图谱数据格式
          return {
            nodes: data.nodes || [],
            edges: data.edges || [],
            categories: data.categories || []
          }
        }
      }
    )
  }

  const getNodeDetails = (nodeId) => {
    return useApiData(
      `node_details_${nodeId}`,
      () => graphApi.getNode(nodeId),
      { cache: true, cacheTime: 15 * 60 * 1000 }
    )
  }

  const searchNodes = (query, params = {}) => {
    return useApiData(
      `search_nodes_${query}_${JSON.stringify(params)}`,
      () => graphApi.searchNodes(query, params),
      { cache: true, cacheTime: 5 * 60 * 1000 }
    )
  }

  return {
    getGraphData,
    getNodeDetails,
    searchNodes
  }
}

// 测验相关API
export const useQuizApi = () => {
  const getQuizList = (params = {}) => {
    return useApiData(
      `quiz_list_${JSON.stringify(params)}`,
      () => quizApi.getQuizzes(params),
      { cache: true, cacheTime: 5 * 60 * 1000 }
    )
  }

  const getQuizDetails = (quizId) => {
    return useApiData(
      `quiz_details_${quizId}`,
      () => quizApi.getQuiz(quizId),
      { cache: true, cacheTime: 10 * 60 * 1000 }
    )
  }

  const getQuizQuestions = (quizId) => {
    return useApiData(
      `quiz_questions_${quizId}`,
      () => quizApi.getQuestions(quizId),
      { cache: false } // 题目不缓存，确保实时性
    )
  }

  const getQuizResults = (resultId) => {
    return useApiData(
      `quiz_results_${resultId}`,
      () => quizApi.getResults(resultId),
      { cache: true, cacheTime: 30 * 60 * 1000 }
    )
  }

  const getUserQuizHistory = (userId, params = {}) => {
    return useApiData(
      `user_quiz_history_${userId}_${JSON.stringify(params)}`,
      () => quizApi.getUserHistory(userId, params),
      { cache: true, cacheTime: 5 * 60 * 1000 }
    )
  }

  return {
    getQuizList,
    getQuizDetails,
    getQuizQuestions,
    getQuizResults,
    getUserQuizHistory
  }
}

// 社区相关API
export const useCommunityApi = () => {
  const getPosts = (params = {}) => {
    return useApiData(
      `community_posts_${JSON.stringify(params)}`,
      () => communityApi.getPosts(params),
      { cache: true, cacheTime: 2 * 60 * 1000 }
    )
  }

  const getPostDetails = (postId) => {
    return useApiData(
      `post_details_${postId}`,
      () => communityApi.getPost(postId),
      { cache: true, cacheTime: 5 * 60 * 1000 }
    )
  }

  const getPostComments = (postId, params = {}) => {
    return useApiData(
      `post_comments_${postId}_${JSON.stringify(params)}`,
      () => communityApi.getComments(postId, params),
      { cache: true, cacheTime: 1 * 60 * 1000 }
    )
  }

  const getCommunityStats = () => {
    return useApiData(
      'community_stats',
      () => communityApi.getStats(),
      { cache: true, cacheTime: 10 * 60 * 1000 }
    )
  }

  const getPopularTags = () => {
    return useApiData(
      'popular_tags',
      () => communityApi.getPopularTags(),
      { cache: true, cacheTime: 30 * 60 * 1000 }
    )
  }

  return {
    getPosts,
    getPostDetails,
    getPostComments,
    getCommunityStats,
    getPopularTags
  }
}

// 仪表板相关API
export const useDashboardApi = () => {
  const getDashboardData = () => {
    return useApiData(
      'dashboard_data',
      () => dashboardApi.getOverview(),
      { 
        cache: true, 
        cacheTime: 5 * 60 * 1000,
        transform: (data) => {
          // 处理仪表板数据
          return {
            stats: data.stats || {},
            recentActivities: data.recentActivities || [],
            learningProgress: data.learningProgress || {},
            recommendations: data.recommendations || []
          }
        }
      }
    )
  }

  const getLearningStats = (timeRange = '7d') => {
    return useApiData(
      `learning_stats_${timeRange}`,
      () => dashboardApi.getLearningStats(timeRange),
      { cache: true, cacheTime: 10 * 60 * 1000 }
    )
  }

  const getRecentActivities = (limit = 10) => {
    return useApiData(
      `recent_activities_${limit}`,
      () => dashboardApi.getRecentActivities(limit),
      { cache: true, cacheTime: 2 * 60 * 1000 }
    )
  }

  return {
    getDashboardData,
    getLearningStats,
    getRecentActivities
  }
}

// 搜索相关API
export const useSearchApi = () => {
  const globalSearch = (query, params = {}) => {
    return useApiData(
      `global_search_${query}_${JSON.stringify(params)}`,
      () => searchApi.globalSearch(query, params),
      { 
        cache: true, 
        cacheTime: 5 * 60 * 1000,
        immediate: false // 搜索不立即执行
      }
    )
  }

  const searchSuggestions = (query) => {
    return useApiData(
      `search_suggestions_${query}`,
      () => searchApi.getSuggestions(query),
      { 
        cache: true, 
        cacheTime: 10 * 60 * 1000,
        immediate: false
      }
    )
  }

  return {
    globalSearch,
    searchSuggestions
  }
}

// 批量数据管理
export const useBatchApi = () => {
  const batchRequests = ref(new Map())
  const batchLoading = ref(false)

  const addToBatch = (key, fetchFn, options = {}) => {
    batchRequests.value.set(key, { fetchFn, options })
  }

  const executeBatch = async () => {
    if (batchRequests.value.size === 0) return {}

    batchLoading.value = true
    const results = {}
    const promises = []

    for (const [key, { fetchFn, options }] of batchRequests.value) {
      promises.push(
        fetchFn().then(data => {
          results[key] = data
        }).catch(error => {
          results[key] = { error: handleError(error, { action: key }) }
        })
      )
    }

    try {
      await Promise.all(promises)
      return results
    } finally {
      batchLoading.value = false
      batchRequests.value.clear()
    }
  }

  const clearBatch = () => {
    batchRequests.value.clear()
  }

  return {
    batchRequests: computed(() => batchRequests.value),
    batchLoading: computed(() => batchLoading.value),
    addToBatch,
    executeBatch,
    clearBatch
  }
}

// 导出所有API composables
export default {
  useApiData,
  useUserApi,
  useGraphApi,
  useQuizApi,
  useCommunityApi,
  useDashboardApi,
  useSearchApi,
  useBatchApi
}