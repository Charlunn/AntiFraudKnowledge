import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css', '~/assets/css/animations.css'],
  // 页面过渡配置
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  runtimeConfig: {
    public: {
      // 始终使用 /api 路径，通过代理转发到后端
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  },
  // 开发服务器默认配置
  // Nuxt会自动选择可用端口（优先3000）
  devServer: {
    port: 3000
  },
  // 配置代理，将API请求转发到后端
  nitro: {
    // 生产环境和开发环境都使用的代理配置
    routeRules: {
      '/api/**': {
        proxy: process.env.DOCKER_ENV ? 'http://backend:8000/api/**' : 'http://127.0.0.1:8000/api/**'
      }
    }
  },
  // 添加兼容性日期配置以消除警告
  compatibilityDate: '2025-09-02',
  // 配置Vue Router以忽略/@vite/client路径警告
  hooks: {
    'vite:extendConfig': (config, { isClient, isServer }) => {
      if (isClient) {
        config.server = config.server || {};
        config.server.hmr = config.server.hmr || {};
        config.server.hmr.overlay = false;
      }
    }
  }
});
