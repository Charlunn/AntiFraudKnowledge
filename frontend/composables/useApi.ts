/**
 * API组合式函数
 * 提供便捷的API调用方式和状态管理
 */

import type { ApiResponse, ApiError } from '~/types/api';

/**
 * 基础API调用组合式函数
 * @param apiCall - API调用函数
 * @param options - 配置选项
 * @returns 响应式状态和方法
 */
export function useApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
    transform?: (data: T) => any;
  } = {}
) {
  const { immediate = false, onSuccess, onError, transform } = options;
  
  const data = ref<T | null>(null);
  const error = ref<ApiError | null>(null);
  const pending = ref(false);
  
  const execute = async () => {
    try {
      pending.value = true;
      error.value = null;
      
      const response = await apiCall();
      const result = transform ? transform(response.data) : response.data;
      
      data.value = result;
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || '请求失败',
        code: err.response?.status || 0,
        details: err.response?.data || null
      };
      
      error.value = apiError;
      
      if (onError) {
        onError(apiError);
      }
      
      throw apiError;
    } finally {
      pending.value = false;
    }
  };
  
  const refresh = () => execute();
  
  const clear = () => {
    data.value = null;
    error.value = null;
    pending.value = false;
  };
  
  // 立即执行
  if (immediate) {
    execute();
  }
  
  return {
    data: readonly(data),
    error: readonly(error),
    pending: readonly(pending),
    execute,
    refresh,
    clear
  };
}

/**
 * 认证相关API组合式函数
 */
export function useAuth() {
  const { $api } = useNuxtApp();
  const authStore = useAuthStore();
  
  // 用户注册
  const register = (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone_number?: string;
  }) => {
    return useApiCall(
      () => $api.auth.register(userData),
      {
        onSuccess: (data) => {
          authStore.setTokens(data.access_token, data.refresh_token);
          navigateTo('/dashboard');
        }
      }
    );
  };
  
  // 用户登录
  const login = (identifier: string, password: string) => {
    return useApiCall(
      () => $api.auth.login(identifier, password),
      {
        onSuccess: (data) => {
          authStore.setTokens(data.access_token, data.refresh_token);
          navigateTo('/dashboard');
        }
      }
    );
  };
  
  // 用户登出
  const logout = () => {
    return useApiCall(
      () => $api.auth.logout(authStore.refreshToken!),
      {
        onSuccess: () => {
          authStore.clear();
          navigateTo('/login');
        },
        onError: () => {
          // 即使登出失败也清除本地状态
          authStore.clear();
          navigateTo('/login');
        }
      }
    );
  };
  
  // 获取用户资料
  const fetchProfile = () => {
    return useApiCall(() => $api.auth.fetchProfile());
  };
  
  return {
    register,
    login,
    logout,
    fetchProfile
  };
}

/**
 * 测验相关API组合式函数
 */
export function useQuiz() {
  const { $api } = useNuxtApp();
  
  // 获取题目列表
  const fetchQuestions = (level?: string, limit?: number) => {
    return useApiCall(
      () => $api.quiz.fetchQuestions(level, limit),
      { immediate: true }
    );
  };
  
  // 提交答案
  const submitAnswers = (level: string, answers: Record<string, string>) => {
    return useApiCall(
      () => $api.quiz.submitAnswers(level, answers),
      {
        onSuccess: (data) => {
          // 可以在这里处理成功后的逻辑，比如显示成绩
          console.log('测验完成，得分:', data.score);
        }
      }
    );
  };
  
  // 获取答题记录
  const fetchRecords = (page?: number, pageSize?: number) => {
    return useApiCall(
      () => $api.quiz.fetchQuizRecords(page, pageSize),
      { immediate: true }
    );
  };
  
  return {
    fetchQuestions,
    submitAnswers,
    fetchRecords
  };
}

/**
 * 成就系统相关API组合式函数
 */
