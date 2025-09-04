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
 * console.log('反馈提交成功:', result.data);
 * ```
 */
export async function submitFeedback(
  feedbackData: FeedbackSubmission
): Promise<ApiResponse<Feedback>> {
  // 参数验证
  if (!feedbackData.type) {
    throw new Error('反馈类型不能为空');
  }
  
  if (!feedbackData.title) {
    throw new Error('反馈标题不能为空');
  }
  
  if (!feedbackData.content) {
    throw new Error('反馈内容不能为空');
  }
  
  // 验证评分范围
  if (feedbackData.rating !== undefined && (feedbackData.rating < 1 || feedbackData.rating > 5)) {
    throw new Error('评分必须在1-5之间');
  }
  
  return await apiClient.post<Feedback>('/feedback/submit/', feedbackData);
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
export async function fetchFeedbackList(
  type?: string,
  status?: string,
  page?: number,
  pageSize?: number
): Promise<ApiResponse<PaginatedResponse<Feedback>>> {
  const params: Record<string, any> = {};
  
  if (type) {
    params.type = type;
  }
  
  if (status) {
    params.status = status;
  }
  
  if (page) {
    params.page = page;
  }
  
  if (pageSize) {
    params.page_size = pageSize;
  }
  
  return await apiClient.get<PaginatedResponse<Feedback>>('/feedback/', { params });
}

/**
 * 获取用户的反馈列表
 * @param page - 页码（可选）
 * @param pageSize - 每页数量（可选）
 * @returns 用户反馈列表
 * 
 * @example
 * ```typescript
 * const myFeedback = await fetchUserFeedback();
 * console.log('我的反馈:', myFeedback.data);
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
  
  return await apiClient.get<PaginatedResponse<Feedback>>('/feedback/user/', { params });
}

/**
 * 获取反馈详情
 * @param feedbackId - 反馈ID
 * @returns 反馈详细信息
 * 
 * @example
 * ```typescript
 * const feedback = await fetchFeedbackDetail(123);
 * console.log('反馈详情:', feedback.data);
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
 * console.log('反馈状态更新成功');
 * ```
 */
export async function updateFeedbackStatus(
  feedbackId: number,
  status: string,
  response?: string
): Promise<ApiResponse<Feedback>> {
  if (!feedbackId) {
    throw new Error('反馈ID不能为空');
  }
  
  if (!status) {
    throw new Error('状态不能为空');
  }
  
  const data: any = { status };
  if (response) {
    data.response = response;
  }
  
  return await apiClient.patch<Feedback>(`/feedback/${feedbackId}/`, data);
}

/**
 * 获取反馈统计信息
 * @returns 反馈统计数据
 * 
 * @example
 * ```typescript
 * const stats = await fetchFeedbackStats();
 * console.log('反馈统计:', stats.data);
 * ```
 */
export async function fetchFeedbackStats(): Promise<ApiResponse<{
  total_feedback: number;
  pending_feedback: number;
  resolved_feedback: number;
  average_rating: number;
  feedback_by_type: Record<string, number>;
}>> {
  return await apiClient.get('/feedback/stats/');
}

/**
 * 获取反馈类型列表
 * @returns 反馈类型列表
 * 
 * @example
 * ```typescript
 * const types = await fetchFeedbackTypes();
 * console.log('反馈类型:', types.data);
 * ```
 */
export async function fetchFeedbackTypes(): Promise<ApiResponse<string[]>> {
  return await apiClient.get<string[]>('/feedback/types/');
}

/**
 * 删除反馈（用户只能删除自己的反馈）
 * @param feedbackId - 反馈ID
 * @returns 删除结果
 * 
 * @example
 * ```typescript
 * await deleteFeedback(123);
 * console.log('反馈删除成功');
 * ```
 */
export async function deleteFeedback(
  feedbackId: number
): Promise<ApiResponse<void>> {
  if (!feedbackId) {
    throw new Error('反馈ID不能为空');
  }
  
  return await apiClient.delete<void>(`/feedback/${feedbackId}/`);
}