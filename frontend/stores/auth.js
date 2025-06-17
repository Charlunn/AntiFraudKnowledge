import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    isRefreshing: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    getAccessToken: (state) => state.accessToken,
    getRefreshToken: (state) => state.refreshToken,
    currentUser: (state) => state.user,
  },
  actions: {
    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    },
    setUser(user) {
      this.user = user;
    },
    logout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    initializeAuth() {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        if (token) {
            this.accessToken = token;
            this.refreshToken = refreshToken;
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // You might want to fetch user details here if they are not stored locally
        }
    },
    async refreshToken() {
        this.isRefreshing = true;
        try {
            const response = await axios.post('/api/users/token/refresh/', {
                refresh: this.refreshToken,
            });
            const newAccessToken = response.data.access;
            this.setTokens(newAccessToken, this.refreshToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            return newAccessToken;
        } catch (error) {
            this.logout();
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    },
  },
});
