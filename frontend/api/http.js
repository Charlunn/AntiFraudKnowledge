import axios from 'axios';
import { useRuntimeConfig } from '#imports';
import { useAuthStore } from '~/stores/auth';

const api = axios.create();

api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  const runtime = useRuntimeConfig();
  config.baseURL = runtime.public.apiBase;
  return config;
});

export default api;
