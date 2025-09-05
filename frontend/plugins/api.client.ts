/**
 * API客户端Nuxt.js插件
 * 将API工具类注入到应用中，并与状态管理集成
 */

import apiClient from '~/api/http';
import * as auth from '~/api/auth';
import * as quiz from '~/api/quiz';
import * as achievements from '~/api/achievements';
import * as feedback from '~/api/feedback';
import * as chat from '~/api/chat';
import * as statistics from '~/api/statistics';
import * as community from '~/api/community';

export default defineNuxtPlugin((nuxtApp) => {
  // 获取运行时配置
  const config = useRuntimeConfig();
  
  // 设置API基础URL
  if (config.public.apiBase) {
    apiClient.defaults.baseURL = config.public.apiBase;
  }
  
  // 延迟获取认证状态管理，避免在Pinia初始化前调用
  let authStore = null;
  
  // 设置请求拦截器，自动添加认证令牌
  apiClient.interceptors.request.use(
    async (config) => {
      // 延迟初始化authStore
      if (!authStore && process.client) {
        try {
          const { $pinia } = useNuxtApp();
          if ($pinia) {
            const { useAuthStore } = await import('~/stores/auth');
            authStore = useAuthStore();
          }
        } catch (error) {
          console.warn('AuthStore not available yet:', error);
        }
      }
      const token = authStore?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // 设置响应拦截器，处理认证失效
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // 处理401未授权错误
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // 确保authStore已初始化
          if (!authStore && process.client) {
            try {
              const { $pinia } = useNuxtApp();
              if ($pinia) {
                const { useAuthStore } = await import('~/stores/auth');
                authStore = useAuthStore();
              }
            } catch (error) {
              console.warn('AuthStore not available for refresh:', error);
              return Promise.reject(error);
            }
          }
          
          // 尝试使用刷新令牌获取新的访问令牌
          const refreshToken = authStore?.refreshToken;
          if (refreshToken) {
            const response = await $fetch('/users/refresh/', {
              method: 'POST',
              baseURL: config.public.apiBase,
              body: { refresh_token: refreshToken }
            });
            
            // 更新令牌
            authStore.setTokens(response.access_token, response.refresh_token);
            
            // 重新发送原始请求
            originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // 刷新令牌失效，清除认证状态并跳转到登录页
          if (authStore) {
            authStore.clear();
          }
          await navigateTo('/login');
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  // 创建API实例对象
  const api = {
    client: apiClient,
    auth,
    quiz,
    achievements,
    feedback,
    chat,
    statistics,
    community
  };
  
  // 将API实例注入到Nuxt应用中
  nuxtApp.provide('api', api);
  
  // 在服务端渲染时，确保API客户端可用
  if (process.server) {
    nuxtApp.ssrContext!.api = api;
  }
});

// 声明模块类型，以便在组件中使用
declare module '#app' {
  interface NuxtApp {
    $api: {
      client: typeof apiClient;
      auth: typeof auth;
      quiz: typeof quiz;
      achievements: typeof achievements;
      feedback: typeof feedback;
      chat: typeof chat;
      statistics: typeof statistics;
      community: typeof community;
    };
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: {
      client: typeof apiClient;
      auth: typeof auth;
      quiz: typeof quiz;
      achievements: typeof achievements;
      feedback: typeof feedback;
      chat: typeof chat;
      statistics: typeof statistics;
      community: typeof community;
    };
  }
}