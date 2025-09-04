/**
 * API工具类统一入口文件
 * 导出所有API模块和基础工具
 */

// 导出基础API客户端和异常类
export { apiClient, ApiException } from './base';

// 导出所有API模块
export * as auth from './auth';
export * as quiz from './quiz';
export * as achievements from './achievements';
export * as feedback from './feedback';
export * as chat from './chat';
export * as statistics from './statistics';
export * as community from './community';

// 导出类型定义
export type * from '~/types/api';

// 便捷的默认导出
export default {
  auth: () => import('./auth'),
  quiz: () => import('./quiz'),
  achievements: () => import('./achievements'),
  feedback: () => import('./feedback'),
  chat: () => import('./chat'),
  statistics: () => import('./statistics'),
  community: () => import('./community')
};