export function useAchievements() {
  const { $api } = useNuxtApp();
  
  // 获取用户成就
  const fetchUserAchievements = (userId?: number, page?: number, pageSize?: number) => {
    return useApiCall(
      () => $api.achievements.fetchUserAchievements(userId, page, pageSize),
      { immediate: true }
    );
  };
  
  // 获取所有成就
  const fetchAllAchievements = (category?: string) => {
    return useApiCall(
      () => $api.achievements.fetchAllAchievements(category),
      { immediate: true }
    );
  };
  
  // 授予成就
  const grantAchievement = (userId: number, achievementId: string) => {
    return useApiCall(
      () => $api.achievements.grantAchievement(userId, achievementId),
      {
        onSuccess: () => {
          // 可以显示成就获得提示
          console.log('成就获得成功!');
        }
      }
    );
  };
  
  return {
    fetchUserAchievements,
    fetchAllAchievements,
    grantAchievement
  };
}

/**
 * 反馈系统相关API组合式函数
 */
export function useFeedback() {
  const { $api } = useNuxtApp();
  
  // 提交反馈
  const submitFeedback = (feedbackData: {
    type: string;
    title: string;
    content: string;
    rating?: number;
  }) => {
    return useApiCall(
      () => $api.feedback.submitFeedback(feedbackData),
      {
        onSuccess: () => {
          // 显示成功提示
          console.log('反馈提交成功!');
        }
      }
    );
  };
  
  // 获取用户反馈
  const fetchUserFeedback = (page?: number, pageSize?: number) => {
    return useApiCall(
      () => $api.feedback.fetchUserFeedback(page, pageSize),
      { immediate: true }
    );
  };
  
  return {
    submitFeedback,
    fetchUserFeedback
  };
}

/**
 * 聊天系统相关API组合式函数
 */
export function useChat() {
  const { $api } = useNuxtApp();
  
  // 发送消息
  const sendMessage = (message: string, sessionId?: string) => {
    return useApiCall(() => $api.chat.sendMessage(message, sessionId));
  };
  
  // 获取会话列表
  const fetchSessions = (page?: number, pageSize?: number) => {
    return useApiCall(
      () => $api.chat.fetchChatSessions(page, pageSize),
      { immediate: true }
    );
  };
  
  // 获取聊天记录
  const fetchHistory = (sessionId: string, page?: number, pageSize?: number) => {
    return useApiCall(
      () => $api.chat.fetchChatHistory(sessionId, page, pageSize),
      { immediate: true }
    );
  };
  
  return {
    sendMessage,
    fetchSessions,
    fetchHistory
  };
}

/**
 * 社区功能相关API组合式函数
 */
export function useCommunity() {
  const { $api } = useNuxtApp();
  
  // 获取帖子列表
  const fetchPosts = (
    category?: string,
    sortBy: 'latest' | 'popular' | 'hot' = 'latest',
    page?: number,
    pageSize?: number
  ) => {
    return useApiCall(
      () => $api.community.fetchCommunityPosts(category, sortBy, page, pageSize),
      { immediate: true }
    );
  };
  
  // 创建帖子
  const createPost = (postData: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
  }) => {
    return useApiCall(
      () => $api.community.createPost(postData),
      {
        onSuccess: () => {
          console.log('帖子创建成功!');
        }
      }
    );
  };
  
  // 点赞帖子
  const toggleLike = (postId: number) => {
    return useApiCall(() => $api.community.togglePostLike(postId));
  };
  
  return {
    fetchPosts,
    createPost,
    toggleLike
  };
}

/**
 * 统计数据相关API组合式函数
 */
export function useStatistics() {
  const { $api } = useNuxtApp();
  
  // 获取系统统计
  const fetchSystemStats = () => {
    return useApiCall(
      () => $api.statistics.fetchSystemStats(),
      { immediate: true }
    );
  };
  
  // 获取用户活跃度统计
  const fetchUserActivityStats = (
    period: 'day' | 'week' | 'month' | 'year',
    startDate?: string,
    endDate?: string
  ) => {
    return useApiCall(
      () => $api.statistics.fetchUserActivityStats(period, startDate, endDate),
      { immediate: true }
    );
  };
  
  return {
    fetchSystemStats,
    fetchUserActivityStats
  };
}