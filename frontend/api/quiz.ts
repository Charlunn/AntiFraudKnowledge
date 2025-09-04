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
 * @param level - 测验难度级别
 * @param answers - 答案对象，格式为 { questionId: answerValue, ... }
 * @returns 测验结果，包含得分
 * 
 * @example
 * ```typescript
 * const result = await submitAnswers('easy', {
 *   '1': 'A',
 *   '2': 'B',
 *   '3': 'C'
 * });
 * console.log('得分:', result.data.score);
 * ```
 */
export async function submitAnswers(
  level: string,
  answers: Record<string, string>
): Promise<ApiResponse<QuizResult>> {
  if (!level) {
    throw new Error('测验难度级别不能为空');
  }
  
  if (!answers || Object.keys(answers).length === 0) {
    throw new Error('答案不能为空');
  }
  
  const data: QuizSubmission = {
    level,
    answers
  };
  
  return await apiClient.post<QuizResult>('/quiz/submit/', data);
}

/**
 * 获取用户答题记录
 * @param page - 页码（可选）
 * @param pageSize - 每页数量（可选）
 * @returns 答题记录列表
 * 
 * @example
 * ```typescript
 * const records = await fetchQuizRecords();
 * console.log('答题记录:', records.data);
 * ```
 */
export async function fetchQuizRecords(
  page?: number,
  pageSize?: number
): Promise<ApiResponse<PaginatedResponse<QuizResult>>> {
  const params: Record<string, any> = {};
  
  if (page) {
    params.page = page;
  }
  
  if (pageSize) {
    params.page_size = pageSize;
  }
  
  return await apiClient.get<PaginatedResponse<QuizResult>>('/quiz/records/', { params });
}

/**
 * 获取测验统计信息
 * @returns 测验统计数据
 * 
 * @example
 * ```typescript
 * const stats = await fetchQuizStats();
 * console.log('测验统计:', stats.data);
 * ```
 */
export async function fetchQuizStats(): Promise<ApiResponse<{
  total_attempts: number;
  average_score: number;
  best_score: number;
  completion_rate: number;
}>> {
  return await apiClient.get('/quiz/stats/');
}

/**
 * 获取题目详情
 * @param questionId - 题目ID
 * @returns 题目详细信息
 * 
 * @example
 * ```typescript
 * const question = await fetchQuestionDetail(1);
 * console.log('题目详情:', question.data);
 * ```
 */
export async function fetchQuestionDetail(questionId: number): Promise<ApiResponse<Question>> {
  if (!questionId) {
    throw new Error('题目ID不能为空');
  }
  
  return await apiClient.get<Question>(`/quiz/questions/${questionId}/`);
}

/**
 * 获取可用的难度级别列表
 * @returns 难度级别列表
 * 
 * @example
 * ```typescript
 * const levels = await fetchQuizLevels();
 * console.log('可用难度:', levels.data);
 * ```
 */
export async function fetchQuizLevels(): Promise<ApiResponse<string[]>> {
  return await apiClient.get<string[]>('/quiz/levels/');
}