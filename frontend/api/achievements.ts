/**
 * 成就系统相关API工具类
 * 提供获取用户成就、授予成就等功能
 */

import { apiClient } from './base';
import type {
  Achievement,
  UserAchievement,
  ApiResponse,
  PaginatedResponse
} from '~/types/api';

/**
 * 获取当前用户成就列表
 * @returns 用户成就列表
 * 
 * @example
 * ```typescript
 * // 获取当前用户成就
 * const myAchievements = await fetchUserAchievements();
 * ```
 */
export async function fetchUserAchievements(): Promise<ApiResponse<UserAchievement[]>> {
  return await apiClient.get<UserAchievement[]>('/achievements/my/');
}

/**
 * 获取所有可用成就列表（带用户完成状态）
 * @returns 成就列表
 * 
 * @example
 * ```typescript
 * // 获取所有成就
 * const allAchievements = await fetchAllAchievements();
 * ```
 */
export async function fetchAllAchievements(): Promise<ApiResponse<Achievement[]>> {
  return await apiClient.get<Achievement[]>('/achievements/all/');
}

/**
 * 授予用户成就（管理员功能）
 * @param userId - 用户ID
 * @param achievementId - 成就ID
 * @returns 授予结果
 * 
 * @example
 * ```typescript
 * await grantAchievement(123, 1);
 * console.log('成就授予成功');
 * ```
 */
export async function grantAchievement(
  userId: number,
  achievementId: number
): Promise<ApiResponse<{ message: string }>> {
  if (!userId) {
    throw new Error('用户ID不能为空');
  }
  
  if (!achievementId) {
    throw new Error('成就ID不能为空');
  }
  
  return await apiClient.post<{ message: string }>('/achievements/grant/', {
    user_id: userId,
    achievement_id: achievementId
  });
}

/**
 * 获取成就详情
 * @param achievementId - 成就ID
 * @returns 成就详细信息
 * 
 * @example
 * ```typescript
 * const achievement = await fetchAchievementDetail(1);
 * console.log('成就详情:', achievement.data);
 * ```
 */
export async function fetchAchievementDetail(
  achievementId: number
): Promise<ApiResponse<Achievement>> {
  if (!achievementId) {
    throw new Error('成就ID不能为空');
  }
  
  return await apiClient.get<Achievement>(`/achievements/${achievementId}/`);
}

/**
 * 获取用户成就统计
 * @returns 成就统计信息
 * 
 * @example
 * ```typescript
 * const stats = await fetchAchievementStats();
 * console.log('成就统计:', stats.data);
 * ```
 */
export async function fetchAchievementStats(): Promise<ApiResponse<{
  total_achievements: number;
  user_achievements: number;
  completion_rate: number;
  remaining_achievements: number;
}>> {
  return await apiClient.get('/achievements/stats/');
}

// 注意：以下功能后端暂未提供API端点
// - fetchAchievementCategories: 获取成就分类列表
// - checkUserAchievement: 检查用户是否拥有指定成就