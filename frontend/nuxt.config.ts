import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000/api'
    }
  }
});
