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
 * 获取用户成就列表
 * @param userId - 用户ID（可选，不传则获取当前用户）
 * @param page - 页码（可选）
 * @param pageSize - 每页数量（可选）
 * @returns 用户成就列表
 * 
 * @example
 * ```typescript
 * // 获取当前用户成就
 * const myAchievements = await fetchUserAchievements();
 * 
 * // 获取指定用户成就
 * const userAchievements = await fetchUserAchievements(123);
 * 
 * // 分页获取成就
 * const pagedAchievements = await fetchUserAchievements(undefined, 1, 10);
 * ```
 */
export async function fetchUserAchievements(
  userId?: number,
  page?: number,
  pageSize?: number
): Promise<ApiResponse<PaginatedResponse<UserAchievement>>> {
  const params: Record<string, any> = {};
  
  if (userId) {
    params.user_id = userId;
  }
  
  if (page) {
    params.page = page;
  }
  
  if (pageSize) {
    params.page_size = pageSize;
  }
  
  return await apiClient.get<PaginatedResponse<UserAchievement>>('/achievements/user/', { params });
}

/**
 * 获取所有可用成就列表
 * @param category - 成就分类（可选）
 * @returns 成就列表
 * 
 * @example
 * ```typescript
 * // 获取所有成就
 * const allAchievements = await fetchAllAchievements();
 * 
 * // 获取指定分类成就
 * const quizAchievements = await fetchAllAchievements('quiz');
 * ```
 */
export async function fetchAllAchievements(
  category?: string
): Promise<ApiResponse<Achievement[]>> {
  const params: Record<string, any> = {};
  
  if (category) {
    params.category = category;
  }
  
  return await apiClient.get<Achievement[]>('/achievements/', { params });
}

/**
 * 授予用户成就
 * @param userId - 用户ID
 * @param achievementId - 成就ID
 * @returns 授予结果
 * 
 * @example
 * ```typescript
 * await grantAchievement(123, 'first_quiz_completed');
 * console.log('成就授予成功');
 * ```
 */
export async function grantAchievement(
  userId: number,
  achievementId: string
): Promise<ApiResponse<UserAchievement>> {
  if (!userId) {
    throw new Error('用户ID不能为空');
  }
  
  if (!achievementId) {
    throw new Error('成就ID不能为空');
  }
  
  return await apiClient.post<UserAchievement>('/achievements/grant/', {
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
 * const achievement = await fetchAchievementDetail('first_quiz_completed');
 * console.log('成就详情:', achievement.data);
 * ```
 */
export async function fetchAchievementDetail(
  achievementId: string
): Promise<ApiResponse<Achievement>> {
  if (!achievementId) {
    throw new Error('成就ID不能为空');
  }
  
  return await apiClient.get<Achievement>(`/achievements/${achievementId}/`);
}

/**
 * 获取用户成就统计
 * @param userId - 用户ID（可选，不传则获取当前用户）
 * @returns 成就统计信息
 * 
 * @example
 * ```typescript
 * const stats = await fetchAchievementStats();
 * console.log('成就统计:', stats.data);
 * ```
 */
export async function fetchAchievementStats(
  userId?: number
): Promise<ApiResponse<{
  total_achievements: number;
  earned_achievements: number;
  completion_rate: number;
  recent_achievements: UserAchievement[];
}>> {
  const params: Record<string, any> = {};
  
  if (userId) {
    params.user_id = userId;
  }
  
  return await apiClient.get('/achievements/stats/', { params });
}

/**
 * 获取成就分类列表
 * @returns 成就分类列表
 * 
 * @example
 * ```typescript
 * const categories = await fetchAchievementCategories();
 * console.log('成就分类:', categories.data);
 * ```
 */
export async function fetchAchievementCategories(): Promise<ApiResponse<string[]>> {
  return await apiClient.get<string[]>('/achievements/categories/');
}

/**
 * 检查用户是否拥有指定成就
 * @param userId - 用户ID（可选，不传则检查当前用户）
 * @param achievementId - 成就ID
 * @returns 是否拥有成就
 * 
 * @example
 * ```typescript
 * const hasAchievement = await checkUserAchievement('first_quiz_completed');
 * if (hasAchievement.data.has_achievement) {
 *   console.log('用户已拥有此成就');
 * }
 * ```
 */
export async function checkUserAchievement(
  achievementId: string,
  userId?: number
): Promise<ApiResponse<{ has_achievement: boolean; earned_at?: string }>> {
  if (!achievementId) {
    throw new Error('成就ID不能为空');
  }
  
  const params: Record<string, any> = { achievement_id: achievementId };
  
  if (userId) {
    params.user_id = userId;
  }
  
  return await apiClient.get('/achievements/check/', { params });
}