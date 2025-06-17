// https://nuxt.com/docs/api/configuration/nuxt-config

import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', 'nuxt-echarts', '@vueuse/nuxt', '@nuxt/ui'],
  // Nuxt UI 配置 (可选)
  ui: {
    // global: true, // 全局注册组件
    // icons: ['mdi', 'heroicons'] // 使用的图标集
  },
  // ECharts 按需加载配置
  echarts: {
    charts: [
      'GraphChart', //力导向图
      'PieChart',//饼图
      'BarChart',//柱状图
      'RadarChart',//雷达图
      'SankeyChart'//桑基图
    ],
    components: [
      'LegendComponent',
      'TitleComponent',
      'TooltipComponent',
      'GridComponent',
    ],
    features: []
  },

  // 运行时配置，用于 API URL
  runtimeConfig: {
    public: {
      // 从环境变量读取，提供本地开发默认值，简化初始设置
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000/api' // 默认到后端url
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
