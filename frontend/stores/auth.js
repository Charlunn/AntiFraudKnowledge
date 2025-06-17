import { defineStore } from 'pinia';
import axios from 'axios';
import { useRuntimeConfig } from '#app';

// Helper function to check if we are in a browser environment
const isBrowser = () => typeof window !== 'undefined';

export const useAuthStore = defineStore('auth', {
  // STATE: Returns a clean, predictable object on the server.
  // Hydration will be handled by a specific action on the client.
  state: () => ({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    user: null,
    isRefreshing: false,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    getAccessToken: (state) => state.accessToken,
    getRefreshToken: (state) => state.refreshToken,
    getUser: (state) => state.user,
  },

  actions: {
    // HYDRATE ACTION: This action will be called ONLY on the client-side.
    hydrate() {
      if (!isBrowser()) return;
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          this.user = JSON.parse(storedUser);
        } else {
          this.user = null;
        }
        this.isAuthenticated = !!this.accessToken;
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        this.user = null;
        this.isAuthenticated = false;
      }
    },

    async login(identifier, password) {
      const runtimeConfig = useRuntimeConfig();
      const API_BASE_URL = runtimeConfig.public.apiBase;

      let loginData = {};
      if (identifier.includes('@')) {
          loginData = { email: identifier, password };
      } else if (/^\d+$/.test(identifier)) {
           loginData = { phone_number: identifier, password };
      } else {
          loginData = { username: identifier, password };
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
        this.logout();
        throw error;
      }
    },

    async fetchUserInfo() {
      if (!this.accessToken) return;
      const runtimeConfig = useRuntimeConfig();
      const API_BASE_URL = runtimeConfig.public.apiBase;

      try {
        const response = await axios.get(`${API_BASE_URL}/users/profile/`, {
            headers: { Authorization: `Bearer ${this.accessToken}` }
        });
        this.user = response.data;
        if (isBrowser()) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Error fetching user info, logging out.', error);
        this.logout(); // Logout on failure
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

    // ... other actions like register, refreshToken can remain largely the same ...
    // But ensure they correctly interact with the new state management
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

    async refreshToken() {
        if (!this.refreshToken) {
            this.logout();
            return null;
        }
        this.isRefreshing = true;
        const runtimeConfig = useRuntimeConfig();
        const API_BASE_URL = runtimeConfig.public.apiBase;
        try {
            const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, { refresh: this.refreshToken });
            const newAccessToken = response.data.access;
            this.accessToken = newAccessToken;
            if (isBrowser()) {
              localStorage.setItem('accessToken', newAccessToken);
            }
            return newAccessToken;
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.logout();
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    },
  },
});
