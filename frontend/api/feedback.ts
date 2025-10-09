/**
 * 反馈系统相关API工具类
 * 提供提交反馈、获取反馈列表等功能
 */

import { apiClient } from './base';
import type {
  Feedback,
  FeedbackSubmission,
  ApiResponse,
  PaginatedResponse
} from '~/types/api';

/**
 * 提交用户反馈
 * @param feedbackData - 反馈数据
 * @returns 提交结果
 * 
 * @example
 * ```typescript
 * const result = await submitFeedback({
 *   type: 'bug',
 *   title: '发现一个问题',
 *   content: '详细描述问题...',
 *   rating: 3
 * });
 * ```
 */
export async function submitFeedback(
  feedbackData: {
    message: string; // 后端只需要message字段
    contact?: string; // 可选的联系方式
    image?: string; // 可选的图片
  }
): Promise<ApiResponse<Feedback>> {
  // 参数验证
  if (!feedbackData.message) {
    throw new Error('反馈内容不能为空');
  }
  
  return await apiClient.post<Feedback>('/feedback/create/', feedbackData);
}

/**
 * 获取反馈列表
 * @param type - 反馈类型（可选）
 * @param status - 反馈状态（可选）
 * @param page - 页码（可选）
 * @param pageSize - 每页数量（可选）
 * @returns 反馈列表
 * 
 * @example
 * ```typescript
 * // 获取所有反馈
 * const allFeedback = await fetchFeedbackList();
 * 
 * // 获取指定类型的反馈
 * const bugReports = await fetchFeedbackList('bug');
 * 
 * // 分页获取反馈
 * const pagedFeedback = await fetchFeedbackList(undefined, undefined, 1, 10);
 * ```
 */
// 注意：后端没有提供通用的反馈列表API，只有管理员API
// export async function fetchFeedbackList() { ... }

/**
 * 获取用户的反馈列表
 * @param page - 页码（可选）
 * @param pageSize - 每页数量（可选）
 * @returns 用户反馈列表
 * 
 * @example
 * ```typescript
 * const myFeedback = await fetchUserFeedback();
 * ```
 */
export async function fetchUserFeedback(
  page?: number,
  pageSize?: number
): Promise<ApiResponse<PaginatedResponse<Feedback>>> {
  const params: Record<string, any> = {};
  
  if (page) {
    params.page = page;
  }
  
  if (pageSize) {
    params.page_size = pageSize;
  }
  
  return await apiClient.get<PaginatedResponse<Feedback>>('/feedback/my/', { params });
}

/**
 * 获取反馈详情
 * @param feedbackId - 反馈ID
 * @returns 反馈详细信息
 * 
 * @example
 * ```typescript
 * const feedback = await fetchFeedbackDetail(123);
 * ```
 */
export async function fetchFeedbackDetail(
  feedbackId: number
): Promise<ApiResponse<Feedback>> {
  if (!feedbackId) {
    throw new Error('反馈ID不能为空');
  }
  
  return await apiClient.get<Feedback>(`/feedback/${feedbackId}/`);
}

/**
 * 更新反馈状态（管理员功能）
 * @param feedbackId - 反馈ID
 * @param status - 新状态
 * @param response - 回复内容（可选）
 * @returns 更新结果
 * 
 * @example
 * ```typescript
 * await updateFeedbackStatus(123, 'resolved', '问题已修复');
 * ```
 */
// 注意：后端没有提供更新反馈状态的API
// export async function updateFeedbackStatus() { ... }

/**
 * 获取反馈统计信息
 * @returns 反馈统计数据
 * 
 * @example
 * ```typescript
 * const stats = await fetchFeedbackStats();
 * ```
 */
export async function fetchFeedbackStats(): Promise<ApiResponse<{
  total_feedback: number;
  today_feedback: number;
  week_feedback: number;
  month_feedback: number;
  active_users: number;
}>> {
  return await apiClient.get('/feedback/admin/stats/');
}

/**
 * 获取反馈类型列表
 * @returns 反馈类型列表
 * 
 * @example
 * ```typescript
 * const types = await fetchFeedbackTypes();
 * ```
 */
// 注意：后端没有提供反馈类型列表API
// export async function fetchFeedbackTypes() { ... }

/**
 * 删除反馈（用户只能删除自己的反馈）
 * @param feedbackId - 反馈ID
 * @returns 删除结果
 * 
 * @example
 * ```typescript
 * await deleteFeedback(123);
 * ```
 */
// 注意：后端只有管理员可以删除反馈，路径为 /feedback/admin/{id}/
// export async function deleteFeedback() { ... }