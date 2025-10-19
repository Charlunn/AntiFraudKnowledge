import { defineNuxtConfig } from 'nuxt/config'

const serverApiBase =
  process.env.API_BASE_SERVER ||
  process.env.NUXT_API_BASE_SERVER ||
  'http://api:8000'

const clientApiBase =
  process.env.API_BASE_CLIENT ||
  process.env.NUXT_PUBLIC_API_BASE ||
  'http://localhost:8000'

const normalizedServerApiBase = serverApiBase.replace(/\/+$/, '')
const devProxyTarget = process.env.API_PROXY_TARGET || serverApiBase
const nitroProxyTarget =
  process.env.API_PROXY_TARGET && process.env.API_PROXY_TARGET.includes('/**')
    ? process.env.API_PROXY_TARGET
    : `${normalizedServerApiBase}/api/**`

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', 'nuxt-icon'],
  css: ['~/assets/css/main.css', '~/assets/css/animations.css'],
  // ҳ
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  runtimeConfig: {
    // 仅服务端可见
    apiBase: serverApiBase,
    public: {
      // 浏览器端使用
      apiBase: clientApiBase,
      // OAuthܿ
      enableOAuthLogin: process.env.ENABLE_OAUTH_LOGIN === 'true'
    }
  },
  // 
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    // ôAPIת
    proxy: {
      '/api': {
        target: devProxyTarget,
        changeOrigin: true,
        secure: false
      }
    }
  },
  // 
  nitro: {
    routeRules: {
      '/api/**': {
        proxy: nitroProxyTarget
      }
    }
  },
  // Ӽ
  compatibilityDate: '2025-09-02',
  experimental: {
    appManifest: false
  },
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
