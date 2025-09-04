/**
 * 反馈API工具类
 * 提供提交用户反馈的功能
 */

// 导入API请求工具
import apiClient from './http.js';

/**
 * 提交用户反馈
 * 需要登录权限
 * @param {Object} data - 反馈信息
 * @param {string} data.message - 反馈内容
 * @param {string} [data.type] - 反馈类型（可选）
 * @param {string} [data.contact] - 联系方式（可选）
 * @returns {Promise} - 提交结果
 * 
 * @example
 * submitFeedback({
 *   message: '这个应用非常有用！',
 *   type: 'suggestion',
 *   contact: 'user@example.com'
 * })
 *   .then(() => console.log('反馈提交成功'))
 *   .catch(error => console.error('反馈提交失败', error));
 */
export function submitFeedback(data) {
  // 参数验证
  if (!data || !data.message || typeof data.message !== 'string' || data.message.trim() === '') {
    return Promise.reject(new Error('反馈内容不能为空'));
  }
  return apiClient.post('/feedback/create/', data);
}
