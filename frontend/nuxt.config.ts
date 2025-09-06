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
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      // OAuth功能开关
      enableOAuthLogin: process.env.ENABLE_OAUTH_LOGIN === 'true'
    }
  },
  // 开发服务器配置
  devServer: {
    port: 3000,
    // 配置代理，将API请求转发到后端
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // 生产环境代理配置
  nitro: {
    routeRules: {
      '/api/**': {
        proxy: process.env.DOCKER_ENV ? 'http://backend:8000/api/**' : 'http://127.0.0.1:8000/api/**'
      }
    }
  },
  // 添加兼容性日期配置以消除警告
  compatibilityDate: '2025-09-02',
  // TypeScript配置
  typescript: {
    strict: true,
    typeCheck: false
  },
  // Vite配置
  vite: {
    resolve: {
      alias: {
        '~/api': '/api'
      }
    },
    server: {
      hmr: {
        overlay: false
      }
    }
  },
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
