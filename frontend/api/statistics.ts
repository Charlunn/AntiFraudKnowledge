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
 * 获取平台统计数据
 * @returns 平台统计信息
 * 
 * @example
 * ```typescript
 * const stats = await fetchPlatformStats();
 * ```
 */
export async function fetchPlatformStats(): Promise<ApiResponse<{
  fraud_type_distribution: any[];
  tactic_frequency: any[];
  emotional_triggers: any[];
  fraud_flow: any;
  fraud_cases_yearly: any[];
}>> {
  return await apiClient.get('/statistics/platform/');
}

/**
 * 获取用户统计数据
 * @returns 用户统计信息
 * 
 * @example
 * ```typescript
 * const userStats = await fetchUserStats();
 * ```
 */
export async function fetchUserStats(): Promise<ApiResponse<{
  achievements: any[];
  skills: any[];
}>> {
  return await apiClient.get('/statistics/user/');
}

// 注意：测验统计功能已移至 quiz API 模块
// 请使用 quiz.ts 中的 fetchQuizStats() 函数

// 注意：后端暂未提供聊天统计API
// 如需聊天统计功能，请联系后端开发人员添加相应接口

// 注意：反馈统计功能已移至 feedback API 模块
// 请使用 feedback.ts 中的 fetchFeedbackStats() 函数

// 注意：成就统计功能已移至 achievements API 模块
// 请使用 achievements.ts 中的 fetchAchievementStats() 函数

// 注意：内容统计功能后端暂未提供API端点
// 相关统计数据可通过各模块的API获取

// 注意：实时统计功能后端暂未提供API端点
// 如需实时数据，可考虑使用WebSocket或定时轮询其他API

// 注意：后端暂未提供统计报告导出功能
// 如需导出功能，请联系后端开发人员添加相应接口