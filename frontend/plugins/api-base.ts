import { apiClient } from '~/services/api'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const baseURL = process.server ? config.apiBase : config.public.apiBase

  if (baseURL) {
    apiClient.baseURL = baseURL
  }
})
