/**
 * 测试记录相关API工具类
 * 提供获取用户测试记录、统计数据等功能
 */

import { apiClient } from './base';
import type { ApiResponse, PaginatedResponse } from '~/types/api';

/**
 * 测试记录接口
 */
export interface TestRecord {
  id: number;
  scenario_type: string;
  difficulty: string;
  score: number;
  conversation_rounds: number;
  ai_feedback: string;
  suggestions: string;
  created_at: string;
  updated_at: string;
}

/**
 * 测试记录统计接口
 */
export interface TestRecordStats {
  total_tests: number;
  average_score: number;
  best_score: number;
  total_rounds: number;
  difficulty_stats: Record<string, {
    count: number;
    average_score: number;
    display_name: string;
  }>;
  scenario_stats: Record<string, {
    count: number;
    average_score: number;
  }>;
  recent_tests: TestRecord[];
}

/**
 * 创建测试记录
 * @param data - 测试记录数据
 * @returns 创建的测试记录
 * 
 * @example
 * ```typescript
 * const record = await createTestRecord({
 *   scenario_type: 'phone_scam',
 *   difficulty: 'medium',
 *   score: 85,
 *   conversation_rounds: 12,
 *   ai_feedback: 'AI反馈内容',
 *   suggestions: '改进建议'
 * });
 * ```
 */
export async function createTestRecord(data: {
  scenario_type: string;
  difficulty: string;
  score: number;
  conversation_rounds: number;
  ai_feedback: string;
  suggestions: string;
}): Promise<ApiResponse<TestRecord>> {
  return await apiClient.post<TestRecord>('/test-records/create/', data);
}

/**
 * 获取用户测试记录列表
 * @param page - 页码（可选）
 * @param pageSize - 每页数量（可选）
 * @returns 测试记录列表
 * 
 * @example
 * ```typescript
 * const records = await fetchTestRecords(1, 10);
 * console.log('测试记录:', records.data);
 * ```
 */
export async function fetchTestRecords(
  page?: number,
  pageSize?: number
): Promise<ApiResponse<TestRecord[]>> {
  const params: Record<string, any> = {};
  
  if (page) {
    params.page = page;
  }
  if (pageSize) {
    params.page_size = pageSize;
  }
  
  return await apiClient.get<TestRecord[]>('/test-records/list/', { params });
}

/**
 * 获取测试记录详情
 * @param id - 测试记录ID
 * @returns 测试记录详情
 * 
 * @example
 * ```typescript
 * const record = await fetchTestRecordDetail(123);
 * console.log('测试记录详情:', record.data);
 * ```
 */
export async function fetchTestRecordDetail(id: number): Promise<ApiResponse<TestRecord>> {
  return await apiClient.get<TestRecord>(`/test-records/detail/${id}/`);
}

/**
 * 获取用户测试记录统计数据
 * @returns 测试记录统计信息
 * 
 * @example
 * ```typescript
 * const stats = await fetchTestRecordStats();
 * console.log('统计数据:', stats.data);
 * ```
 */
export async function fetchTestRecordStats(): Promise<ApiResponse<TestRecordStats>> {
  return await apiClient.get<TestRecordStats>('/test-records/stats/');
}

/**
 * 保存测试记录（兼容旧接口）
 * @param data - 测试记录数据
 * @returns 保存的测试记录
 * 
 * @deprecated 请使用 createTestRecord 替代
 */
export async function saveTestRecord(data: {
  scenario_type: string;
  difficulty: string;
  score: number;
  conversation_rounds: number;
  ai_feedback: string;
  suggestions: string;
  replace_latest?: boolean;
}): Promise<ApiResponse<TestRecord>> {
  return await apiClient.post<TestRecord>('/test-records/save/', data);
}