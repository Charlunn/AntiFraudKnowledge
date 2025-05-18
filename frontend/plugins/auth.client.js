import { defineNuxtPlugin } from '#app';
import { useAuthStore } from '~/stores/auth';
import axios from 'axios'; // Import axios

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();

  // Call the initializeAuth action on app startup
  await authStore.initializeAuth();

  // Configure Axios Interceptor
  axios.interceptors.response.use(
    response => response, // Pass through successful responses
    async (error) => {
      const originalRequest = error.config;

      // If the error is 401 Unauthorized and it's not the refresh token request itself
      // and we have a refresh token
      if (error.response.status === 401 && !originalRequest._retry && authStore.getRefreshToken) {
        originalRequest._retry = true; // Mark the request for retry

        // If not already refreshing, attempt to refresh the token
        if (!authStore.isRefreshing) {
            try {
                const newAccessToken = await authStore.refreshToken();

                // If token refresh was successful, update the request header with the new token
                if (newAccessToken) {
                    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                    // Retry the original request with the new token
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, logout the user and reject the promise
                authStore.logout();
                return Promise.reject(refreshError);
            }
        } else {
            // If already refreshing, wait for the refresh to complete and then retry
            // This prevents multiple simultaneous refresh requests
            await new Promise(resolve => {
                const interval = setInterval(() => {
                    if (!authStore.isRefreshing) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100); // Check every 100ms
            });
             // After waiting, get the potentially new access token from the store
             const currentAccessToken = authStore.getAccessToken;
             if (currentAccessToken) {
                originalRequest.headers['Authorization'] = 'Bearer ' + currentAccessToken;
                return axios(originalRequest);
             } else {
                 // If after waiting there's still no access token, the refresh might have failed
                 // and the user was logged out by another process.
                 authStore.logout(); // Ensure logout state
                 return Promise.reject(error); // Reject with the original 401 error
             }
        }
      }

      // If the error is not 401, or it's the refresh token request that failed,
      // or refresh failed, or it's already retried and failed, reject the promise
      return Promise.reject(error);
    }
  );
});
