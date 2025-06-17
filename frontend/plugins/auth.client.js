import { defineNuxtPlugin } from '#app';
import { useAuthStore } from '~/stores/auth';
import axios from 'axios';

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();

  // On the client side, hydrate the store from localStorage.
  // This is the core of the fix.
  authStore.hydrate();

  // The existing Axios interceptor logic remains unchanged.
  // It handles token refreshing for API requests.
  axios.interceptors.response.use(
    response => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response.status === 401 && !originalRequest._retry && authStore.getRefreshToken) {
        originalRequest._retry = true;

        if (!authStore.isRefreshing) {
            try {
                const newAccessToken = await authStore.refreshToken();
                if (newAccessToken) {
                    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                authStore.logout();
                return Promise.reject(refreshError);
            }
        } else {
            await new Promise(resolve => {
                const interval = setInterval(() => {
                    if (!authStore.isRefreshing) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
             const currentAccessToken = authStore.getAccessToken;
             if (currentAccessToken) {
                originalRequest.headers['Authorization'] = 'Bearer ' + currentAccessToken;
                return axios(originalRequest);
             } else {
                 authStore.logout();
                 return Promise.reject(error);
             }
        }
      }
      return Promise.reject(error);
    }
  );
});
