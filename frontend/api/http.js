import axios from 'axios';
import { useRuntimeConfig } from '#imports';

/**
 * 创建axios实例
 * 基础API请求工具，自动处理认证、错误和响应
 */
const apiClient = axios.create({
  timeout: 30000, // 请求超时时间（30秒）
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 请求拦截器
 * 自动添加认证token并设置基础URL
 */
apiClient.interceptors.request.use((config) => {
  // 获取运行时配置
  const runtime = useRuntimeConfig();
  
  // 设置基础URL
  config.baseURL = runtime.public.apiBase || '/api';
  
  // 从cookie获取认证token
  const authToken = useCookie('auth-token');
  if (authToken.value) {
    config.headers.Authorization = `Token ${authToken.value}`;
  }
  
  return config;
}, (error) => {
  // 请求错误处理
  return Promise.reject(error);
});

/**
 * 响应拦截器
 * 统一处理错误响应
 */
apiClient.interceptors.response.use((response) => {
  // 直接返回响应数据
  return response;
}, async (error) => {
  // 处理常见错误情况
  if (error.response) {
    const { status, data } = error.response;
    
    // 处理不同HTTP状态码
    switch (status) {
      case 401:
        // 未授权，清除认证状态
        if (process.client) {
          const { useAuthStore } = await import('~/stores/auth');
          const auth = useAuthStore();
          auth.clear();
        }
        console.error('认证失败，请重新登录');
        break;
      case 403:
        console.error('权限不足');
        break;
      case 404:
        console.error('请求的资源不存在');
        break;
      case 500:
        console.error('服务器内部错误');
        break;
      default:
        // For 400 errors, the 'data' object often contains detailed validation errors.
        // Logging the whole object provides more context than a generic message.
        console.error('请求失败:', data || '未知错误');
    }
  } else if (error.request) {
    console.error('网络错误，请检查您的网络连接');
  } else {
    console.error('请求配置错误:', error.message);
  }
  
  return Promise.reject(error);
});

/**
 * API工具类使用说明：
 * 1. 引入方式：import { 方法名 } from '~/api/模块名'
 * 2. 错误处理：所有API方法返回Promise，请使用try/catch捕获错误
 * 3. 认证：已登录用户的请求会自动携带认证token
 * 4. 基础URL：根据环境配置自动设置
 */

export default apiClient;
