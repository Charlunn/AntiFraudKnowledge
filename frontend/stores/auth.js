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
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
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
      delete axios.defaults.headers.common['Authorization'];
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
    async login(credentials) {
      try {
        const response = await axios.post('/users/login/', credentials);
        const { access, refresh, user } = response.data;
        this.setTokens(access, refresh);
        this.setUser(user);
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        this.logout();
        throw error; // Re-throw to handle in component
      }
    },
    async register(userData) {
      try {
        const response = await axios.post('/users/register/', userData);
        // Assuming successful registration might return tokens or user data
        // If your backend automatically logs in after registration, you might set tokens here
        // For now, just return true on success
        return response.data;
      } catch (error) {
        console.error('Registration failed:', error);
        throw error; // Re-throw to handle in component
      }
    },
    async refreshToken() {
        this.isRefreshing = true;
        try {
            const response = await axios.post('/users/token/refresh/', {
                refresh: this.refreshToken,
            });
            const newAccessToken = response.data.access;
            this.setTokens(newAccessToken, this.refreshToken);
            // axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            return newAccessToken;
        } catch (refreshError) {
            this.logout();
            throw refreshError;
        } finally {
            this.isRefreshing = false;
        }
    },
  },
});
