/**
 * 测验相关API工具类
 * 提供获取题目列表和提交答案的功能
 */

// 导入API请求工具
import apiClient from './http.js';

/**
 * 获取测验题目列表
 * @param {string|number} [level] - 题目难度级别（可选）
 * @returns {Promise} - 题目列表
 * 
 * @example
 * // 获取所有题目
 * fetchQuestions()
 *   .then(response => console.log('所有题目:', response.data))
 *   .catch(error => console.error('获取题目失败', error));
 * 
 * // 获取指定难度的题目
 * fetchQuestions('easy')
 *   .then(response => console.log('简单难度题目:', response.data))
 *   .catch(error => console.error('获取题目失败', error));
 */
export function fetchQuestions(level) {
  const params = {};
  if (level) {
    params.level = level;
  }
  return apiClient.get('/quiz/questions/', { params });
}

/**
 * 提交测验答案
 * @param {string|number} level - 测验难度级别
 * @param {Object} answers - 答案对象，格式为 { questionId: answerValue, ... }
 * @returns {Promise} - 测验结果，包含得分
 * 
 * @example
 * submitAnswers('easy', {
 *   '1': 'A',
 *   '2': 'B',
 *   '3': 'C'
 * })
 *   .then(response => {
 *     console.log('得分:', response.data.score);
 *   })
 *   .catch(error => console.error('提交答案失败', error));
 */
export function submitAnswers(level, answers) {
  // 参数验证
  if (!level) {
    return Promise.reject(new Error('测验难度级别不能为空'));
  }
  if (!answers || typeof answers !== 'object') {
    return Promise.reject(new Error('答案必须是有效的对象'));
  }
  return apiClient.post('/quiz/submit/', { level, answers });
}
