import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', 'nuxt-icon'],
  css: ['~/assets/css/main.css', '~/assets/css/animations.css'],
  // ҳ
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  runtimeConfig: {
    public: {
      // ʼʹ /api ·ͨת
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      // OAuthܿ
      enableOAuthLogin: process.env.ENABLE_OAUTH_LOGIN === 'true'
    }
  },
  // 
  devServer: {
    port: 3000,
    // ôAPIת
    proxy: {
      '/api': {
        target: process.env.DOCKER_ENV === 'true' ? 'http://backend:8000' : 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // 
  nitro: {
    routeRules: {
      '/api/**': {
        proxy: process.env.DOCKER_ENV ? 'http://backend:8000/api/**' : 'http://127.0.0.1:8000/api/**'
      }
    }
  },
  // Ӽ
  compatibilityDate: '2025-09-02',
  // TypeScript
  typescript: {
    strict: true,
    typeCheck: false
  },
  devtools: {
    enabled: false
  },
  // Vite
  vite: {
    resolve: {
      alias: {
        '~/api': '/api'
      }
    },
    server: {
      hmr: {
        overlay: false
      },
      watch: {
        usePolling: true,
        interval: 500,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.nuxt/**',
          '**/.output/**',
          '**/.pnpm-store/**',
          '**/node-compile-cache/**'
        ]
      }
    },
    optimizeDeps: {
      include: ['echarts', 'vue-echarts']
    },
    logLevel: 'error'
  },
  viteNode: {
    fetchTimeout: 60000,
    fetchInterval: 200
  },
  // Vue RouterԺ@vite/client·
  hooks: {
    'vite:extendConfig': (config, { isClient }) => {
      if (isClient) {
        config.server = config.server || {}
        config.server.hmr = config.server.hmr || {}
        config.server.hmr.overlay = false
      }
    }
  }
})
