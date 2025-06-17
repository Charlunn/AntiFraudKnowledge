// https://nuxt.com/docs/api/configuration/nuxt-config

import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', 'nuxt-echarts', '@vueuse/nuxt', '@nuxt/ui'],
  
  build: {
    transpile: ['echarts', 'echarts-wordcloud'],
  },

  // Nuxt UI 配置 (可选)
  ui: {
    // global: true, // 全局注册组件
    // icons: ['mdi', 'heroicons'] // 使用的图标集
  },
  // ECharts 按需加载配置 [14, 19, 20, 21, 22]
  echarts: {
    charts: ['GraphChart'], // 必须包含 GraphChart [17, 23, 24, 25, 26, 27]
    components: [
      'LegendComponent', // 图例 [13, 17, 37]
      'TitleComponent', // 标题 (可选)
      // 'ToolboxComponent', // 工具箱 (可选, 如保存图片)
      // 'DataZoomComponent', // 区域缩放 (如果需要)
    ],
    features: []
  },

  // 运行时配置，用于 API URL [10]
  runtimeConfig: {
    public: {
      // 从环境变量读取，提供本地开发默认值，简化初始设置
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000/api' // Default to your backend URL
    }
  },

  // CSS 配置
  css: [
    '~/assets/css/main.css'
  ],

  // postcss: { // 如果手动配置 Tailwind (且未使用 Nuxt UI)
  //   plugins: {
  //     tailwindcss: {},
  //     autoprefixer: {},\
  //   },
  // },

});
