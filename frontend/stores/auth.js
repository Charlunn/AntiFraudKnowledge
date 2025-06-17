import { defineStore } from 'pinia';
import axios from 'axios';
import { useRuntimeConfig } from '#app';

// Helper function to check if we are in a browser environment
const isBrowser = () => typeof window !== 'undefined';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: isBrowser() ? !!localStorage.getItem('accessToken') : false,
    accessToken: isBrowser() ? localStorage.getItem('accessToken') : null,
    refreshToken: isBrowser() ? localStorage.getItem('refreshToken') : null,
    user: isBrowser() ? JSON.parse(localStorage.getItem('user') || 'null') : null,
    isRefreshing: false,
  }),
  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    getAccessToken: (state) => state.accessToken,
    getRefreshToken: (state) => state.refreshToken,
    getUser: (state) => state.user,
  },
  actions: {
    async login(identifier, password) {
      const runtimeConfig = useRuntimeConfig();
      const API_BASE_URL = runtimeConfig.public.apiBase;

      let loginData = {};
      if (identifier.includes('@')) {
          loginData = { email: identifier, password: password };
      } else if (/^\d+$/.test(identifier)) {
           loginData = { phone_number: identifier, password: password };
      } else {
          loginData = { username: identifier, password: password };
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/users/login/`, loginData);
        const result = response.data;

        this.accessToken = result.access;
        this.refreshToken = result.refresh;

        if (isBrowser()) {
          localStorage.setItem('accessToken', result.access);
          localStorage.setItem('refreshToken', result.refresh);
        }

        await this.fetchUserInfo();
        this.isAuthenticated = true;

        return result;
      } catch (error) {
        throw error;
      }
    },
    async register(formData) {
         const runtimeConfig = useRuntimeConfig();
         const API_BASE_URL = runtimeConfig.public.apiBase;
         try {
            const response = await axios.post(`${API_BASE_URL}/users/register/`, formData);
            return response.data;
         } catch (error) {
            throw error;
         }
    },
    async fetchUserInfo() {
      const runtimeConfig = useRuntimeConfig();
      const API_BASE_URL = runtimeConfig.public.apiBase;
      const accessToken = this.accessToken || (isBrowser() ? localStorage.getItem('accessToken') : null);

      if (!accessToken) {
          this.logout();
          return;
      }

      try {
          const response = await axios.get(`${API_BASE_URL}/users/profile/`, {
              headers: { Authorization: `Bearer ${accessToken}` }
          });
          this.user = response.data;
          if (isBrowser()) {
            localStorage.setItem('user', JSON.stringify(response.data));
          }
      } catch (error) {
          console.error('Error fetching user info:', error);
          this.logout();
          throw error;
      }
  },
    async refreshToken() {
        const runtimeConfig = useRuntimeConfig();
        const API_BASE_URL = runtimeConfig.public.apiBase;
        const refreshToken = this.refreshToken || (isBrowser() ? localStorage.getItem('refreshToken') : null);

        if (!refreshToken) {
            this.logout();
            return null;
        }

        try {
            this.isRefreshing = true;
            const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, { refresh: refreshToken });
            const newAccessToken = response.data.access;

            this.accessToken = newAccessToken;
            if (isBrowser()) {
              localStorage.setItem('accessToken', newAccessToken);
            }
            this.isRefreshing = false;
            return newAccessToken;
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.logout();
            this.isRefreshing = false;
            throw error;
        }
    },
    logout() {
      this.isAuthenticated = false;
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      if (isBrowser()) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },
    initializeAuth() {
      if (!isBrowser()) return; // Prevent running on server

      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (accessToken && refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        try {
             this.fetchUserInfo().then(() => {
                this.isAuthenticated = true;
             });
        } catch (error) {
             console.error('Failed to initialize auth:', error);
             this.logout();
        }
      } else {
          this.logout();
      }
    },
  },
});
