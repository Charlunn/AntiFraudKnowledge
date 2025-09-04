/**
 * 统计数据相关API工具类
 * 提供各种统计信息的获取功能
 */

import { apiClient } from './base';
import type {
  StatisticsData,
  ApiResponse
} from '~/types/api';

/**
 * 获取系统总体统计数据
 * @returns 系统统计信息
 * 
 * @example
 * ```typescript
 * const stats = await fetchSystemStats();
 * console.log('系统统计:', stats.data);
 * ```
 */
export async function fetchSystemStats(): Promise<ApiResponse<StatisticsData>> {
  return await apiClient.get<StatisticsData>('/statistics/system/');
}

/**
 * 获取用户活跃度统计
 * @param period - 统计周期（day, week, month, year）
 * @param startDate - 开始日期（可选）
 * @param endDate - 结束日期（可选）
 * @returns 用户活跃度统计
 * 
 * @example
 * ```typescript
 * // 获取本周用户活跃度
 * const weeklyStats = await fetchUserActivityStats('week');
 * 
 * // 获取指定时间段的用户活跃度
 * const customStats = await fetchUserActivityStats('day', '2024-01-01', '2024-01-31');
 * ```
 */
export async function fetchUserActivityStats(
  period: 'day' | 'week' | 'month' | 'year',
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<{
  period: string;
  active_users: number;
  new_users: number;
  returning_users: number;
  user_growth_rate: number;
  activity_by_date: Array<{
    date: string;
    active_users: number;
    new_users: number;
  }>;
}>> {
  const params: Record<string, any> = { period };
  
  if (startDate) {
    params.start_date = startDate;
  }
  
  if (endDate) {
    params.end_date = endDate;
  }
  
  return await apiClient.get('/statistics/user-activity/', { params });
}

/**
 * 获取测验统计数据
 * @param period - 统计周期（可选）
 * @param level - 难度级别（可选）
 * @returns 测验统计信息
 * 
 * @example
 * ```typescript
 * // 获取所有测验统计
 * const quizStats = await fetchQuizStats();
 * 
 * // 获取指定难度的测验统计
 * const easyQuizStats = await fetchQuizStats('month', 'easy');
 * ```
 */
export async function fetchQuizStats(
  period?: 'day' | 'week' | 'month' | 'year',
  level?: string
): Promise<ApiResponse<{
  total_attempts: number;
  total_completions: number;
  completion_rate: number;
  average_score: number;
  score_distribution: Record<string, number>;
  popular_questions: Array<{
    question_id: number;
    question_text: string;
    attempt_count: number;
    correct_rate: number;
  }>;
}>> {
  const params: Record<string, any> = {};
  
  if (period) {
    params.period = period;
  }
  
  if (level) {
    params.level = level;
  }
  
  return await apiClient.get('/statistics/quiz/', { params });
}

/**
 * 获取聊天系统统计数据
 * @param period - 统计周期（可选）
 * @returns 聊天统计信息
 * 
 * @example
 * ```typescript
 * const chatStats = await fetchChatStats('week');
 * console.log('聊天统计:', chatStats.data);
 * ```
 */
export async function fetchChatStats(
  period?: 'day' | 'week' | 'month' | 'year'
): Promise<ApiResponse<{
  total_sessions: number;
  total_messages: number;
  active_sessions: number;
  average_session_length: number;
  popular_topics: Array<{
    topic: string;
    frequency: number;
  }>;
  response_time_avg: number;
}>> {
  const params: Record<string, any> = {};
  
  if (period) {
    params.period = period;
  }
  
  return await apiClient.get('/statistics/chat/', { params });
}

/**
 * 获取反馈统计数据
 * @param period - 统计周期（可选）
 * @param type - 反馈类型（可选）
 * @returns 反馈统计信息
 * 
 * @example
 * ```typescript
 * // 获取所有反馈统计
 * const feedbackStats = await fetchFeedbackStats();
 * 
 * // 获取指定类型的反馈统计
 * const bugReports = await fetchFeedbackStats('month', 'bug');
 * ```
 */
export async function fetchFeedbackStats(
  period?: 'day' | 'week' | 'month' | 'year',
  type?: string
): Promise<ApiResponse<{
  total_feedback: number;
  pending_feedback: number;
  resolved_feedback: number;
  resolution_rate: number;
  average_rating: number;
  feedback_by_type: Record<string, number>;
  satisfaction_trend: Array<{
    date: string;
    average_rating: number;
    feedback_count: number;
  }>;
}>> {
  const params: Record<string, any> = {};
  
  if (period) {
    params.period = period;
  }
  
  if (type) {
    params.type = type;
  }
  
  return await apiClient.get('/statistics/feedback/', { params });
}

/**
 * 获取成就系统统计数据
 * @param period - 统计周期（可选）
 * @returns 成就统计信息
 * 
 * @example
 * ```typescript
 * const achievementStats = await fetchAchievementStats('month');
 * console.log('成就统计:', achievementStats.data);
 * ```
 */
export async function fetchAchievementStats(
  period?: 'day' | 'week' | 'month' | 'year'
): Promise<ApiResponse<{
  total_achievements: number;
  total_earned: number;
  earning_rate: number;
  popular_achievements: Array<{
    achievement_id: string;
    achievement_name: string;
    earned_count: number;
    earning_rate: number;
  }>;
  user_progress: {
    average_completion: number;
    top_achievers: Array<{
      user_id: number;
      username: string;
      achievement_count: number;
    }>;
  };
}>> {
  const params: Record<string, any> = {};
  
  if (period) {
    params.period = period;
  }
  
  return await apiClient.get('/statistics/achievements/', { params });
}

/**
 * 获取内容统计数据
 * @param contentType - 内容类型（可选）
 * @returns 内容统计信息
 * 
 * @example
 * ```typescript
 * const contentStats = await fetchContentStats();
 * console.log('内容统计:', contentStats.data);
 * ```
 */
export async function fetchContentStats(
  contentType?: string
): Promise<ApiResponse<{
  total_content: number;
  published_content: number;
  draft_content: number;
  popular_content: Array<{
    id: number;
    title: string;
    view_count: number;
    like_count: number;
    share_count: number;
  }>;
  content_by_category: Record<string, number>;
}>> {
  const params: Record<string, any> = {};
  
  if (contentType) {
    params.content_type = contentType;
  }
  
  return await apiClient.get('/statistics/content/', { params });
}

/**
 * 获取实时统计数据
 * @returns 实时统计信息
 * 
 * @example
 * ```typescript
 * const realTimeStats = await fetchRealTimeStats();
 * console.log('实时统计:', realTimeStats.data);
 * ```
 */
export async function fetchRealTimeStats(): Promise<ApiResponse<{
  online_users: number;
  active_sessions: number;
  current_load: number;
  response_time: number;
  error_rate: number;
  recent_activities: Array<{
    type: string;
    description: string;
    timestamp: string;
    user_id?: number;
  }>;
}>> {
  return await apiClient.get('/statistics/realtime/');
}

/**
 * 导出统计报告
 * @param reportType - 报告类型
 * @param format - 导出格式（csv, xlsx, pdf）
 * @param period - 统计周期（可选）
 * @param startDate - 开始日期（可选）
 * @param endDate - 结束日期（可选）
 * @returns 导出结果
 * 
 * @example
 * ```typescript
 * const report = await exportStatisticsReport('user-activity', 'xlsx', 'month');
 * console.log('报告下载链接:', report.data.download_url);
 * ```
 */
export async function exportStatisticsReport(
  reportType: string,
  format: 'csv' | 'xlsx' | 'pdf',
  period?: 'day' | 'week' | 'month' | 'year',
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<{
  download_url: string;
  file_name: string;
  file_size: number;
  expires_at: string;
}>> {
  const data: Record<string, any> = {
    report_type: reportType,
    format
  };
  
  if (period) {
    data.period = period;
  }
  
  if (startDate) {
    data.start_date = startDate;
  }
  
  if (endDate) {
    data.end_date = endDate;
  }
  
  return await apiClient.post('/statistics/export/', data);
}