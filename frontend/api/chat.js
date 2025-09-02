/**
 * 聊天API工具类
 * 提供与AI聊天机器人交互的功能
 */

// 导入API请求工具
import apiClient from './http.js';

/**
 * 发送聊天消息
 * @param {string} message - 用户消息内容
 * @param {boolean} [reset=false] - 是否重置对话
 * @returns {Promise} - AI回复结果
 * 
 * @example
 * // 发送普通消息
 * sendMessage('你好，什么是电信诈骗？')
 *   .then(response => {
 *     console.log('AI回复:', response.data.reply);
 *     console.log('风险评分:', response.data.score);
 *   })
 *   .catch(error => console.error('发送消息失败', error));
 * 
 * // 重置对话并发送新消息
 * sendMessage('你好，重新开始对话', true)
 *   .then(response => console.log('新对话开始:', response.data.reply))
 *   .catch(error => console.error('重置对话失败', error));
 */
export function sendMessage(message, reset = false) {
  // 参数验证
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return Promise.reject(new Error('消息内容不能为空'));
  }
  return apiClient.post('/chat/', { message, reset });
}
