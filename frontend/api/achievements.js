/**
 * 成就相关API工具类
 * 提供获取用户成就列表和授予成就的功能
 */

// 导入API请求工具
import apiClient from './http.js';

/**
 * 获取用户成就列表
 * 需要登录权限
 * @returns {Promise} - 用户的成就列表
 * 
 * @example
 * fetchAchievements()
 *   .then(response => console.log('用户成就列表', response.data))
 *   .catch(error => console.error('获取成就失败', error));
 */
export function fetchAchievements() {
  return apiClient.get('/achievements/');
}

/**
 * 授予用户成就
 * 需要适当的权限
 * @param {number} achievement_id - 成就ID
 * @returns {Promise} - 授予结果
 * 
 * @example
 * grantAchievement(1)
 *   .then(() => console.log('成就授予成功'))
 *   .catch(error => console.error('成就授予失败', error));
 */
export function grantAchievement(achievement_id) {
  // 参数验证
  if (!achievement_id || typeof achievement_id !== 'number') {
    return Promise.reject(new Error('成就ID必须是有效的数字'));
  }
  return apiClient.post('/achievements/grant/', { achievement_id });
}
