import { defineStore } from 'pinia';
import { fetchProfile } from '~/api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },
  actions: {
    initialize() {
      if (process.client) {
        const saved = localStorage.getItem('auth');
        if (saved) {
          const data = JSON.parse(saved);
          this.accessToken = data.accessToken;
          this.refreshToken = data.refreshToken;
          if (data.user) {
            this.user = data.user;
          }
        }
      }
    },
    setTokens(access, refresh) {
      this.accessToken = access;
      this.refreshToken = refresh;
      this.persistState();
    },
    setUser(user) {
      this.user = user;
      this.persistState();
    },
    async fetchUser() {
      if (this.accessToken && !this.user) {
        try {
          const response = await fetchProfile();
          this.setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          if (error.response && error.response.status === 401) {
            this.clear();
          }
        }
      }
    },
    clear() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      if (process.client) {
        localStorage.removeItem('auth');
      }
    },
    persistState() {
        if (process.client) {
            const data = {
                accessToken: this.accessToken,
                refreshToken: this.refreshToken,
                user: this.user,
            };
            localStorage.setItem('auth', JSON.stringify(data));
        }
    }
  },
});
