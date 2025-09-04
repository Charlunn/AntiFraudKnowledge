/**
 * 测验相关API工具类
 * 提供获取题目列表和提交答案的功能
 */

import { apiClient } from './base';
import type {
  Question,
  QuizSubmission,
  QuizResult,
  ApiResponse,
  PaginatedResponse
} from '~/types/api';

/**
 * 获取测验题目列表
 * @param level - 题目难度级别（可选）
 * @param limit - 限制返回题目数量（可选）
 * @returns 题目列表
 * 
 * @example
 * ```typescript
 * // 获取所有题目
 * const allQuestions = await fetchQuestions();
 * 
 * // 获取指定难度的题目
 * const easyQuestions = await fetchQuestions('easy');
 * 
 * // 获取限定数量的题目
 * const limitedQuestions = await fetchQuestions('medium', 10);
 * ```
 */
export async function fetchQuestions(
  level?: string,
  limit?: number
): Promise<ApiResponse<Question[]>> {
  const params: Record<string, any> = {};
  
  if (level) {
    params.level = level;
  }
  
  if (limit) {
    params.limit = limit;
  }
  
  return await apiClient.get<Question[]>('/quiz/questions/', { params });
}

/**
 * 提交测验答案
 * @param submission - 答题提交数据
 * @returns 测验结果
 * 
 * @example
 * ```typescript
 * const result = await submitAnswers({
 *   level: 'beginner',
 *   answers: {
 *     '1': 'A',
 *     '2': 'B',
 *     '3': 'C'
 *   }
 * });
 * console.log('得分:', result.data.score);
 * ```
 */
export async function submitAnswers(
  submission: QuizSubmission
): Promise<ApiResponse<QuizResult>> {
  if (!submission.level) {
    throw new Error('测验难度级别不能为空');
  }
  
  if (!submission.answers || typeof submission.answers !== 'object') {
    throw new Error('答案必须是有效的对象');
  }
  
  // 验证level值
  const validLevels = ['beginner', 'intermediate', 'advanced'];
  if (!validLevels.includes(submission.level)) {
    throw new Error(`难度级别必须是以下之一: ${validLevels.join(', ')}`);
  }
  
  // 验证答案格式
  const validChoices = ['A', 'B', 'C', 'D'];
  for (const [questionId, answer] of Object.entries(submission.answers)) {
    if (!validChoices.includes(answer.toUpperCase())) {
      throw new Error(`题目${questionId}的答案必须是以下之一: ${validChoices.join(', ')}`);
    }
  }
  
  return await apiClient.post<QuizResult>('/quiz/submit/', submission);
}

/**
 * 获取用户答题记录
 * @param level - 难度级别（可选）
 * @returns 答题记录列表
 * 
 * @example
 * ```typescript
 * const records = await fetchQuizHistory();
 * console.log('答题记录:', records.data);
 * ```
 */
export async function fetchQuizHistory(
  level?: string
): Promise<ApiResponse<QuizResult[]>> {
  const params: Record<string, any> = {};
  
  if (level) {
    params.level = level;
  }
  
  return await apiClient.get<QuizResult[]>('/quiz/history/', { params });
}

/**
 * 获取用户测验统计数据
 * @returns 用户测验统计信息
 * 
 * @example
 * ```typescript
 * const stats = await fetchUserQuizStats();
 * console.log('统计数据:', stats.data);
 * ```
 */
export async function fetchUserQuizStats(): Promise<ApiResponse<{
  total_attempts: number;
  average_score: number;
  best_score: number;
  level_stats: Record<string, {
    attempts: number;
    average_score: number;
    best_score: number;
  }>;
  recent_attempts: QuizResult[];
}>> {
  return await apiClient.get('/quiz/stats/');
}

// 注意：以下功能后端暂未提供API端点：
// - 单独的题目详情API
// - 难度级别列表API
// - 测验创建/编辑API（仅管理员功能）
// 如果需要这些功能，需要在后端添加相应的视图